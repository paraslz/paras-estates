(function(){
const $=id=>document.getElementById(id);
const fmt=(n,d=0)=>n==null||isNaN(n)?"–":Number(n).toLocaleString("en-MY",{minimumFractionDigits:d,maximumFractionDigits:d});
const pct=(a,b)=>(a==null||b==null||!b)?null:(a-b)/b*100;
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function pill(v,goodIfNeg){if(v==null||!isFinite(v))return"";const g=goodIfNeg?v<=0:v>=0;const c=Math.abs(v)<3?"warn":(g?"good":"bad");return `<span class="pill ${c}">${v>0?"+":""}${v.toFixed(0)}%</span>`}
const C={good:"var(--good)",warn:"var(--warn)",bad:"var(--bad)"};
const slug=(new URLSearchParams(location.search).get("e")||"").replace(/[^a-z0-9-]/g,"");
let D=null,curBlock=null;const built={};

/* tabs */
const TABS=["overview","blocks","money","field","actions","reports"];
function showTab(t){if(!TABS.includes(t))t="overview";TABS.forEach(n=>$("t-"+n).hidden=n!==t);document.querySelectorAll('[role="tab"]').forEach(b=>b.setAttribute("aria-selected",b.dataset.t===t?"true":"false"));try{history.replaceState(null,"",location.pathname+location.search+"#"+t)}catch(e){}const tb=document.querySelector(".tabs");if(window.scrollY>tb.offsetTop)window.scrollTo({top:tb.offsetTop});buildCharts(t)}
document.querySelectorAll('[role="tab"]').forEach(b=>b.addEventListener("click",()=>showTab(b.dataset.t)));

/* charts */
function css(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim()}
function T(){const grid=css("--grid"),line=css("--line"),muted=css("--muted");Chart.defaults.color=muted;Chart.defaults.font.family="Archivo, system-ui, sans-serif";Chart.defaults.font.size=13;Chart.defaults.plugins.legend.labels.boxWidth=10;Chart.defaults.maintainAspectRatio=false;return{accent:css("--accent"),fruit:css("--fruit"),bad:css("--bad"),warn:css("--warn"),line,muted,ax:{grid:{color:grid},border:{color:line}}}}
const bare=p=>String(p||"").replace(/\s*\(.*\)\s*$/,"").trim();
const clean=p=>String(p||"").replace(/\s*\([^)]*\bsee\b[^)]*\)/i,"").trim();
const BP=()=>clean(D.blockPeriod||(D.kpi||{}).ffbPeriod)||"period not stated";
const prevP=p=>{const c=clean(p).replace(/ only$/,"");return /\d{4}/.test(c)?c.replace(/(\d{4})/,y=>y-1):"same period last year"};
function YTD(){const k=D.kpi||{};let c=D.ytdCurrent;
 if(!c&&k.yph!=null){const p=bare(k.ffbPeriod),m=p.match(/(\d{4})$/);if(m&&!/^Jan.Dec/.test(p))c={year:+m[1],period:p,yph:k.yph,prevSame:k.yphPrevSame,src:(D.reports&&D.reports.pa&&D.reports.pa.title)||"latest PA report"}}
 if(!c)return null;const yh=(D.yieldHistory||[]).filter(y=>y.yph!=null);if(yh.some(y=>+y.year===+c.year))return null;
 return {...c,months:bare(c.period).replace(/\s*\d{4}$/,"")}}
const DEF={
 overview(t){const out=[];const k=D.kpi||{};
  const bl=(D.blocks||[]).filter(b=>b.ytd!=null).slice(0,14);
  if(bl.length){const hasEst=bl.some(b=>b.est!=null),hasPrev=bl.some(b=>b.prevYtd!=null);const ds=[{label:BP(),data:bl.map(b=>b.ytd),backgroundColor:t.accent}];if(hasEst)ds.push({label:"Estimate",data:bl.map(b=>b.est),backgroundColor:t.line});else if(hasPrev)ds.push({label:prevP(BP()),data:bl.map(b=>b.prevYtd),backgroundColor:t.line});
   out.push(new Chart($("ch1"),{type:"bar",data:{labels:bl.map(b=>b.id),datasets:ds},options:{scales:{x:t.ax,y:{...t.ax,min:0,title:{display:true,text:"t/ha"}}}}}))}
  const cp=(D.costParts||[]).filter(c=>c.actual!=null);
  if(cp.length)out.push(new Chart($("ch2"),{type:"bar",data:{labels:cp.map(c=>c.name),datasets:[{label:"Actual",data:cp.map(c=>c.actual),backgroundColor:t.accent},{label:"Budget",data:cp.map(c=>c.budget),backgroundColor:t.line}]},options:{scales:{x:t.ax,y:{...t.ax,min:0,title:{display:true,text:"RM per t"}}}}}));
  {const yh=(D.yieldHistory||[]).filter(y=>y.yph!=null),c=YTD();
   const yrs=yh.map(y=>String(y.year));if(c)yrs.push(`${c.year} (${c.months})`);
   const n=yrs.length,at=v=>{const a=Array(n).fill(null);a[n-1]=v;return a};
   const ds=[{label:"Full year",data:yh.map(y=>y.yph).concat(c?[null]:[]),borderColor:t.accent,backgroundColor:t.accent+"22",fill:true,tension:.25,pointRadius:4,pointBackgroundColor:t.accent}];
   if(c){ds.push({label:`${c.year}, ${c.months} only`,data:at(c.yph),borderColor:t.fruit,backgroundColor:css("--panel"),borderWidth:2.5,showLine:false,pointRadius:7,pointHoverRadius:8});
    if(c.prevSame!=null)ds.push({label:`${c.year-1}, same months`,data:at(c.prevSame),borderColor:t.muted,backgroundColor:t.muted,borderWidth:3,showLine:false,pointStyle:"line",pointRadius:12,pointHoverRadius:12})}
   if(yh.length+(c?1:0)>1)out.push(new Chart($("ch4"),{type:"line",data:{labels:yrs,datasets:ds},options:{plugins:{legend:{display:!!c}},scales:{x:t.ax,y:{...t.ax,min:0,title:{display:true,text:"t/ha"}}}}}))}
  return out},
 money(t){return[]},
 field(t){const out=[];const lb=(D.labour||[]).filter(l=>l.actual!=null);
  if(lb.length)out.push(new Chart($("ch6"),{type:"bar",data:{labels:lb.map(l=>l.cat),datasets:[{label:"Actual",data:lb.map(l=>l.actual),backgroundColor:t.accent},{label:"Required",data:lb.map(l=>l.req),backgroundColor:t.line}]},options:{indexAxis:"y",scales:{x:{...t.ax,min:0},y:{...t.ax,grid:{display:false}}}}}));
  const rf=(D.rainfall||[]).filter(r=>r.mm!=null);
  if(rf.length)out.push(new Chart($("ch7"),{type:"bar",data:{labels:rf.map(r=>r.year),datasets:[{label:"mm",data:rf.map(r=>r.mm),backgroundColor:t.accent+"aa"}]},options:{plugins:{legend:{display:false}},scales:{x:t.ax,y:{...t.ax,min:0,title:{display:true,text:"mm"}}}}}));
  return out}
};
function buildCharts(t){if(!window.Chart||!D||!DEF[t]||built[t])return;built[t]=DEF[t](T())}
function rebuild(){Object.keys(built).forEach(k=>{built[k].forEach(c=>c.destroy());delete built[k]});buildCharts(TABS.find(n=>!$("t-"+n).hidden))}
matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change",rebuild);

/* render */
function render(){
 const k=D.kpi||{},r=D.reports||{},a=D.area||{};
 document.title=`${D.name} · PARAS`;
 $("eb").textContent=[D.group,D.company,"PARAS advisory"].filter(Boolean).join(" · ");
 $("nm").textContent=D.name;
 $("mt").textContent=[a.planted!=null?`${fmt(a.planted)} ha planted`:null,a.mature!=null?`${fmt(a.mature)} ha mature`:null,a.immature?`${fmt(a.immature)} ha immature`:null].filter(Boolean).join(" · ");
 const rp=[];if(r.pa)rp.push(`<b>${esc(r.pa.title)}</b> (visit ${esc(r.pa.visit||"–")}${r.pa.period?", covers "+esc(r.pa.period):""})`);if(r.pa2)rp.push(`<b>${esc(r.pa2.title)}</b> (visit ${esc(r.pa2.visit||"–")}${r.pa2.period?", covers "+esc(r.pa2.period):""})`);if(r.agro)rp.push(`<b>${esc(r.agro.title)}</b> (visit ${esc(r.agro.visit||"–")})`);
 $("lt").innerHTML="Latest reports: "+(rp.join(" · ")||"none found");
 // KPIs
 $("glH").textContent=k.ffbPeriod?`${clean(k.ffbPeriod)} at a glance`:"At a glance";
 $("glS").textContent=r.pa?`From ${r.pa.title}${k.copPeriod&&k.copPeriod!==k.ffbPeriod?`. Costs to ${k.copPeriod}.`:"."}`:"";
 const tiles=[];
 if(k.ffb!=null)tiles.push([`FFB crop, ${esc(clean(k.ffbPeriod)||"period not stated")}`,`${fmt(k.ffb)}<small> mt</small>`,k.ffbBudget!=null?`${pill(pct(k.ffb,k.ffbBudget))} budget ${fmt(k.ffbBudget)}`:"no budget given"]);
 if(k.yph!=null)tiles.push([`Yield, ${esc(clean(k.ffbPeriod)||"period not stated")}`,`${fmt(k.yph,2)}<small> t/ha</small>`,k.yphBudget!=null?`${pill(pct(k.yph,k.yphBudget))} budget ${fmt(k.yphBudget,2)}`:(k.yphPrevSame!=null?`${pill(pct(k.yph,k.yphPrevSame))} ${esc(prevP(k.ffbPeriod))} ${fmt(k.yphPrevSame,2)}`:"")]);
 if(k.cop!=null)tiles.push([`Cost of production${k.copPeriod?", "+esc(clean(k.copPeriod)):""}`,`RM${fmt(k.cop)}<small>/t</small>`,k.copBudget!=null?`${pill(pct(k.cop,k.copBudget),true)} budget RM${fmt(k.copBudget)}`:""]);
 if(k.harvesters!=null)tiles.push(["Harvesters",`${k.harvesters}<small>${k.harvestersReq!=null?" / "+k.harvestersReq:""}</small>`,k.workers!=null?`workers ${k.workers}${k.workersReq!=null?" / "+k.workersReq:""}`:""]);
 if(k.manuringPct!=null&&tiles.length<5)tiles.push(["Manuring done",`${fmt(k.manuringPct)}<small>%</small>`,esc(k.manuringNote||"")]);
 $("kv").innerHTML=tiles.map(t=>`<div><div class="k">${t[0]}</div><div class="v">${t[1]}</div><div class="d">${t[2]}</div></div>`).join("")||`<p class="empty">No headline figures in the latest reports.</p>`;
 const sm=D.summary||[];if(sm.length)$("sum").innerHTML=sm.map(s=>`<li>${esc(s)}</li>`).join("");else $("sumCard").hidden=true;
 const bl=(D.blocks||[]).filter(b=>b.ytd!=null);
 if(bl.length){const hasEst=bl.some(b=>b.est!=null);$("cB1s").textContent=`t/ha, ${BP()}${D.blockSrc?" ("+D.blockSrc+")":""}, against ${hasEst?"estimate":prevP(BP())}`}else $("cB1").hidden=true;
 const cp=(D.costParts||[]).filter(c=>c.actual!=null);if(cp.length)$("cB2s").textContent=`RM per tonne FFB, ${k.copPeriod||""}, against budget`;else $("cB2").hidden=true;
 const prog=[["Manuring",k.manuringPct],["Circle spraying",k.circlePct],["Selective spraying",k.selectivePct],["Pruning",k.pruningPct]].filter(p=>p[1]!=null);
 if(prog.length){$("prog").innerHTML=prog.map(p=>{const v=Math.min(100,p[1]);const c=v>=90?C.good:v>=75?C.warn:C.bad;return `<div class="bar"><span>${p[0]}</span><span class="tr"><span class="fl" style="display:block;width:${v}%;--c:${c}"></span></span><span class="n">${fmt(p[1])}%</span></div>`}).join("");$("progN").textContent=k.manuringNote||""}else $("cB3").hidden=true;
 {const yh=(D.yieldHistory||[]).filter(y=>y.yph!=null),c=YTD();
  if(yh.length+(c?1:0)<2)$("cB4").hidden=true;
  const last=yh.length?yh[yh.length-1].year:null;
  $("ch4n").textContent=c?`The ${c.year} figure covers ${c.months} only, from ${c.src}, so it is not comparable with full years.${c.prevSame!=null?` Same months ${c.year-1}: ${fmt(c.prevSame,2)} t/ha (${pct(c.yph,c.prevSame)>0?"+":""}${pct(c.yph,c.prevSame).toFixed(0)}%).`:""}`
   :(last?`No ${last+1} crop figure in the latest reports yet.`:"")}

 // blocks
 const B=D.blocks||[];
 {const ths=document.querySelectorAll("#t-blocks thead th");if(ths.length>=7){ths[4].textContent=`Yield ${BP()}`;ths[6].textContent=prevP(BP())}
  const yp=$("bYP");if(yp)yp.textContent=B.some(b=>b.ytd!=null)?`Block yields are t/ha for ${BP()}${D.blockSrc?", from "+D.blockSrc:""}.`:""}
 const tl=$("tiles"),sel=$("bSel");
 B.forEach(b=>{const ref=b.est!=null?b.est:b.prevYtd;const v=pct(b.ytd,ref);const col=v==null?"var(--line)":v>=0?"var(--good)":v>-10?"var(--warn)":"var(--bad)";
  const t=document.createElement("button");t.type="button";t.className="tile";t.setAttribute("role","option");t.dataset.b=b.id;t.style.setProperty("--s",col);t.style.setProperty("--g",Math.max(1,Math.round((b.ha||40)/40)));
  t.innerHTML=`<span class="nm">${esc(b.id)}</span><span class="ha">${b.ha!=null?fmt(b.ha,2)+" ha":""}</span><span class="yv">${v==null?esc((b.status||"").split(/[ ·|]/)[0]):(v>0?"+":"")+v.toFixed(0)+"%"}</span>`;
  t.addEventListener("click",()=>showBlock(b.id));tl.append(t);
  const o=document.createElement("option");o.value=b.id;o.textContent=`${b.id}${b.status?" · "+b.status:""}`;sel.append(o)});
 sel.addEventListener("change",()=>showBlock(sel.value));
 $("bT").innerHTML=B.map(b=>{const ref=b.est!=null?b.est:b.prevYtd;return `<tr class="clk" tabindex="0" data-b="${esc(b.id)}"><td><b>${esc(b.id)}</b></td><td>${fmt(b.ha,2)}</td><td>${fmt(b.sph)}</td><td>${esc(b.planted||"–")}</td><td>${fmt(b.ytd,2)}</td><td>${fmt(b.est,2)}</td><td>${fmt(b.prevYtd,2)}</td><td>${pill(pct(b.ytd,ref))}</td></tr>`}).join("")||`<tr><td colspan="8" class="empty">No block data in the latest reports.</td></tr>`;
 document.querySelectorAll("#bT tr.clk").forEach(tr=>{const go=()=>{showBlock(tr.dataset.b);$("bP").scrollIntoView({behavior:"smooth",block:"start"})};tr.addEventListener("click",go);tr.addEventListener("keydown",e=>{if(e.key==="Enter")go()})});
 if(B.length)showBlock(B[0].id);else $("bP").innerHTML=`<p class="empty">No block data in the latest reports.</p>`;
 // money (standard layout, same as Cheekah Kemayan)
 const NA="N/A",na=v=>v==null;
 $("mS").textContent=k.cop!=null||k.ucHa!=null?`${clean(k.copPeriod)||"Period not stated"}${r.pa?" · "+r.pa.title:""}`:(r.pa?`${r.pa.title} · no cost section`:"No cost section");
 if(D.costDetail&&window.costTableHTML){const cd=D.costDetail,o=costTableHTML(cd,fmt,pill,pct);$("opT").innerHTML=o.html;costTableWire($("opT"));$("opN").textContent=(o.note?o.note+" ":"")+"Tap a line to hide or show its breakdown.";$("mS").textContent=`${cd.period||"Period not stated"} · ${cd.src||(r.pa&&r.pa.title)||""}`}
 else {const cp=n=>(D.costParts||[]).find(c=>n.test(c.name||""))||{};
  const H=cp(/harvest/i),U=cp(/upkeep/i),G=cp(/general/i);
  const rows=[["Harvesting & collection",H.actual??k.hcT,H.budget??k.hcTBudget],["Upkeep & cultivation",U.actual,U.budget],["General charges",G.actual,G.budget],["Total operating cost",k.cop,k.copBudget,1]];
  $("opT").innerHTML=rows.map(r=>`<tr${r[3]?' class="tot"':""}><td>${r[3]?"<b>"+r[0]+"</b>":r[0]}</td><td>${na(r[1])?NA:(r[3]?"<b>"+fmt(r[1],2)+"</b>":fmt(r[1],2))}</td><td>${na(r[2])?NA:fmt(r[2],2)}</td><td>${na(r[1])||na(r[2])?NA:pill(pct(r[1],r[2]),true)}</td></tr>`).join("");
  if(rows.every(r=>na(r[1])))$("mNone").hidden=false;}
 {const STD=[["Weeding",/weed/i],["Manuring",/manur/i],["Pest & disease",/pest/i],["Census & thinning",/census|thin/i],["Drains",/drain/i],["Bridges & culverts",/bridge|culvert/i],["Roads",/road/i],["Boundaries",/bound|survey|fence/i],["Pruning",/prun/i]];
  const EXTRA=[["Soil & water conservation",/soil|water/i],["Supplying",/supply/i],["Tools",/tool/i]];
  const up=(D.upkeep||[]).filter(u=>!/total/i.test(u.item||""));const used=new Set();const notes=[];
  const find=re=>{const i=up.findIndex((u,j)=>!used.has(j)&&re.test(u.item||""));return i<0?null:i};
  const rows=[];
  // combined "Roads & bridges" lines go under Roads
  const rb=up.findIndex(u=>/road/i.test(u.item)&&/bridge/i.test(u.item));
  STD.forEach(([nm,re])=>{
   if(rb>=0&&nm==="Bridges & culverts"){rows.push([nm,null,null,"in Roads"]);return}
   let i=(nm==="Roads"&&rb>=0)?rb:find(re);
   if(i!=null){used.add(i);rows.push([nm==="Roads"&&rb>=0?"Roads & bridges":nm,up[i].actual,up[i].budget])}else rows.push([nm,null,null])});
  EXTRA.forEach(([nm,re])=>{const i=find(re);if(i!=null){used.add(i);rows.push([nm,up[i].actual,up[i].budget])}});
  up.forEach((u,j)=>{if(!used.has(j))rows.push([u.item,u.actual,u.budget])});
  const v=(a,b,lbl)=>lbl?"":na(a)||na(b)?NA:b===0?(a?"<span class='pill warn'>unbudgeted</span>":"–"):pill(pct(a,b),true);
  $("upT").innerHTML=rows.map(x=>`<tr><td>${esc(x[0])}</td><td>${x[3]?`<span class="sub">${x[3]}</span>`:na(x[1])?NA:fmt(x[1],2)}</td><td>${x[3]?"":na(x[2])?NA:x[2]===0?"–":fmt(x[2],2)}</td><td>${v(x[1],x[2],x[3])}</td></tr>`).join("")
   +`<tr><td><b>Total</b></td><td><b>${na(k.ucHa)?NA:fmt(k.ucHa,2)}</b></td><td>${na(k.ucHaBudget)?NA:fmt(k.ucHaBudget,2)}</td><td>${na(k.ucHa)||na(k.ucHaBudget)?NA:pill(pct(k.ucHa,k.ucHaBudget),true)}</td></tr>`;
  if(rb>=0)$("upN").textContent=`This report gives roads and bridges as one line ("${up[rb].item}").`;
 }
 // action tracker
 {const A=(D.actions||[]).slice().sort((a,b)=>({repeat:0,open:1,done:2}[a.status]??3)-({repeat:0,open:1,done:2}[b.status]??3));
  const rep=A.filter(a=>a.status==="repeat").length,op=A.filter(a=>a.status==="open").length;
  $("actS").textContent=A.length?`${A.length} actions from the latest reports: ${rep} raised before and still not done, ${op} new.`:"No actions recorded in the latest reports.";
  if(rep){$("acnt").textContent=rep;$("acnt").hidden=false}
  $("actT").innerHTML=A.map(a=>`<tr><td class="wrap">${esc(a.item)}<br><small class="sub">${esc(a.src||"")}${a.times?` · raised ${a.times} times`:""}${a.note?` · ${esc(a.note)}`:""}</small></td><td><span class="st ${esc(a.status)}">${a.status==="repeat"?"Raised before":a.status==="done"?"Done":"Open"}</span></td></tr>`).join("")||`<tr><td colspan="2" class="empty">None.</td></tr>`}
 // margin calculator
 {const tot=(D.costDetail&&D.costDetail.total&&D.costDetail.total.actual)??k.cop;const fp=$("fp");
  if(tot==null){$("mgC").hidden=true;$("mgC").nextElementSibling.hidden=true}
  else{const y=k.yph;const upd=()=>{const p=parseFloat(fp.value);try{localStorage.setItem("paras.ffbPrice",fp.value)}catch(e){}
    if(isNaN(p)||p<=0){$("mgO").textContent="";return}
    const m=p-tot;$("mgO").innerHTML=`Margin <b style="color:var(${m>=0?"--good":"--bad"})">RM${fmt(m,2)}/t</b>${y!=null?` · about RM${fmt(m*y,0)}/ha for ${esc(clean(k.ffbPeriod))}`:""}`};
   try{const v=localStorage.getItem("paras.ffbPrice");if(v)fp.value=v}catch(e){}
   fp.addEventListener("input",upd);upd()}}
 // reports + folder
 if(D.folder){const f=$("fld");f.href=D.folder;f.hidden=false}
 $("srcC").innerHTML+=(D.folder?`<a href="${esc(D.folder)}" target="_blank" rel="noopener"><b>All reports for this estate (Google Drive folder) ↗</b></a>`:"")+[r.pa,r.pa2,r.agro].filter(Boolean).map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)} · visit ${esc(x.visit||"–")}</a>`).join("");
 // ask chips
 const bid=B[0]?B[0].id:"the oldest block";
 ["How many harvesters in the latest report?",`What is the fertiliser programme for ${bid}?`,"Why is yield above or below budget?","What should I look out for on a field visit?"].forEach(q=>{const b=document.createElement("button");b.type="button";b.textContent=q;b.addEventListener("click",()=>ask(q));$("chips").append(b)});
 showTab((location.hash||"#overview").slice(1));
}
function showBlock(id){const b=(D.blocks||[]).find(x=>x.id===id);if(!b)return;curBlock=b;$("bSel").value=id;document.querySelectorAll("#tiles .tile").forEach(t=>t.setAttribute("aria-selected",t.dataset.b===id?"true":"false"));
 const ref=b.est!=null?b.est:b.prevYtd,refL=b.est!=null?"estimate":prevP(BP());
 $("bP").innerHTML=`<div class="bp-top"><span class="nm">${esc(b.id)}</span>${b.status?`<span class="status">${esc(b.status)}</span>`:""}</div>
 <div class="facts">
  <div class="fact"><div class="k">Area</div><div class="v">${fmt(b.ha,2)} <small>ha</small></div></div>
  <div class="fact"><div class="k">Palms / ha</div><div class="v">${fmt(b.sph)}</div></div>
  <div class="fact"><div class="k">Planted</div><div class="v">${esc(b.planted||"–")}</div></div>
  <div class="fact"><div class="k">Yield, ${esc(BP())}</div><div class="v">${fmt(b.ytd,2)} <small>t/ha</small></div><div class="k">${ref!=null?pill(pct(b.ytd,ref))+" vs "+refL+" "+fmt(ref,2):""}</div></div>
 </div>
 ${b.fert?`<div class="bsec"><h4>Fertiliser programme</h4><div class="fert">${esc(b.fert)}</div></div>`:""}
 <div class="bsec"><h4>Report comments</h4><ul class="obs">${(b.notes||[]).map(n=>`<li><span class="tag ${/agro/i.test(n.src||"")?"ag":""}">${esc(n.src)}</span><span>${esc(n.text)}</span></li>`).join("")||`<li><span></span><span class="empty">No comments on this block.</span></li>`}</ul></div>
 <button type="button" class="askblock" id="askBlk">Ask a question about ${esc(b.id)}</button>`;
 $("askBlk").addEventListener("click",()=>{document.getElementById("askBox").scrollIntoView({behavior:"smooth",block:"start"});$("q").value=`Tell me about block ${b.id}: `;$("q").focus()});
}

/* ask: handled by byoai.js (opens the viewer's own Claude) */
function ask(text){if(window.PARAS_ASK)window.PARAS_ASK(text)}

/* load */
if(!slug){location.replace("/");return}
fetch(`/data/${slug}.json`).then(r=>{if(!r.ok)throw 0;return r.json()}).then(d=>{D=d;render()}).catch(e=>{console.error(e);$("nm").textContent="Estate not found";$("lt").innerHTML='<a href="/" style="color:var(--band-fg)">Back to all estates</a>'});
})();
