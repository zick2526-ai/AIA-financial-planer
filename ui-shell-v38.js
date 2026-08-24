(()=>{
'use strict';
const ADMIN_URL='./admin.html';
function style(){
 if(document.getElementById('v38-ui-style'))return;
 const s=document.createElement('style');s.id='v38-ui-style';s.textContent=`
 #rptPdfBtn,#aia-calendar-launcher,#aia-admin-shortcut{display:none!important}
 .v38-admin-card{position:relative;border:1px solid #eceef2;background:#fbfbfc;border-radius:13px;padding:12px 38px 12px 13px;text-align:left;display:block;width:100%;font:inherit;cursor:pointer}
 .v38-admin-card .t{display:block;font-size:15px;font-weight:800;color:#222831;line-height:1.3}.v38-admin-card .s{display:block;font-size:11px;color:#8a929e;margin-top:3px;line-height:1.35}.v38-admin-card .a{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:24px;color:#b0b6bf}
 `;document.head.appendChild(s);
}
function removeLegacyActions(){
 [...document.querySelectorAll('button')].forEach(b=>{
   const t=(b.textContent||'').replace(/\s+/g,' ').trim();
   if(t==='คำนวณและสรุป'||t==='ล้างข้อมูล') b.remove();
 });
 document.querySelectorAll('.actions').forEach(a=>{if(!a.querySelector('button'))a.remove()});
}
function addAdminToMenus(){
 const shortcut=document.getElementById('aia-admin-shortcut');
 if(!shortcut)return false;
 const nav=document.getElementById('aia-v35-nav');if(!nav)return false;
 if(nav.querySelector('[data-v38-admin]'))return true;
 const mobileGroups=[...nav.querySelectorAll('.v35-group')];
 const service=mobileGroups.find(g=>(g.querySelector('.v35-group-title')?.textContent||'').includes('บริการลูกค้า'));
 if(service){
   const grid=service.querySelector('.v35-group-grid');
   if(grid){const b=document.createElement('button');b.type='button';b.className='v38-admin-card';b.dataset.v38Admin='1';b.innerHTML='<span class="t">Admin</span><span class="s">จัดการระบบและสิทธิ์ผู้ใช้งาน</span><span class="a">›</span>';b.onclick=()=>location.href=ADMIN_URL;grid.appendChild(b)}
 }
 const calendarBtn=nav.querySelector('.v35-work [data-v35-action="calendar"]');
 const desktopMenu=calendarBtn?.closest('.v35-menu');
 if(desktopMenu&&!desktopMenu.querySelector('[data-v38-admin]')){const b=document.createElement('button');b.type='button';b.dataset.v38Admin='1';b.textContent='Admin';b.onclick=()=>location.href=ADMIN_URL;desktopMenu.appendChild(b)}
 return true;
}
function clean(){style();removeLegacyActions();addAdminToMenus()}
let tries=0;const timer=setInterval(()=>{tries++;clean();if(tries>=25)clearInterval(timer)},240);
window.addEventListener('aia:client-selected',()=>setTimeout(clean,120));
window.AIAUIShellV38={refresh:clean};
})();