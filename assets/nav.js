// Header navigation: big "All estates" button + "Jump to estate" dropdown.
(function(){
 const sel=document.getElementById("jump");if(!sel)return;
 const SITE=window.__SITE__||"";
 const here=window.__SLUG__||document.body.dataset.slug||new URLSearchParams(location.search).get("e")||"";
 fetch(`${SITE}/data/index.json`,{cache:"no-cache"}).then(r=>r.json()).then(j=>{
  const nm=e=>e.name.replace(/^Ladang /,"").replace(/ Estate$/,"");
  j.estates.slice().sort((a,b)=>nm(a).localeCompare(nm(b))).forEach(e=>{const o=document.createElement("option");o.value=e.href;o.textContent=nm(e);if(e.slug===here)o.disabled=true;sel.append(o)});
  sel.hidden=false;
  sel.addEventListener("change",()=>{if(sel.value)location.href=SITE+sel.value});
 }).catch(()=>{sel.hidden=true});
})();
