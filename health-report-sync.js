(()=>{
'use strict';
const d=document;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function findButton(text){return [...d.querySelectorAll('button')].find(b=>(b.textContent||'').trim().includes(text))||null}
async function saveCurrentPlanner(){
 const b=findButton('บันทึกลูกค้าปัจจุบัน');
 if(b&&!b.disabled){try{b.click();await delay(500)}catch(e){console.warn('[Health Report Sync] client save failed',e)}}
}
async function saveHealth(){
 const s=d.getElementById('hpSave');
 if(s&&!s.disabled){try{s.click();await delay(500)}catch(e){console.warn('[Health Report Sync] health save failed',e)}}
}
function bind(){
 const analyze=d.getElementById('hpAnalyze');
 const save=d.getElementById('hpSave');
 if(analyze&&save&&!analyze.dataset.autoSaveBound){
  analyze.dataset.autoSaveBound='1';
  analyze.addEventListener('click',async()=>{
   await delay(350);
   await saveHealth();
  });
 }
 const pdf=d.getElementById('rptPdfBtn');
 if(pdf&&!pdf.dataset.healthSyncBound){
  pdf.dataset.healthSyncBound='1';
  pdf.addEventListener('click',async()=>{
   await saveCurrentPlanner();
   await saveHealth();
  },true);
 }
}
let tries=0;const timer=setInterval(()=>{tries++;bind();if(tries>120)clearInterval(timer)},250);
new MutationObserver(bind).observe(d.documentElement,{childList:true,subtree:true});
})();