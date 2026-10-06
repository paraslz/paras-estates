// Operating cost per tonne FFB, with each line broken into its parts. Shared by estate.html and the Cheekah page.
window.costTableHTML=function(cd,fmt,pill,pct){
 const NA="N/A",na=v=>v==null,f=(v,c)=>na(v)?NA:fmt(v,2)+(c?"*":""),vr=(a,b)=>na(a)||na(b)?NA:pill(pct(a,b),true);
 let h="",anyCalc=false;
 (cd.groups||[]).forEach((g,i)=>{
  const items=g.items||[];
  h+=`<tr class="grp${items.length?" exp":""}" data-g="${i}"><td>${items.length?'<span class="car">▾</span>':""}<b>${g.name}</b></td><td><b>${f(g.actual,g.calc)}</b></td><td>${f(g.budget,g.calc||g.budgetCalc)}</td><td>${vr(g.actual,g.budget)}</td></tr>`;
  items.forEach(it=>{if(it.calc||g.calc||g.budgetCalc)anyCalc=true;
   h+=`<tr class="sub" data-p="${i}"><td>${it.item}</td><td>${f(it.actual,it.calc||g.calc)}</td><td>${f(it.budget,it.calc||g.calc)}</td><td>${vr(it.actual,it.budget)}</td></tr>`});
 });
 const t=cd.total||{};if(t.calc||t.budgetCalc)anyCalc=true;
 h+=`<tr class="tot"><td><b>Total operating cost</b></td><td><b>${f(t.actual,t.calc)}</b></td><td>${f(t.budget,t.calc||t.budgetCalc)}</td><td>${vr(t.actual,t.budget)}</td></tr>`;
 return {html:h,note:anyCalc?"* Worked out from the report's RM amounts ÷ FFB tonnes for the same period; not printed per tonne in the report.":""};
};
window.costTableWire=function(tbody){tbody.querySelectorAll("tr.grp.exp").forEach(r=>r.addEventListener("click",()=>{const open=!r.classList.toggle("shut");tbody.querySelectorAll(`tr.sub[data-p="${r.dataset.g}"]`).forEach(s=>s.hidden=!open)}))};
