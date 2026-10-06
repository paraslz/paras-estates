import type { Context, Config } from "@netlify/functions";

type Msg = { role: "user" | "assistant"; content: string };

const RULES = `You answer questions from company directors about one oil palm estate, using ONLY the report extracts provided.
Rules:
- Answer in 1–6 short numbered points, plain language, mobile friendly. Lead with the direct answer.
- After each figure, cite the report in brackets, e.g. (PA 2/2026) or (Agronomy 1/2026).
- Give fertiliser doses in grams per palm. Money in RM.
- If the extracts do not contain the answer, say so plainly. Never guess or use outside knowledge.
- If the user names a block that does not exist on this estate, say so and list the closest real block names.
- Where two reports disagree, give both figures and flag the discrepancy.
- No markdown headings, no tables.`;

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") return Response.json({ error: "Use POST." }, { status: 405 });

  const key = (Netlify.env.get("ANTHROPIC_API_KEY") || "").trim();
  if (!key) return Response.json({ error: "Ask is not switched on yet. The site owner needs to add the Claude API key in Netlify." }, { status: 503 });

  let body: { slug?: string; messages?: Msg[] };
  try { body = await req.json(); } catch { return Response.json({ error: "Bad request." }, { status: 400 }); }

  const slug = String(body.slug || "").replace(/[^a-z0-9-]/g, "");
  const msgs = (Array.isArray(body.messages) ? body.messages : [])
    .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-10)
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (!slug || !msgs.length || msgs[msgs.length - 1].role !== "user") return Response.json({ error: "Bad request." }, { status: 400 });
  while (msgs.length && msgs[0].role !== "user") msgs.shift();

  const origin = new URL(req.url).origin;
  const dr = await fetch(`${origin}/data/${slug}.json`);
  if (!dr.ok) return Response.json({ error: "Unknown estate." }, { status: 404 });
  const data = await dr.json();
  const kb: string = String(data.kb || "").slice(0, 60000);
  if (!kb) return Response.json({ error: "No report extracts for this estate yet." }, { status: 404 });

  const headers = {
    "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json",
    ...(Netlify.env.get("ANTHROPIC_WORKSPACE_ID") ? { "anthropic-workspace-id": String(Netlify.env.get("ANTHROPIC_WORKSPACE_ID")).trim() } : {})
  };
  const base: Record<string, unknown> = {
    model: Netlify.env.get("ASK_MODEL") || "claude-sonnet-5-5",
    max_tokens: 4000, // covers any thinking plus the answer
    system: [
      { type: "text", text: RULES },
      { type: "text", text: `ESTATE: ${data.name}\n\nREPORT EXTRACTS:\n${kb}`, cache_control: { type: "ephemeral" } }
    ],
    messages: msgs
  };
  const call = (body: Record<string, unknown>) => fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers, body: JSON.stringify(body) });
  // Low effort keeps answers quick and cheap; fall back without it if the model rejects the setting.
  let r = await call({ ...base, output_config: { effort: "low" } });
  if (r.status === 400) r = await call(base);
  if (r.status === 429) return Response.json({ error: "Too many questions at once. Try again in a minute." }, { status: 429 });
  if (!r.ok) {
    const t = await r.text(); console.log("anthropic error", r.status, t);
    let type = "", msg = "";
    try { const e = JSON.parse(t).error || {}; type = e.type || ""; msg = String(e.message || ""); } catch {}
    let why = `Ask isn't available right now (code ${r.status}${type ? ", " + type : ""}).`;
    if (r.status === 401 || type === "authentication_error") why = "Ask isn't available: the Claude API key was rejected (code 401). The site owner should check the key in Netlify.";
    else if (r.status === 403 || type === "permission_error") why = "Ask isn't available: the Claude API key isn't allowed to do this (code 403).";
    else if (/credit balance/i.test(msg)) why = "Ask isn't available: the Claude API account has no credit. The site owner should add credit in the Anthropic Console.";
    else if (r.status === 404 || type === "not_found_error") why = "Ask isn't available: the AI model name wasn't found (code 404).";
    return Response.json({ error: why }, { status: 502 });
  }
  const j = await r.json();
  let text = (j.content || []).filter((c: any) => c.type === "text").map((c: any) => c.text).join("\n").trim();
  if (j.stop_reason === "max_tokens") text += (text ? "\n\n" : "") + "(Answer cut short. Ask a narrower question for the rest.)";
  return Response.json({ text: text || "No answer was returned. Try rephrasing the question." });
};

export const config: Config = { path: "/api/ask" };
