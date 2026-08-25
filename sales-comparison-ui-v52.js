(()=>{
'use strict';
let timer=null;
let running=false;
const setText=(el,text)=>{if(el&&el.textContent!==text)el.textContent=text};
const hide=el=>{if(el&&el.style.display!=='none')el.style.display='none'};
function simplify(){
  if(running)return false;
  const r=document.getElementById('aia-ai-review-v48');
  if(!r)return false;
  running=true;
  try{
    setText(r.querySelector('.ir48-head h2'),'AI เปรียบเทียบแผนประกัน');
    setText(r.querySelector('.ir48-head p'),'เปรียบเทียบแผนเดิมกับ AIA พร้อมเหตุผลและข้อความสำหรับคุยกับลูกค้า');
    for(const c of r.querySelectorAll('.ir48-card')){
      const h=c.querySelector('h3');
      const t=(h?.textContent||'').trim();
      if(t.includes('AIA Product Catalog')) hide(c);
      if(t.includes('เป้าหมายและ Protection Gap')||t==='ต้องการให้ AI ช่วยเรื่องอะไร'){
        setText(h,'ต้องการให้ AI ช่วยเรื่องอะไร');
        hide(c.querySelector('.ir48-fields'));
        hide(c.querySelector('.ir48-gap'));
        const objective=c.querySelector('#ir48-objective');
        const lab=objective?.closest('.ir48-field')?.querySelector('label');
        setText(lab,'เป้าหมายการเปรียบเทียบ');
      }
      if(t.includes('ขั้นตอนถัดไป')||t==='เปรียบเทียบและแนะนำการขาย'){
        setText(h,'เปรียบเทียบและแนะนำการขาย');
        hide(c.querySelector('.ir48-warn'));
        hide(c.querySelector('#ir48-save'));
        hide(c.querySelector('#ir48-refresh'));
        hide(c.querySelector('#ir51-review'));
        const st=c.querySelector('#ir48-status');
        if(st&&!r.dataset.comparisonId)setText(st,'กดปุ่มด้านล่างเพื่อให้ AI เปรียบเทียบและสรุปให้');
      }
    }
    const oldTitle=[...r.querySelectorAll('.ir48-card h3')].find(x=>x.textContent.includes('ความคุ้มครองปัจจุบัน')||x.textContent==='กรมธรรม์เดิมของลูกค้า');
    setText(oldTitle,'กรมธรรม์เดิมของลูกค้า');
    setText(r.querySelector('#ir50-analyze'),'✨ เปรียบเทียบและแนะนำการขาย');
    return true;
  }finally{running=false;}
}
function schedule(){clearTimeout(timer);timer=setTimeout(simplify,60)}
const original=window.openAIInsuranceReview;
if(typeof original==='function'){
  const wrapped=async(...args)=>{
    const out=await original(...args);
    schedule();
    setTimeout(simplify,450);
    return out;
  };
  window.openAIInsuranceReview=wrapped;
  if(window.AIAInsuranceReviewV48)window.AIAInsuranceReviewV48.open=wrapped;
}
const observer=new MutationObserver(mutations=>{
  if(running)return;
  if(mutations.some(m=>m.addedNodes?.length))schedule();
});
observer.observe(document.documentElement,{childList:true,subtree:true});
window.AIASalesComparisonUIV52={simplify,schedule};
})();