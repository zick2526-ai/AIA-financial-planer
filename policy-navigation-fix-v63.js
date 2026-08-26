(()=>{
'use strict';
const SEL='[data-v41-action="policy"]';
let opening=false;
function toast(msg){try{window.toast?.(msg)}catch(_){}}
function directOpen(){
  if(opening)return;
  opening=true;
  try{
    document.querySelector('#aia-v41 .v41-sheet')?.classList.remove('open');
    if(typeof window.openPolicyPortfolio==='function'){
      window.openPolicyPortfolio();
      return;
    }
    const legacy=document.querySelector('[data-v28-policy-nav="1"]');
    if(legacy){
      legacy.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
      return;
    }
    toast('ไม่พบหน้ากรมธรรม์ กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง');
    console.error('[Policy Navigation V63] policy portfolio launcher not found');
  }catch(err){
    console.error('[Policy Navigation V63]',err);
    toast('เปิดกรมธรรม์ไม่สำเร็จ: '+(err?.message||err));
  }finally{
    setTimeout(()=>{opening=false},350);
  }
}
function bindButton(btn){
  if(!btn||btn.dataset.policyV63==='1')return;
  btn.dataset.policyV63='1';
  btn.addEventListener('click',e=>{
    e.preventDefault();
    e.stopImmediatePropagation();
    directOpen();
  },true);
}
function bind(){document.querySelectorAll(SEL).forEach(bindButton)}
bind();
new MutationObserver(bind).observe(document.documentElement,{childList:true,subtree:true});
window.AIAPolicyNavigationFixV63={open:directOpen,bind};
})();
