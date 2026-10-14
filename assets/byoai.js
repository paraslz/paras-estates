// Ask = open the viewer's own Claude with this estate's report pack. No cost to PARAS.
(function(){
 const form=document.getElementById("askForm");if(!form)return;
 const slug=window.__SLUG__||document.body.dataset.slug||new URLSearchParams(location.search).get("e");if(!slug)return;
 const url=`${window.__SITE__||location.origin}/kb/${slug}.txt`;
 const G=slug==="group";
 const DEF=G?"Give me a short summary of the group's latest position and the estates that need attention most.":"Give me a short summary of this estate's latest reports and the main issues to look out for.";
 const qEl=form.querySelector("input");
 const prompt=t=>`Please read this PARAS ${G?"group":"estate"} report pack and answer using only what it says, citing the report for each figure: ${url}\n\nMy question: ${(t||"").trim()||DEF}`;
 window.PARAS_ASK=t=>{window.open("https://claude.ai/new?q="+encodeURIComponent(prompt(t)),"_blank","noopener")};
 form.addEventListener("submit",e=>{e.preventDefault();e.stopImmediatePropagation();window.PARAS_ASK(qEl.value)},true);
 const send=document.getElementById("send");if(send)send.textContent="Ask in Claude ↗";
 const note=document.createElement("p");note.className="byoL";note.textContent="Opens in your own Claude account.";form.insertAdjacentElement("afterend",note);
})();

/* Floating "Ask AI" balloon: the Ask card becomes a compact pop-up panel opened from a button that follows the scroll. */
(function(){
 const box=document.getElementById("askBox");if(!box||document.getElementById("askFab"))return;
 const css=`
 .askWrap.floated{display:none}
 #askFab{position:fixed;right:12px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:60;display:flex;align-items:center;gap:5px;
  padding:8px 12px;border:0;border-radius:22px;background:var(--accent);color:#fff;font:600 14px var(--f-body,system-ui);
  box-shadow:0 3px 10px rgba(0,0,0,.2);opacity:.95;cursor:pointer}
 #askFab svg{width:16px;height:16px;flex:none}
 #askFab[hidden]{display:none}
 #askPanel{position:fixed;z-index:61;right:12px;left:12px;bottom:calc(12px + env(safe-area-inset-bottom));max-height:min(78vh,560px);overflow:auto;
  background:var(--panel,#fff);border:1px solid var(--line,#ddd);border-radius:14px;box-shadow:0 10px 32px rgba(0,0,0,.28);padding:14px 14px 10px}
 @media (min-width:640px){#askPanel{left:auto;width:400px}}
 #askPanel[hidden]{display:none}
 #askPanel .card{border:0;box-shadow:none;padding:0;margin:0;background:transparent}
 #askPanel h2{font-size:19px;margin:0 30px 4px 0}
 #askPanel .sub{font-size:14px;margin:0 0 8px}
 #askPanel .chips{flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px;margin-bottom:8px;scrollbar-width:none}
 #askPanel .chips button{white-space:nowrap;max-width:none;flex:none;font-size:14.5px}
 #askPanel .byoL{font-size:13.5px;margin:6px 0 0}
 #askX{position:absolute;top:8px;right:8px;width:34px;height:34px;border:0;border-radius:17px;background:var(--bg,#eee);color:var(--fg,#222);font-size:20px;line-height:1;cursor:pointer}`;
 const st=document.createElement("style");st.textContent=css;document.head.append(st);
 const est=/estate/i.test((box.querySelector("h2")||{}).textContent||"")||!!document.getElementById("t-blocks");
 const fab=document.createElement("button");fab.id="askFab";fab.type="button";fab.setAttribute("aria-label","Ask AI about this "+(est?"estate":"group"));
 fab.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>Ask AI';
 const pan=document.createElement("div");pan.id="askPanel";pan.hidden=true;pan.setAttribute("role","dialog");pan.setAttribute("aria-label","Ask AI");
 const x=document.createElement("button");x.id="askX";x.type="button";x.setAttribute("aria-label","Close");x.textContent="×";
 const wrap=box.closest(".askWrap");pan.append(x,box);document.body.append(pan,fab);if(wrap)wrap.classList.add("floated");
 const q=box.querySelector("form input");
 const open=focus=>{pan.hidden=false;fab.hidden=true;if(focus&&q&&matchMedia("(min-width:640px)").matches)q.focus()};
 const close=()=>{pan.hidden=true;fab.hidden=false};
 window.PARAS_OPEN_ASK=open;
 fab.addEventListener("click",()=>open(true));x.addEventListener("click",close);
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!pan.hidden)close()});
 document.addEventListener("click",e=>{const cb=e.target.closest&&e.target.closest("#chips button");if(cb){if(cb.dataset.q&&window.PARAS_ASK)window.PARAS_ASK(cb.dataset.q);setTimeout(close,300);return}
  if(e.target.closest&&e.target.closest(".askblock"))open(false);
  else if(!pan.hidden&&!pan.contains(e.target)&&e.target!==fab&&!fab.contains(e.target))close()},true);
 // after sending, tuck the panel away
 const ask0=window.PARAS_ASK;if(ask0)window.PARAS_ASK=t=>{ask0(t);setTimeout(close,300)};
})();
