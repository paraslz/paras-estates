/* Fills group-specific wording from site.js (window.PSITE). Shared by every PARAS group site. */
(function(){const S=window.PSITE||{};if(!S.group)return;
 const go=()=>{document.querySelectorAll("[data-site=group]").forEach(e=>e.textContent=S.groupShort||S.group);
  document.querySelectorAll("[data-site-ph=search]").forEach(e=>{if(S.searchHint)e.placeholder="Search an estate, e.g. "+S.searchHint});
  if(/^Estate Dashboards/.test(document.title))document.title=S.group+" "+document.title};
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",go);else go()})();
