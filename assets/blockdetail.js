/* Block detail renderer, shared by estate.html and bespoke pages.
   detail = {manuring:[rows], spraying:[rows], fertNext/fertNow/fertPrev:{year,rows}, pests:[rows], yield, harvesting, pruning, nutrients, field, other}
   row = {k, v, src} */
(function(){
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const rows=r=>(Array.isArray(r)?r:(r&&r.rows)||[]).filter(x=>x&&(x.v||x.k));
const li=x=>`<li><div class="bk">${esc(x.k||"")}${x.src?` <span class="tag ${/agro/i.test(x.src)?"ag":""}">${esc(x.src)}</span>`:""}</div><div class="bv">${esc(x.v||"")}</div></li>`;
const list=r=>`<ul class="brows">${rows(r).map(li).join("")}</ul>`;
const SECS=[
 ["manuring","Manuring progress","latest rounds, applied vs programme"],
 ["spraying","Spraying & weeding","circle, path, selective, weeds"],
 ["fert","Fertiliser programme","grams per palm"],
 ["pests","Pests & diseases","Ganoderma, rats, bagworm, others"],
 ["yield","Yield & crop",""],
 ["harvesting","Harvesting",""],
 ["pruning","Pruning & canopy",""],
 ["nutrients","Leaf & soil nutrients",""],
 ["field","Field condition","census, drains, roads, replanting"],
 ["other","Other report remarks",""]];
const OPEN=new Set(["manuring","spraying","fert","pests"]);
function fertHTML(d){
 const parts=[["fertNext","Next year"],["fertNow","This year"],["fertPrev","Previous year"]].filter(([k])=>d[k]&&rows(d[k]).length);
 if(!parts.length)return "";
 return parts.map(([k,l])=>`<h5>${esc(d[k].year?d[k].year+" programme":l)}${k==="fertPrev"?" <small>(previous year)</small>":k==="fertNext"?" <small>(next year, recommended)</small>":""}</h5>${list(d[k])}`).join("");
}
window.blockDetailHTML=function(d){
 if(!d)return "";
 const out=[],none=[];
 SECS.forEach(([k,t,s])=>{
  const body=k==="fert"?fertHTML(d):(rows(d[k]).length?list(d[k]):"");
  const n=k==="fert"?["fertNext","fertNow","fertPrev"].reduce((a,x)=>a+rows(d[x]).length,0):rows(d[k]).length;
  if(!body){if(k!=="other")none.push(t);return}
  out.push(`<details class="fold bfold"${OPEN.has(k)?" open":""}><summary><span class="t">${t}</span><span class="s">${n} item${n===1?"":"s"}</span></summary><div class="body">${body}</div></details>`)});
 if(none.length)out.push(`<p class="note">Nothing block-specific in the latest reports on: ${none.join(", ").toLowerCase()}. See the estate-wide notes below.</p>`);
 return out.join("");
};
const EW={manuring:"Manuring",spraying:"Spraying & weeding",pests:"Pests & diseases",yield:"Yield & crop",harvesting:"Harvesting",pruning:"Pruning",nutrients:"Nutrients",field:"Field",labour:"Labour",staff:"Staff",costs:"Costs",other:"Other"};
window.estateWideHTML=function(w){
 if(!w)return "";
 const ks=Object.keys(w).filter(k=>rows(w[k]).length);if(!ks.length)return "";
 return ks.map(k=>`<h5>${esc(EW[k]||k)}</h5>${list(w[k])}`).join("");
};
})();
