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
function attention(){
 const R=E.map(e=>({e,f:flag(e)})).filter(x=>x.f.worst===2).sort((a,b)=>(a.f.y??0)-(b.f.y??0));
 if(!R.length){$("attC").hidden=true;return}
 $("att").innerHTML=R.map(({e,f})=>`<a href="${esc(e.href)}"><span class="dot r" style="margin-top:5px"></span><span><span class="t">${esc(nm(e))}</span><br><span class="r">${esc(f.why.join("; "))} · ${esc(e.period||"")}</span></span></a>`).join("");
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
 totals();attention();league();actions();
 $("srt").addEventListener("input",league);
 $("fp").addEventListener("input",()=>{try{localStorage.setItem(PRICE_KEY,$("fp").value)}catch(e){}league()});
});
})();
