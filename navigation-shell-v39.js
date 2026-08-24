(()=>{
'use strict';
const RED='#d31145';
function activeTab(){return document.querySelector('.side .nav button.active[data-tab]')?.dataset.tab||document.querySelector('.section.active[id]')?.id||''}
function isHome(){return activeTab()==='clients'}
function style(){if(document.getElementById('v39-style'))return;const s=document.createElement('style');s.id='v39-style';s.textContent=`
body.aia-home-active #aia-v35-nav .v35-client{display:none!important}
body.aia-home-active .cloudbar button[onclick*="saveCurrentClient"]{display:none!important}
#v39-overlay-controls{position:fixed;left:12px;top:12px;z-index:50000;display:none;gap:7px;align-items:center}
#v39-overlay-controls.show{display:flex}
.v39-btn{height:42px;min-width:42px;border:1px solid #e4e7ec;background:rgba(255,255,255,.97);color:#3f4651;border-radius:12px;padding:0 12px;display:inline-flex;align-items:center;justify-content:center;gap:6px;font:800 13px Inter,"Noto Sans Thai",system-ui,sans-serif;box-shadow:0 6px 22px rgba(17,24,39,.13);cursor:pointer}
.v39-btn.home{color:${RED};border-color:#f2c4d0;background:#fff7f9}
.v39-icon{font-size:19px;line-height:1}
@media(max-width:820px){#v39-overlay-controls{left:10px;top:10px}.v39-btn{width:40px;height:40px;min-width:40px;padding:0}.v39-label{display:none}}
@media print{#v39-overlay-controls{display:none!important}}
`;document.head.appendChild(s)}
function updateHomeUI(){const home=isHome();document.body.classList.toggle('aia-home-active',home);if(home){const title=document.getElementById('pageTitle');const line=document.getElementById('clientLine');if(title)title.textContent='ลูกค้าของฉัน';if(line)line.textContent='ค้นหา เลือก หรือสร้างลูกค้าใหม่เพื่อเริ่มวางแผน'}}
function hasFullscreenLayer(){const els=[document.getElementById('policy-portfolio-v28'),document.getElementById('aia-cal-back'),document.querySelector('.health-planner-modal'),document.querySelector('[data-fullscreen-module="1"]')].filter(Boolean);return els.some(el=>{const cs=getComputedStyle(el);return cs.display!=='none'&&cs.visibility!=='hidden'})}
function ensureOverlayControls(){style();let c=document.getElementById('v39-overlay-controls');if(!c){c=document.createElement('div');c.id='v39-overlay-controls';c.innerHTML=`<button class="v39-btn" id="v39-back" type="button" title="ย้อนกลับ"><span class="v39-icon">←</span><span class="v39-label">ย้อนกลับ</span></button><button class="v39-btn home" id="v39-home" type="button" title="Home · ลูกค้าของฉัน"><span class="v39-icon">⌂</span><span class="v39-label">Home</span></button>`;document.body.appendChild(c);c.querySelector('#v39-back').onclick=e=>{e.preventDefault();e.stopPropagation();if(window.AIANavigationControlsV36?.back)window.AIANavigationControlsV36.back();else history.back()};c.querySelector('#v39-home').onclick=e=>{e.preventDefault();e.stopPropagation();if(window.AIAHomeV37?.home)window.AIAHomeV37.home();else document.querySelector('.side .nav button[data-tab="clients"]')?.click()}}
 c.classList.toggle('show',hasFullscreenLayer())}
function refresh(){updateHomeUI();ensureOverlayControls()}
document.addEventListener('click',()=>setTimeout(refresh,30),true);window.addEventListener('aia:client-selected',()=>setTimeout(refresh,80));setTimeout(refresh,50);setInterval(refresh,700);window.AIANavigationShellV39={refresh};
})();