(()=>{
'use strict';
function add(){
  const shortcut=document.getElementById('aia-admin-shortcut');
  const sheet=document.querySelector('#aia-v41 .v41-sheet');
  if(!shortcut||!sheet||document.getElementById('v46-admin-card'))return false;
  const sec=document.createElement('section');sec.className='v41-group';sec.id='v46-admin-card';
  sec.innerHTML='<h4>ผู้ดูแลระบบ</h4><div class="v41-grid"><button class="v41-card" type="button" data-v46-admin><b>⚙ Admin Console</b><small>จัดการผู้ใช้ สิทธิ์ และข้อมูลระบบ</small></button></div>';
  sheet.appendChild(sec);sec.querySelector('[data-v46-admin]').onclick=()=>{location.href='./admin.html'};
  return true;
}
let tries=0;const t=setInterval(()=>{tries++;if(add()||tries>80)clearInterval(t)},250);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(add,350)});
window.AIAAdminMenuV46={refresh:add};
})();