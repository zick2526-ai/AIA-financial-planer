(()=>{
'use strict';
const POLICY_ROOT='#policy-portfolio-v28';
let busy=false;
function toast(msg){try{if(typeof window.toast==='function')window.toast(msg)}catch(_){} }
function ensureLayer(){
  const root=document.querySelector(POLICY_ROOT);
  if(!root)return false;
  root.style.setProperty('display','block','important');
  root.style.setProperty('z-index','50000','important');
  root.style.setProperty('pointer-events','auto','important');
  root.style.setProperty('visibility','visible','important');
  root.style.setProperty('opacity','1','important');
  document.documentElement.style.overflow='hidden';
  return true;
}
async function openPolicyHard(){
  if(busy)return;
  busy=true;
  try{
    document.querySelector('#aia-v41 .v41-sheet')?.classList.remove('open');
    toast('กำลังเปิดกรมธรรม์...');
    if(typeof window.openPolicyPortfolio!=='function'){
      const legacy=document.querySelector('[data-v28-policy-nav="1"]');
      if(legacy){legacy.click();}
      else throw new Error('ไม่พบโมดูลกรมธรรม์');
    }else{
      await Promise.resolve(window.openPolicyPortfolio());
    }
    ensureLayer();
    setTimeout(()=>{
      if(!ensureLayer()){
        console.error('[Policy V64] policy root was not created');
        toast('เปิดหน้ากรมธรรม์ไม่สำเร็จ กรุณาโหลดหน้าใหม่');
      }
    },250);
    setTimeout(ensureLayer,700);
  }catch(err){
    console.error('[Policy V64]',err);
    toast('เปิดกรมธรรม์ไม่สำเร็จ: '+(err?.message||err));
  }finally{
    setTimeout(()=>{busy=false},450);
  }
}
function isPolicyTrigger(target){
  const el=target?.closest?.('[data-v41-action="policy"],[data-v28-policy-nav="1"],button,a');
  if(!el)return false;
  if(el.matches('[data-v41-action="policy"],[data-v28-policy-nav="1"]'))return true;
  const text=(el.textContent||'').replace(/\s+/g,' ').trim();
  return text==='กรมธรรม์'||text.startsWith('กรมธรรม์ ');
}
document.addEventListener('pointerup',e=>{
  if(!isPolicyTrigger(e.target))return;
  e.preventDefault();e.stopImmediatePropagation();
  openPolicyHard();
},true);
document.addEventListener('click',e=>{
  if(!isPolicyTrigger(e.target))return;
  e.preventDefault();e.stopImmediatePropagation();
  openPolicyHard();
},true);
const style=document.createElement('style');
style.id='policy-v64-layer';
style.textContent=`
#policy-portfolio-v28{z-index:50000!important;pointer-events:auto!important;visibility:visible!important;opacity:1!important}
.pp28-modalback,#pp28-modalback,#pp28-family-modal{z-index:60000!important;pointer-events:auto!important;visibility:visible!important;opacity:1!important}
`;
document.head.appendChild(style);
window.AIAPolicyNavigationHardfixV64={open:openPolicyHard,ensureLayer};
})();
