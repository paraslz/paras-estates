// Ask = open the viewer's own Claude with this estate's report pack. No cost to PARAS.
(function(){
 const form=document.getElementById("askForm");if(!form)return;
 const slug=window.__SLUG__||document.body.dataset.slug||new URLSearchParams(location.search).get("e");if(!slug)return;
 const url=`${window.__SITE__||location.origin}/kb/${slug}.txt`;
 const DEF="Give me a short summary of this estate's latest reports and the main issues to look out for.";
 const qEl=document.getElementById("q");
 const prompt=t=>`Please read this PARAS estate report pack and answer using only what it says, citing the report for each figure: ${url}\n\nMy question: ${(t||"").trim()||DEF}`;
 window.PARAS_ASK=t=>{window.open("https://claude.ai/new?q="+encodeURIComponent(prompt(t)),"_blank","noopener")};
 form.addEventListener("submit",e=>{e.preventDefault();e.stopImmediatePropagation();window.PARAS_ASK(qEl.value)},true);
 const send=document.getElementById("send");if(send)send.textContent="Ask in Claude ↗";
 const note=document.createElement("p");note.className="byoL";note.textContent="Opens in your own Claude account.";form.insertAdjacentElement("afterend",note);
})();
