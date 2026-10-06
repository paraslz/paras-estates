// Ask = open the viewer's own Claude with this estate's report pack. No cost to PARAS.
(function(){
 const form=document.getElementById("askForm");if(!form)return;
 const slug=document.body.dataset.slug||new URLSearchParams(location.search).get("e");if(!slug)return;
 const url=`${location.origin}/kb/${slug}.txt`;
 const DEF="Give me a short summary of this estate's latest reports and the main issues to look out for.";
 const qEl=document.getElementById("q");
 const prompt=t=>`Please read this PARAS estate report pack and answer using only what it says, citing the report for each figure: ${url}\n\nMy question: ${(t||"").trim()||DEF}`;
 window.PARAS_ASK=t=>{window.open("https://claude.ai/new?q="+encodeURIComponent(prompt(t)),"_blank","noopener")};
 form.addEventListener("submit",e=>{e.preventDefault();e.stopImmediatePropagation();window.PARAS_ASK(qEl.value)},true);
 const send=document.getElementById("send");if(send)send.textContent="Ask in Claude ↗";
 const box=document.createElement("div");box.className="byo";
 box.innerHTML=`<span class="byoL">Opens in your own Claude account. Using ChatGPT or Gemini instead?</span>
  <button type="button" class="byoB" id="byoCopy">Copy question + reports</button>
  <span class="byoM" id="byoMsg" aria-live="polite"></span>`;
 form.insertAdjacentElement("afterend",box);
 document.getElementById("byoCopy").addEventListener("click",async()=>{
  const m=document.getElementById("byoMsg");m.textContent="Copying…";
  try{const t=await (await fetch(url)).text();
   await navigator.clipboard.writeText(`Answer my question about this oil palm estate using only the report pack below, citing the report for each figure.\n\nMy question: ${qEl.value.trim()||DEF}\n\n----- REPORT PACK -----\n${t}`);
   m.textContent="Copied. Open ChatGPT or Gemini and paste."}
  catch(e){m.innerHTML=`Couldn't copy. <a href="${url}" target="_blank" rel="noopener">Open the report pack</a> and copy it by hand.`}});
})();
