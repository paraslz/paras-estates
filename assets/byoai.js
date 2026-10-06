// "Use your own AI": opens Claude with a link to this estate's report pack, or copies the pack for any other AI.
(function(){
 const form=document.getElementById("askForm");if(!form)return;
 const slug=document.body.dataset.slug||new URLSearchParams(location.search).get("e");if(!slug)return;
 const url=`${location.origin}/kb/${slug}.txt`;
 const q=()=>(document.getElementById("q").value||"").trim();
 const intro=()=>`Please read this PARAS estate report pack and answer my questions using only what it says, citing the report for each figure: ${url}\n\nMy question: ${q()||"Give me a short summary of this estate's latest reports and the main issues to look out for."}`;
 const box=document.createElement("div");box.className="byo";
 box.innerHTML=`<span class="byoL">Or ask in your own AI account (no cost to PARAS):</span>
  <a class="byoB" id="byoClaude" href="#" target="_blank" rel="noopener">Open in Claude ↗</a>
  <button type="button" class="byoB" id="byoCopy">Copy for ChatGPT / Gemini</button>
  <span class="byoM" id="byoMsg" aria-live="polite"></span>`;
 form.insertAdjacentElement("afterend",box);
 const a=document.getElementById("byoClaude");
 const upd=()=>{a.href="https://claude.ai/new?q="+encodeURIComponent(intro())};
 upd();document.getElementById("q").addEventListener("input",upd);a.addEventListener("click",upd);
 document.getElementById("byoCopy").addEventListener("click",async()=>{
  const m=document.getElementById("byoMsg");m.textContent="Copying…";
  try{const t=await (await fetch(url)).text();
   await navigator.clipboard.writeText(`Answer my questions about this oil palm estate using only the report pack below.\n\nMy question: ${q()||"Give me a short summary of the latest reports and the main issues to look out for."}\n\n----- REPORT PACK -----\n${t}`);
   m.textContent="Copied. Open ChatGPT or Gemini and paste."}
  catch(e){m.innerHTML=`Couldn't copy. <a href="${url}" target="_blank" rel="noopener">Open the report pack</a> and copy it by hand.`}});
})();
