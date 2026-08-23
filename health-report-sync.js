(()=>{
'use strict';
const d=document;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function bind(){
 const analyze=d.getElementById('hpAnalyze');
 const save=d.getElementById('hpSave');
 if(analyze&&save&&!analyze.dataset.autoSaveBound){
  analyze.dataset.autoSaveBound='1';
  analyze.addEventListener('click',async()=>{
   await delay(350);
   try{save.click();}catch(e){console.warn('[Health Report Sync] auto-save failed',e)}
  });
 }
 const pdf=d.getElementById('rptPdfBtn');
 if(pdf&&!pdf.dataset.healthSyncBound){
  pdf.dataset.healthSyncBound='1';
  pdf.addEventListener('click',async()=>{
   const s=d.getElementById('hpSave');
   if(s){try{s.click();await delay(450)}catch(e){console.warn('[Health Report Sync] pre-PDF sync failed',e)}}
  },true);
 }
}
let tries=0;const timer=setInterval(()=>{tries++;bind();if(tries>120)clearInterval(timer)},250);
new MutationObserver(bind).observe(d.documentElement,{childList:true,subtree:true});
})();