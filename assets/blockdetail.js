/* Block detail renderer, shared by estate.html and bespoke pages.
   detail = {manuring:[rows], spraying:[rows], fertNext/fertNow/fertPrev:{year,rows}, pests:[rows], yield, harvesting, pruning, nutrients, field, other}
   row = {k, v, src}. Rendered as compact two-column tables; older-year records tucked into a fold. */
(function(){
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const rows=r=>(Array.isArray(r)?r:(r&&r.rows)||[]).filter(x=>x&&(x.v||x.k));
// drop in-text report references like "(Agro Table 7, to Mar 2026)" or "(PA photo)" — the source line covers them
const tidy=v=>String(v||"").replace(/\s*\((?=[^()]*\b(?:Table|Tables|Appendix|App\.|Agro|PA|photos?|Section|Fig\.?|Figure|as printed)\b)[^()]*\)/g,"").replace(/^PA photo:\s*/i,"").replace(/\s{2,}/g," ").trim();
const yrs=s=>(String(s).match(/\b20\d\d\b/g)||[]).map(Number);
const srcs=r=>{const s=[...new Set(r.map(x=>x.src).filter(Boolean))];return s.length?`<p class="bsrc">From ${s.map(esc).join(" · ")}</p>`:""};
const table=r=>`<table class="bt"><tbody>${r.map(x=>`<tr><th scope="row">${esc(tidy(x.k))}</th><td>${esc(tidy(x.v))}</td></tr>`).join("")}</tbody></table>`;
const older=(label,inner)=>`<details class="older"><summary>${label}</summary>${inner}</details>`;
function split(r,latest){ // current vs earlier-year rows, by the years named in the row label
 const cur=[],old=[];r.forEach(x=>{const y=yrs(x.k);(y.length&&Math.max(...y)<latest?old:cur).push(x)});
 return cur.length?{cur,old}:{cur:old,old:[]};
}
function section(r,latest){
 const {cur,old}=split(r,latest);
 const oy=[...new Set(old.flatMap(x=>yrs(x.k)))].sort().join(", ");
 return table(cur)+(old.length?older(`Earlier records${oy?" ("+esc(oy)+")":""} · ${old.length}`,table(old)):"")+srcs(r);
}
// fertiliser: Month | Fertiliser | g/palm, with totals/notes as small lines
const isMon=k=>/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(String(k||"").trim());
function fertTable(f){
 const R=rows(f),body=[],notes=[];
 const main=R.filter(x=>!/^(total|sum|note|remark|original|revised|amend)/i.test(String(x.k||"")));
 if(main.length&&main.filter(x=>isMon(x.k)).length<main.length/2)return table(R)+srcs(R);
 R.forEach(x=>{let k=tidy(x.k),v=tidy(x.v);
  if(/^(total|sum|note|remark|original|revised|amend)/i.test(k)){notes.push(`${k.replace(/\s*\(computed\)/i,"")}: ${v}`);return}
  let mon=k,fert="",dose="",how="";
  const kc=k.match(/^([A-Za-z]{3,9}(?:\s*[–-]\s*[A-Za-z]{3,9})?)\s*,\s*(.+)$/);if(kc){mon=kc[1];fert=kc[2]}
  const m=v.match(/^(.*?)\s*([\d,.]+)\s*g\b(?:\s*(?:\/|per)\s*palm)?\s*(.*)$/i);
  if(m){fert=(fert||m[1]).replace(/[,:;]\s*$/,"");dose=m[2];how=m[3].replace(/^[,;\s]+/,"").replace(/^\((.*)\)$/,"$1")}else{fert=fert||v}
  body.push(`<tr><th scope="row">${esc(mon)}</th><td>${esc(fert)}${how?`<small>${esc(how)}</small>`:""}</td><td class="n">${esc(dose)||"–"}</td></tr>`)});
 return (body.length?`<table class="bt ft"><thead><tr><th>Month</th><th>Fertiliser</th><th class="n">g/palm</th></tr></thead><tbody>${body.join("")}</tbody></table>`:"")
  +(notes.length?`<ul class="bnote">${notes.map(n=>`<li>${esc(n)}</li>`).join("")}</ul>`:"")+srcs(R);
}
function fertHTML(d){
 const now=d.fertNow&&rows(d.fertNow).length?d.fertNow:null,prev=d.fertPrev&&rows(d.fertPrev).length?d.fertPrev:null,next=d.fertNext&&rows(d.fertNext).length?d.fertNext:null;
 const main=now||next||prev;if(!main)return "";
 let h=`<h5>${esc(main.year||"")} programme</h5>`+fertTable(main);
 if(next&&main!==next)h+=older(`Next year: ${esc(next.year||"")} programme`,fertTable(next));
 if(prev&&main!==prev)h+=older(`Previous year: ${esc(prev.year||"")} programme`,fertTable(prev));
 return h;
}
// progress bars (same look as the Overview "Field programme" card)
const notDue=n=>/not (yet )?due|due (in|from|by)|scheduled for|not yet scheduled/i.test(n||"");
const MO=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const monIdx=t=>{const m=String(t||"").toLowerCase().match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b(?![\s\S]*\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))/);return m?MO.indexOf(m[1]):-1};
function bars(list,period){
 const end=monIdx(period);
 list=list.map(b=>{const lm=monIdx((String(b.k).match(/\(([^)]*)\)/)||[])[1]);return b.pct===0&&end>=0&&lm>end?{...b,due:true}:b});
 return `${period?`<p class="bsub">${esc(period)}</p>`:""}<div class="pbars">${list.map(b=>{const nd=b.due||(b.pct===0&&notDue(b.note));const v=nd?0:Math.max(4,Math.min(100,b.pct));
  const c=nd?"var(--line)":b.pct>=90?"var(--good)":b.pct>=75?"var(--warn)":"var(--bad)";
  return `<div class="pb"><div class="pl">${esc(b.k)}${b.note&&!(nd&&/^not (done|applied)/i.test(b.note))?`<small>${esc(b.note)}</small>`:""}</div><span class="tr"><span class="fl" style="width:${v}%;--c:${c}"></span></span><span class="pn">${nd?"not due":b.pct+"%"}${b.calc?"<sup>*</sup>":""}</span></div>`}).join("")}</div>`
  +(list.some(b=>b.calc)?`<p class="bsrc">* worked out from the report's done and programme figures</p>`:"");
}
function progSection(k,d,latest){
 const pr=d.progress&&d.progress[k];const r=rows(d[k]);
 if(!pr||!pr.length)return r.length?section(r,latest):"";
 let h=bars(pr,d.progress[k+"Period"]);
 if(r.length){const {cur,old}=split(r,latest);const oy=[...new Set(old.flatMap(x=>yrs(x.k)))].sort().join(", ");
  if(cur.length)h+=older(`Notes · ${cur.length}`,table(cur));
  if(old.length)h+=older(`Earlier records${oy?" ("+esc(oy)+")":""} · ${old.length}`,table(old));}
 return h+srcs(pr.concat(r));
}
const SECS=[["yield","Yield & crop"],["manuring","Manuring progress"],["spraying","Spraying & weeding"],["fert","Fertiliser programme"],["pests","Pests & diseases"],
 ["harvesting","Harvesting"],["pruning","Pruning & canopy"],["nutrients","Leaf & soil nutrients"],["field","Field condition"],["other","Other remarks"]];
const OPEN=new Set(["manuring","spraying","fert","pests"]);
window.blockDetailHTML=function(d){
 if(!d)return "";
 const all=Object.entries(d).filter(([k])=>k!=="progress").flatMap(([,v])=>rows(v)),Y=all.flatMap(x=>yrs(x.k)),latest=Y.length?Math.max(...Y):9999;
 const out=[],none=[];
 SECS.forEach(([k,t])=>{
  const body=k==="fert"?fertHTML(d):(k==="manuring"||k==="spraying")?progSection(k,d,latest):(rows(d[k]).length?section(rows(d[k]),latest):"");
  if(!body){if(k!=="other")none.push(t);return}
  out.push(`<details class="fold bfold"${OPEN.has(k)?" open":""}><summary><span class="t">${t}</span></summary><div class="body">${body}</div></details>`)});
 if(none.length)out.push(`<p class="note">Not covered block by block in the latest reports: ${none.join(", ").toLowerCase()}.</p>`);
 return out.join("");
};
const EW={manuring:"Manuring",spraying:"Spraying & weeding",pests:"Pests & diseases",yield:"Yield & crop",harvesting:"Harvesting",pruning:"Pruning",nutrients:"Nutrients",field:"Field",labour:"Labour",staff:"Staff",costs:"Costs",other:"Other"};
window.estateWideHTML=function(w){
 if(!w)return "";
 const ks=Object.keys(w).filter(k=>rows(w[k]).length);if(!ks.length)return "";
 const Y=ks.flatMap(k=>rows(w[k])).flatMap(x=>yrs(x.k)),latest=Y.length?Math.max(...Y):9999;
 return ks.map(k=>`<h5>${esc(EW[k]||k)}</h5>${section(rows(w[k]),latest)}`).join("");
};
})();
