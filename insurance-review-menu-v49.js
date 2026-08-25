(()=>{
'use strict';
function addMenu(){
  const groups=[...document.querySelectorAll('#aia-v41 .v41-group')];
  const planning=groups.find(g=>g.querySelector('h4')?.textContent?.trim()==='การวางแผน');
  const grid=planning?.querySelector('.v41-grid');
  if(!grid||grid.querySelector('[data-ai-review-v49]'))return false;
  const b=document.createElement('button');
  b.className='v41-card';b.type='button';b.dataset.aiReviewV49='1';
  b.innerHTML='<b>AI Insurance Review</b><small>เทียบกรมธรรม์เดิมกับ AIA และวิเคราะห์ Protection Gap</small>';
  b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();document.querySelector('#aia-v41 .v41-sheet')?.classList.remove('open');window.openAIInsuranceReview?.()});
  grid.prepend(b);return true;
}
document.addEventListener('click',e=>{
  if(!document.getElementById('aia-ai-review-v48'))return;
  if(e.target.closest?.('[data-v41-home],[data-v41-back]')) document.getElementById('aia-ai-review-v48')?.remove();
},true);
let tries=0;const timer=setInterval(()=>{tries++;if(addMenu()||tries>60)clearInterval(timer)},150);
window.addEventListener('aia:client-selected',()=>setTimeout(addMenu,100));
window.AIAInsuranceReviewMenuV49={mount:addMenu};
})();