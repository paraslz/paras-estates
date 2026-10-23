/* Top 5 yield-limiting factors + Top 5 PA issues: tappable tags, bottom pop-up. Shared by estate.html and bespoke pages. */
(function(){
 const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 window.renderTop5=function(el,T){
  T=T||{};const NM={limits:"Yield-limiting factor",pa:"PA issue"},H={limits:"Top 5 yield-limiting factors",pa:"Top 5 PA issues"};
  const ks=["limits","pa"].filter(k=>(T[k]||[]).length);if(!el||!ks.length)return;
  el.className="card topw";
  el.innerHTML=ks.map((k,n)=>`<div><h3 class="th">${H[k]}${n?"":" <span>· tap for figures</span>"}</h3><div class="tchips">${T[k].slice(0,5).map((x,i)=>`<button type="button" class="tchip${i>2?" w":""}" data-k="${k}" data-i="${i}"><i>${i+1}</i>${esc(x.s||x.t)}</button>`).join("")}</div></div>`).join("");
  let sh=document.getElementById("tSheet");
  if(!sh){sh=document.createElement("div");sh.id="tSheet";sh.className="tsheet";sh.hidden=true;
   sh.innerHTML=`<div class="tback" data-x></div><div class="tbox" role="dialog" aria-modal="true" aria-labelledby="tsT"><div class="tgrab"></div><button type="button" class="tx" data-x aria-label="Close">×</button><div class="tsk" id="tsK"></div><h3 id="tsT"></h3><span class="pill bad" id="tsR" hidden>Raised before</span><p id="tsD"></p><div class="ts" id="tsS"></div><div class="tnav"><button type="button" id="tsPrev">‹ Prev</button><button type="button" id="tsNext">Next ›</button></div></div>`;
   document.body.appendChild(sh)}
  const $=id=>document.getElementById(id);let K=null,I=0;
  const L=()=>T[K].slice(0,5);
  const show=()=>{const x=L()[I];$("tsK").textContent=`${NM[K]} ${I+1} of ${L().length}`;$("tsT").textContent=x.t;$("tsR").hidden=!x.rep;$("tsD").textContent=x.d||"";$("tsS").textContent=x.src||"";$("tsPrev").disabled=I==0;$("tsNext").disabled=I==L().length-1};
  const close=()=>{sh.hidden=true;document.body.style.overflow=""};
  el.onclick=e=>{const b=e.target.closest(".tchip");if(!b)return;K=b.dataset.k;I=+b.dataset.i;show();sh.hidden=false;document.body.style.overflow="hidden";$("tsNext").focus({preventScroll:true})};
  sh.onclick=e=>{if(e.target.closest("[data-x]"))close()};
  $("tsPrev").onclick=()=>{if(I>0){I--;show()}};$("tsNext").onclick=()=>{if(I<L().length-1){I++;show()}};
  if(!window._t5k){window._t5k=1;document.addEventListener("keydown",e=>{const s=document.getElementById("tSheet");if(!s||s.hidden)return;if(e.key=="Escape")s.querySelector("[data-x]").click();if(e.key=="ArrowRight")document.getElementById("tsNext").click();if(e.key=="ArrowLeft")document.getElementById("tsPrev").click()})}
 };
})();
