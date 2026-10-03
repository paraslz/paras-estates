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
const TABS=["overview","blocks","money","field","ask","integrity"];
function showTab(t){if(!TABS.includes(t))t="overview";TABS.forEach(n=>$("t-"+n).hidden=n!==t);document.querySelectorAll('[role="tab"]').forEach(b=>b.setAttribute("aria-selected",b.dataset.t===t?"true":"false"));try{history.replaceState(null,"",location.pathname+location.search+"#"+t)}catch(e){}const tb=document.querySelector(".tabs");if(window.scrollY>tb.offsetTop)window.scrollTo({top:tb.offsetTop});buildCharts(t)}
document.querySelectorAll('[role="tab"]').forEach(b=>b.addEventListener("click",()=>showTab(b.dataset.t)));

/* charts */
function css(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim()}
function T(){const grid=css("--grid"),line=css("--line"),muted=css("--muted");Chart.defaults.color=muted;Chart.defaults.font.family="Archivo, system-ui, sans-serif";Chart.defaults.font.size=11;Chart.defaults.plugins.legend.labels.boxWidth=10;Chart.defaults.maintainAspectRatio=false;return{accent:css("--accent"),fruit:css("--fruit"),bad:css("--bad"),warn:css("--warn"),line,muted,ax:{grid:{color:grid},border:{color:line}}}}
const clean=p=>String(p||"").replace(/\s*\(.*\)\s*$/,"").trim();
const BP=()=>clean(D.blockPeriod||(D.kpi||{}).ffbPeriod)||"period not stated";
const prevP=p=>{const c=clean(p).replace(/ only$/,"");return /\d{4}/.test(c)?c.replace(/(\d{4})/,y=>y-1):"same period last year"};
const DEF={
 overview(t){const out=[];const k=D.kpi||{};
  const bl=(D.blocks||[]).filter(b=>b.ytd!=null).slice(0,14);
  if(bl.length){const hasEst=bl.some(b=>b.est!=null),hasPrev=bl.some(b=>b.prevYtd!=null);const ds=[{label:BP(),data:bl.map(b=>b.ytd),backgroundColor:t.accent}];if(hasEst)ds.push({label:"Estimate",data:bl.map(b=>b.est),backgroundColor:t.line});else if(hasPrev)ds.push({label:prevP(BP()),data:bl.map(b=>b.prevYtd),backgroundColor:t.line});
   out.push(new Chart($("ch1"),{type:"bar",data:{labels:bl.map(b=>b.id),datasets:ds},options:{scales:{x:t.ax,y:{...t.ax,min:0,title:{display:true,text:"t/ha"}}}}}))}
  const cp=(D.costParts||[]).filter(c=>c.actual!=null);
  if(cp.length)out.push(new Chart($("ch2"),{type:"bar",data:{labels:cp.map(c=>c.name),datasets:[{label:"Actual",data:cp.map(c=>c.actual),backgroundColor:t.accent},{label:"Budget",data:cp.map(c=>c.budget),backgroundColor:t.line}]},options:{scales:{x:t.ax,y:{...t.ax,min:0,title:{display:true,text:"RM per t"}}}}}));
  const yh=(D.yieldHistory||[]).filter(y=>y.yph!=null);
  if(yh.length>1)out.push(new Chart($("ch4"),{type:"line",data:{labels:yh.map(y=>y.year),datasets:[{label:"t/ha",data:yh.map(y=>y.yph),borderColor:t.accent,backgroundColor:t.accent+"22",fill:true,tension:.25,pointRadius:4,pointBackgroundColor:t.accent}]},options:{plugins:{legend:{display:false}},scales:{x:t.ax,y:{...t.ax,title:{display:true,text:"t/ha"}}}}}));
  return out},
 money(t){const up=(D.upkeep||[]).filter(u=>u.actual!=null);if(!up.length)return[];return[new Chart($("ch5"),{type:"bar",data:{labels:up.map(u=>u.item),datasets:[{label:"Actual",data:up.map(u=>u.actual),backgroundColor:t.accent},{label:"Budget",data:up.map(u=>u.budget),backgroundColor:t.line}]},options:{indexAxis:"y",scales:{x:{...t.ax,min:0,title:{display:true,text:"RM per ha"}},y:{...t.ax,grid:{display:false}}}}})]},
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
 const rp=[];if(r.pa)rp.push(`<b>${esc(r.pa.title)}</b> (visit ${esc(r.pa.visit||"–")}${r.pa.period?", covers "+esc(r.pa.period):""})`);if(r.agro)rp.push(`<b>${esc(r.agro.title)}</b> (visit ${esc(r.agro.visit||"–")})`);
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
 if(!((D.yieldHistory||[]).filter(y=>y.yph!=null).length>1))$("cB4").hidden=true;
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
 // money
 $("mS").textContent=r.pa?`${r.pa.title}, costs to ${k.copPeriod||r.pa.costTo||"–"}`:"";
 const mk=[["Cost of production",k.cop,k.copBudget,"/t"],["General charges",k.gcHa,k.gcHaBudget,"/ha"],["Upkeep & cultivation",k.ucHa,k.ucHaBudget,"/ha"],["Harvest & collection",k.hcT,k.hcTBudget,"/t"]].filter(m=>m[1]!=null);
 if(mk.length)$("mKv").innerHTML=mk.map(m=>`<div><div class="k">${m[0]}</div><div class="v">RM${fmt(m[1],2)}<small>${m[3]}</small></div><div class="d">${m[2]!=null?pill(pct(m[1],m[2]),true)+" budget RM"+fmt(m[2],2):""}</div></div>`).join("");else $("mNone").hidden=false;
 const up=D.upkeep||[];if(up.length)$("upT").innerHTML=up.map(u=>`<tr><td>${esc(u.item)}</td><td>${fmt(u.actual,2)}</td><td>${fmt(u.budget,2)}</td><td>${u.budget?pill(pct(u.actual,u.budget),true):""}</td></tr>`).join("");else $("fUp").hidden=true;
 // field
 if(!(D.labour||[]).length)$("labC").hidden=true;else $("labS").textContent=k.workers!=null?`${k.workers} workers against ${k.workersReq??"–"} required`:"";
 const hm=[];if(k.harvestInterval)hm.push(["Interval",k.harvestInterval]);if(k.harvesters!=null)hm.push(["Harvesters",`${k.harvesters} against ${k.harvestersReq??"–"} required`]);if(k.manuringNote)hm.push(["Manuring",k.manuringNote]);
 $("hm").innerHTML=hm.map(h=>`<li><span class="tag">${h[0]}</span><span>${esc(h[1])}</span></li>`).join("")||`<li><span></span><span class="empty">Not reported.</span></li>`;
 if(!(D.rainfall||[]).some(r=>r.mm!=null))$("rfF").hidden=true;
 const ac=D.actions||[];$("actS").textContent=ac.length?`${ac.length} items`:"";
 $("actT").innerHTML=ac.map(x=>`<tr><td class="wrap">${esc(x.item)}</td><td>${esc(x.src||"")}</td><td><span class="pill ${x.status==="done"?"good":x.status==="repeat"?"bad":"warn"}">${esc(x.status||"open")}</span></td></tr>`).join("")||`<tr><td colspan="3" class="empty">None recorded.</td></tr>`;
 // integrity
 const fl=D.issues||[];if(fl.length){$("icnt").textContent=fl.length;$("icnt").hidden=false}
 const rf=()=>{const f=$("fSel").value;$("flags").innerHTML=fl.map((x,i)=>[x,i]).filter(([x])=>f==="all"||x.sev===f).map(([x,i])=>`<div class="flag ${x.sev==="bad"?"bad":""}"><span class="n">${i+1}</span><div><div class="t">${esc(x.title)}</div><p>${esc(x.detail)}</p></div></div>`).join("")||`<p class="empty">No discrepancies recorded.</p>`};
 $("fSel").addEventListener("change",rf);rf();
 $("srcC").innerHTML+=[r.pa,r.agro].filter(Boolean).map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)} · visit ${esc(x.visit||"–")}</a>`).join("");
 // ask chips
 const bid=B[0]?B[0].id:"the oldest block";
 ["How many harvesters in the latest report?",`What is the fertiliser programme for ${bid}?`,"Why is yield above or below budget?","What discrepancies are there between the reports?"].forEach(q=>{const b=document.createElement("button");b.type="button";b.textContent=q;b.addEventListener("click",()=>ask(q));$("chips").append(b)});
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
 $("askBlk").addEventListener("click",()=>{showTab("ask");$("q").value=`Tell me about block ${b.id}: `;$("q").focus()});
}

/* ask */
const turns=[];let busy=false;
function add(cls,t){const d=document.createElement("div");d.className="msg "+cls;d.textContent=t;$("log").append(d);$("log").scrollTop=$("log").scrollHeight;return d}
async function ask(text){text=(text||"").trim();if(!text||busy)return;busy=true;$("send").disabled=true;add("q",text);$("q").value="";turns.push({role:"user",content:text});while(turns.length>10)turns.shift();const out=add("a","Thinking…");
 try{const r=await fetch("/api/ask",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug,messages:turns})});const j=await r.json().catch(()=>({}));
  if(!r.ok){turns.pop();out.classList.add("err");out.textContent=j.error||"Ask isn't available right now.";}
  else{out.textContent=j.text;turns.push({role:"assistant",content:j.text})}
 }catch(e){turns.pop();out.classList.add("err");out.textContent="Couldn't reach the server. Check your connection and try again."}
 busy=false;$("send").disabled=false}
$("askForm").addEventListener("submit",e=>{e.preventDefault();ask($("q").value)});

/* load */
if(!slug){location.replace("/");return}
fetch(`/data/${slug}.json`).then(r=>{if(!r.ok)throw 0;return r.json()}).then(d=>{D=d;render()}).catch(()=>{$("nm").textContent="Estate not found";$("lt").innerHTML='<a href="/" style="color:var(--band-fg)">Back to all estates</a>'});
})();
