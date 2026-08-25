(()=>{
'use strict';
const $=s=>document.querySelector(s);
let previousTab=null,currentTab=null,bound=false;
function activeTab(){return $('.side .nav button.active[data-tab]')?.dataset.tab||$('.section.active[id]')?.id||'clients'}
function oldTab(tab){const b=$(`.side .nav button[data-tab="${tab}"]`);if(!b)return false;b.click();return true}
function closeMenu(){$('#aia-v41 .v41-sheet')?.classList.remove('open')}
function closeTopOverlay(){
  const sales=$('#aia-sales56');if(sales){sales.remove();return true}
  const ai=$('#aia-ai-review-v48');if(ai){ai.remove();return true}
  const policy=$('#policy-portfolio-v28');if(policy){const b=policy.querySelector('.pp28-back');if(b)b.click();else policy.remove();return true}
  const cal=$('#aia-cal-back');if(cal){cal.remove();return true}
  return false;
}
function closeAllOverlays(){let guard=0;while(guard++<8&&closeTopOverlay()){} }
function goHome(e){e?.preventDefault?.();e?.stopImmediatePropagation?.();closeMenu();closeAllOverlays();previousTab=null;currentTab='clients';oldTab('clients');setTimeout(()=>window.AIAAppShellV41?.refresh?.(),40)}
function goBack(e){
  e?.preventDefault?.();e?.stopImmediatePropagation?.();closeMenu();
  if(closeTopOverlay()){setTimeout(()=>window.AIAAppShellV41?.refresh?.(),30);return}
  const now=activeTab();
  if(previousTab&&previousTab!==now){const target=previousTab;previousTab=null;currentTab=target;oldTab(target);return}
  if(now!=='clients'){currentTab='clients';oldTab('clients');return}
  try{history.back()}catch(_){}
}
function bind(){
  const nav=$('#aia-v41');if(!nav)return false;
  const back=nav.querySelector('[data-v41-back]'),home=nav.querySelector('[data-v41-home]');if(!back||!home)return false;
  back.onclick=goBack;home.onclick=goHome;bound=true;currentTab=activeTab();return true
}
document.addEventListener('click',e=>{
  const t=e.target.closest?.('.side .nav button[data-tab]');if(!t)return;
  const before=activeTab();setTimeout(()=>{const after=activeTab();if(after!==before){previousTab=before;currentTab=after}},25)
},true);
window.addEventListener('aia:client-selected',()=>{previousTab='clients';currentTab=activeTab()});
let tries=0;const timer=setInterval(()=>{tries++;if(bind()||tries>100)clearInterval(timer)},100);
const mo=new MutationObserver(()=>{if(!bound||!$('#aia-v41 [data-v41-back]')){bound=false;bind()}});mo.observe(document.documentElement,{childList:true,subtree:true});
window.AIANavigationRegressionV58={home:goHome,back:goBack,getState:()=>({previousTab,currentTab,active:activeTab()})};
})();
