(function(){
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=(n,d=0)=>n==null?"–":Number(n).toLocaleString("en-MY",{minimumFractionDigits:d,maximumFractionDigits:d});
const pct=(a,b)=>(a==null||b==null||!b)?null:(a-b)/b*100;
const nm=e=>e.name.replace(/^Ladang /,"").replace(/ Estate$/,"");
const pill=(v,goodIfNeg)=>{if(v==null)return"";const g=goodIfNeg?v<=0:v>=0;const c=Math.abs(v)<3?"warn":(g?"good":"bad");return `<span class="pill ${c}">${v>0?"+":""}${v.toFixed(0)}%</span>`};
const lvl=(v,costSide)=>{if(v==null)return null;const x=costSide?v:-v;return x<=5?0:x<=15?1:2};
const rpill=(v,costSide)=>{const l=lvl(v,costSide);return `<span class="pill ${["good","warn","bad"][l]}">${v>0?"+":""}${v.toFixed(0)}%</span>`};
const PRICE_KEY="paras.ffbPrice";
let E=[];

function flag(e){
 const y=pct(e.yph,e.yphBudget),c=pct(e.cop,e.copBudget);
 const ly=lvl(y,false),lc=lvl(c,true);
 const L=[ly,lc].filter(x=>x!=null);const worst=L.length?Math.max(...L):null;
 const why=[];if(ly===2)why.push(`yield ${Math.abs(y).toFixed(0)}% below budget`);if(lc===2)why.push(`cost/t ${c.toFixed(0)}% over budget`);
 return {y,c,worst,why};
}
function totals(){
 const s=k=>E.reduce((t,e)=>t+((e.area||{})[k]||0),0);
 $("gS").textContent=`${E.length} estates. Areas as stated in each estate's latest report.`;
 $("tot").innerHTML=[["Estates",E.length,0],["Planted ha",s("planted"),0],["Mature ha",s("mature"),0],["Immature & replant ha",s("immature")+s("replant"),0]]
  .map(([k,v,d])=>`<div><div class="k">${k}</div><div class="v">${fmt(v,d)}</div></div>`).join("");
}
const PS=window.PSITE||{},FS=PS.fyStart||1,CUR=PS.cur||2026;const MON0=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];const MON=MON0.slice(FS-1).concat(MON0.slice(0,FS-1));const YLAB=y=>FS===1?String(y):`FY${y-1}/${String(y).slice(2)}`;
const list=a=>a.length<=1?a.join(""):a.slice(0,-1).join(", ")+" and "+a[a.length-1];
function production(){
 const F=E.filter(e=>e.ffb);if(!F.length||!window.Chart){$("ffbC").hidden=true;return}
 const name=s=>nm(E.find(e=>e.slug===s)||{name:s});
 const cnt={};F.forEach(e=>Object.keys(e.ffb.years).forEach(y=>cnt[y]=(cnt[y]||0)+1));
 const Y=Object.keys(cnt).filter(y=>cnt[y]>=E.length*0.75).sort();const YT=y=>YLAB(+y);
 const yr=Y.map(y=>{const inc=F.filter(e=>e.ffb.years[y]!=null);return {y,t:inc.reduce((s,e)=>s+e.ffb.years[y],0),n:inc.length,miss:E.filter(e=>!inc.includes(e)).map(nm)}});
 // 2026: the month that lets the most estates be summed Jan to that month
 const cov=e=>[e.slug].concat(e.ffb.with?[e.ffb.with]:[]);
 let best=null;for(let m=1;m<=12;m++){const inc=F.filter(e=>e.ffb.cum26[m]!=null);const c=new Set(inc.flatMap(cov));if(c.size&&(!best||c.size>=best.c.size))best={m,inc,c}}
 let cur=null;
 if(best){const notes=E.filter(e=>!best.c.has(e.slug)).map(e=>{const k=e.ffb?Object.keys(e.ffb.cum26).map(Number):[];const mx=k.length?Math.max(...k):0;
   const h=F.find(x=>x.ffb.with===e.slug);const hx=h?Math.max(...Object.keys(h.ffb.cum26).map(Number)):0;const M=mx||hx;
   return {n:nm(e),why:!M?`no ${YLAB(CUR)} tonnage in the reports`:M<best.m?`reports only to ${MON[M-1]}`:`only a ${MON[0]}–${MON[M-1]} total, no monthly split`}});
  const part=(PS.partial?F:[]).filter(e=>!best.c.has(e.slug)&&Object.keys(e.ffb.cum26).length).map(e=>{const m=Math.max(...Object.keys(e.ffb.cum26).map(Number));return {e,m,t:e.ffb.cum26[m]}});
  cur={label:`${YLAB(CUR)} ${MON[0]}–${MON[best.m-1]}${part.length?"*":""}`,t:best.inc.reduce((s,e)=>s+e.ffb.cum26[best.m],0)+part.reduce((s,x)=>s+x.t,0),n:best.c.size+part.length,m:best.m,part,miss:notes.filter(x=>!part.some(p=>nm(p.e)===x.n))}}
 const t=(()=>{const g=getComputedStyle(document.documentElement),v=n=>g.getPropertyValue(n).trim();Chart.defaults.color=v("--muted");Chart.defaults.font.family="Archivo, system-ui, sans-serif";Chart.defaults.font.size=13;Chart.defaults.maintainAspectRatio=false;return{accent:v("--accent"),fruit:v("--fruit"),ax:{grid:{color:v("--grid")},border:{color:v("--line")}}}})();
 const B=yr.map(r=>({l:[YT(r.y),`${r.n} estates`],t:r.t,c:t.accent}));if(cur)B.push({l:[cur.label,`${cur.n} estates`],t:cur.t,c:t.fruit});
 new Chart($("cFfb"),{type:"bar",data:{labels:B.map(b=>b.l),datasets:[{label:"FFB tonnes",data:B.map(b=>b.t),backgroundColor:B.map(b=>b.c)}]},
  options:{plugins:{legend:{display:false},tooltip:{callbacks:{title:x=>x[0].label.replace(","," · "),label:x=>`${fmt(x.raw)} t`}}},scales:{x:t.ax,y:{...t.ax,min:0,title:{display:true,text:"tonnes FFB"},ticks:{callback:v=>v>=1000?fmt(v/1000)+"k":v}}}}});
 const last=yr[yr.length-1];
 $("ffbS").textContent=`Tonnes of FFB across the estates, summed from each estate's PARAS reports.${last?` ${YT(last.y)}: ${fmt(last.t)} t from ${last.n} estates.`:""}${cur?` ${cur.label}: ${fmt(cur.t)} t from ${cur.n} estates.`:""}`;
 const N=[];
 if(cur){N.push(`${YLAB(CUR)} is summed to ${MON[cur.m-1]}, the latest month that the most estates' reports reach.`);if(cur.part.length){const byM={};cur.part.forEach(x=>(byM[x.m]=byM[x.m]||[]).push(nm(x.e)));N.push(`* The total includes part-year tonnages, as printed, for ${Object.keys(byM).map(m=>`${list(byM[m])} (${MON[0]}–${MON[m-1]} only)`).join("; ")}. Their reports don't yet print the full year, so the total understates the full-year crop.`)}if(cur.miss.length)N.push(`Not included: ${[...new Set(cur.miss.map(x=>x.why))].map(w=>`${list(cur.miss.filter(x=>x.why===w).map(x=>x.n))} (${w})`).join("; ")}.`)}
 if(last&&last.miss.length)N.push(`${YT(last.y)} leaves out ${list(last.miss)}, which have no full-year ${YT(last.y)} tonnage in their reports.`);if(FS>1)N.push(`Years are financial years (${MON[0]}–${MON[11]}).`);
 const chg=yr.filter((r,i)=>i&&r.miss.join()!==yr[i-1].miss.join()).length;if(chg)N.push("The estates included differ slightly from year to year; see the figures by estate.");
 $("ffbN").textContent=N.join(" ");
 // table
 const cols=Y.concat(cur?["2026"]:[]);
 $("ffbH").innerHTML=`<tr><th>Estate</th>${Y.map(y=>`<th>${YT(y)}</th>`).join("")}${cur?`<th>${esc(cur.label)}</th>`:""}</tr>`;
 const cell=v=>v==null?`<td class="x">–</td>`:`<td>${fmt(v)}</td>`;
 const rows=[...E].sort((a,b)=>nm(a).localeCompare(nm(b))).map(e=>{const f=e.ffb||{years:{},cum26:{}};
  const host=F.find(x=>x.ffb.with===e.slug);
  const c26=!cur?"":f.cum26[cur.m]!=null?`<td>${fmt(f.cum26[cur.m])}${f.with?` <small>(incl. ${esc(name(f.with))})</small>`:""}</td>`:host&&host.ffb.cum26[cur.m]!=null?`<td class="x">in ${esc(name(host.slug))}</td>`:(()=>{const k=Object.keys(f.cum26).map(Number).filter(m=>m<cur.m);if(!k.length)return `<td class="x">–</td>`;const m=Math.max(...k);return `<td>${fmt(f.cum26[m])}* <small>(${MON[0]}–${MON[m-1]})</small></td>`})();
  return `<tr><td><a href="${esc(e.href)}">${esc(nm(e))}</a></td>${Y.map(y=>f.years[y]!=null&&f.with?`<td>${fmt(f.years[y])} <small>(incl. ${esc(name(f.with))})</small></td>`:cell(f.years[y])).join("")}${c26}</tr>`});
 $("ffbB").innerHTML=rows.join("")+`<tr class="tot"><td>Total</td>${yr.map(r=>`<td>${fmt(r.t)}</td>`).join("")}${cur?`<td>${fmt(cur.t)}${cur.part&&cur.part.length?"*":""}</td>`:""}</tr>`;
}
function agePie(){
 const C=$("ageC");if(!window.ageProfile||!window.Chart){C.hidden=true;return}
 const Y=CUR,per=E.map(e=>({e,A:ageProfile(e.age||[],Y)})).filter(x=>x.A.tot>0);if(!per.length){C.hidden=true;return}
 const tot={},order=[];per.forEach(x=>x.A.rows.forEach(r=>{if(!(r.k in tot)){tot[r.k]={ha:0,r:r.r};order.push(r.k)}tot[r.k].ha+=r.ha}));
 const pc=v=>v>0&&v<0.5?"<1%":v.toFixed(0)+"%";const K=Object.keys(AGE_COLORS).filter(k=>k in tot),T=K.reduce((s,k)=>s+tot[k].ha,0),col=AGE_COLORS;
 $("gAgeS").textContent=`Share of ${fmt(T)} ha across ${per.length} estates by palm age in ${Y}, from each block's planting year`;
 $("gAgeT").innerHTML=K.map(k=>`<tr><th scope="row"><span class="sw" style="background:${col[k]}"></span>${esc(k)}${tot[k].r?`<small>${tot[k].r}</small>`:""}</th><td class="n">${fmt(tot[k].ha)} ha</td><td class="n"><b>${pc(tot[k].ha/T*100)}</b></td></tr>`).join("");
 const left=E.filter(e=>!per.some(x=>x.e===e)).map(nm),notes=[...new Set(per.flatMap(x=>x.A.notes))];
 $("gAgeN").textContent=(left.length?`No block planting data for ${list(left)}. `:"")+notes.join(" ");
 const g=getComputedStyle(document.documentElement);
 new Chart($("gAge"),{type:"doughnut",data:{labels:K,datasets:[{data:K.map(k=>tot[k].ha),backgroundColor:K.map(k=>col[k]),borderColor:g.getPropertyValue("--panel").trim(),borderWidth:2}]},options:{maintainAspectRatio:false,cutout:"55%",plugins:{legend:{display:false},tooltip:{callbacks:{label:x=>`${x.label}: ${fmt(x.raw)} ha (${(x.raw/T*100).toFixed(0)}%)`}}}}});
 const ab={"Immature":"Imm.","Young mature":"Young","Prime":"Prime","Old":"Old","Over-aged":"Over"};const KT=K.filter(k=>ab[k]);
 $("gAgeH").innerHTML=`<tr><th>Estate</th>${KT.map(k=>`<th title="${esc(k)}">${ab[k]}</th>`).join("")}</tr>`;
 $("gAgeB").innerHTML=per.sort((a,b)=>nm(a.e).localeCompare(nm(b.e))).map(x=>{const m={};x.A.rows.forEach(r=>m[r.k]=r.ha);return `<tr><td><a href="${esc(x.e.href)}">${esc(nm(x.e))}</a></td>${KT.map(k=>m[k]?`<td>${pc(m[k]/x.A.tot*100)}</td>`:`<td class="x">–</td>`).join("")}</tr>`}).join("")
  +`<tr class="tot"><td>Group</td>${KT.map(k=>`<td>${pc(tot[k].ha/T*100)}</td>`).join("")}</tr>`;
}
function attention(){
 const R=E.map(e=>({e,f:flag(e)})).filter(x=>x.f.worst===2).sort((a,b)=>(a.f.y??0)-(b.f.y??0));
 if(!R.length){$("attC").hidden=true;return}
 const row=({e,f})=>`<a href="${esc(e.href)}"><span class="dot r" style="margin-top:6px"></span><span><span class="t">${esc(nm(e))}</span> <span class="r">${esc(f.why.join("; "))}</span></span></a>`;
 const N=5;let all=false;
 const draw=()=>{$("att").innerHTML=(all?R:R.slice(0,N)).map(row).join("")+(R.length>N?`<button type="button" class="byoB" id="attMore">${all?"Show fewer":`Show all ${R.length}`}</button>`:"");
  const m=$("attMore");if(m)m.addEventListener("click",()=>{all=!all;draw()})};
 $("attS").textContent=`${R.length} of ${E.length} estates are red-flagged. Worst 5 shown; full list in the league table below.`;
 draw();
}
function league(){
 const price=parseFloat($("fp").value);const hasP=!isNaN(price)&&price>0;
 const s=$("srt").value;
 const L=E.map(e=>({e,f:flag(e)}));
 const by={flag:(a,b)=>(b.f.worst??-1)-(a.f.worst??-1)||(a.f.y??0)-(b.f.y??0),yld:(a,b)=>(a.f.y??1e9)-(b.f.y??1e9),cost:(a,b)=>(b.f.c??-1e9)-(a.f.c??-1e9),cop:(a,b)=>(b.e.cop??-1)-(a.e.cop??-1),name:(a,b)=>nm(a.e).localeCompare(nm(b.e))}[s];
 L.sort(by);
 const dot=w=>`<span class="dot ${w==null?"n":["g","a","r"][w]}" title="${w==null?"No budget to compare":["On track","Watch","Act"][w]}"></span>`;
 $("lg").innerHTML=L.map(({e,f})=>{const m=hasP&&e.cop!=null?price-e.cop:null;
  return `<tr><td><a href="${esc(e.href)}">${esc(nm(e))}</a><small>${esc(e.period||"–")}</small></td>
  <td>${fmt(e.yph,2)}<small>${f.y!=null?rpill(f.y,false)+" bud":"no budget"}</small></td>
  <td>${e.cop!=null?fmt(e.cop,0):"N/A"}<small>${f.c!=null?rpill(f.c,true)+" bud":(e.cop!=null?"no budget":"")}</small>${hasP&&m!=null?`<small>margin <b style="color:var(${m>=0?"--good":"--bad"})">${fmt(m,0)}</b></small>`:""}</td>
  <td>${dot(f.worst)}</td></tr>`}).join("");
 $("fpN").textContent=hasP?`Margin shown at RM${fmt(price)}/t FFB.`:"";
}
function actions(){
 const A=[];E.forEach(e=>(e.actions||[]).forEach(a=>A.push({...a,e})));
 const rep=A.filter(a=>a.status==="repeat").length,op=A.filter(a=>a.status==="open").length;
 $("aS").textContent=`${A.length} actions from the latest reports: ${rep} raised before and still not done, ${op} new and open. Tap an estate to see its list.`;
 const order={repeat:0,open:1,done:2};
 const cnt={};A.forEach(a=>{if(a.status==="repeat")cnt[a.e.slug]=(cnt[a.e.slug]||0)+1});
 let lim=25;
 const ests=[...new Set(A.map(a=>a.e.slug))].map(s=>E.find(e=>e.slug===s));
 $("aSum").innerHTML=ests.map(e=>({e,r:A.filter(a=>a.e===e&&a.status==="repeat").length,o:A.filter(a=>a.e===e&&a.status==="open").length}))
  .sort((x,y)=>y.r-x.r||y.o-x.o).map(x=>`<tr class="clk" data-s="${esc(x.e.slug)}" tabindex="0"><td><b>${esc(nm(x.e))}</b></td><td>${x.r?`<span class="st repeat">${x.r}</span>`:"0"}</td><td>${x.o}</td></tr>`).join("");
 $("aSum").querySelectorAll("tr").forEach(r=>{const go=()=>{$("aE").value=r.dataset.s;$("aSt").value="";lim=25;draw();$("aH").scrollIntoView({behavior:"smooth"})};r.addEventListener("click",go);r.addEventListener("keydown",e=>{if(e.key==="Enter")go()})});
 const draw=()=>{const fe=$("aE").value,fs=$("aSt").value,q=$("aQ").value.trim().toLowerCase();
  const L=A.filter(a=>(!fe||a.e.slug===fe)&&(!fs||a.status===fs)&&(!q||(a.item+" "+nm(a.e)).toLowerCase().includes(q)))
   .sort((a,b)=>(cnt[b.e.slug]||0)-(cnt[a.e.slug]||0)||nm(a.e).localeCompare(nm(b.e))||(order[a.status]??3)-(order[b.status]??3));
  $("aH").textContent=`${L.length} action${L.length===1?"":"s"}${fe?" · "+nm(E.find(e=>e.slug===fe)):""}${fs?" · "+(fs==="repeat"?"raised before":fs):""}`;
  $("acts").innerHTML=L.slice(0,lim).map(a=>`<tr><td><b>${esc(nm(a.e))}</b> · ${esc(a.item)}<br><small class="sub">${esc(a.src||"")}${a.times?` · raised ${a.times} times`:""}</small></td><td><span class="st ${esc(a.status)}">${a.status==="repeat"?"Raised before":a.status==="done"?"Done":"Open"}</span></td></tr>`).join("")||`<tr><td colspan="2" class="empty">No actions match.</td></tr>`;
  $("aMore").hidden=L.length<=lim;$("aMore").textContent=`Show more (${L.length-lim} left)`};
 $("aMore").addEventListener("click",()=>{lim+=50;draw()});
 [...new Set(A.map(a=>a.e.slug))].map(s=>E.find(e=>e.slug===s)).sort((a,b)=>nm(a).localeCompare(nm(b))).forEach(e=>{const o=document.createElement("option");o.value=e.slug;o.textContent=`${nm(e)} (${(e.actions||[]).length})`;$("aE").append(o)});
 ["aE","aSt","aQ"].forEach(id=>$(id).addEventListener("input",()=>{lim=25;draw()}));draw();
}
fetch("/data/index.json",{cache:"no-cache"}).then(r=>r.json()).then(j=>{E=j.estates;
 try{const p=localStorage.getItem(PRICE_KEY);if(p)$("fp").value=p}catch(e){}
 totals();production();agePie();attention();league();actions();
 $("srt").addEventListener("input",league);
 $("fp").addEventListener("input",()=>{try{localStorage.setItem(PRICE_KEY,$("fp").value)}catch(e){}league()});
});
})();
