(()=>{
'use strict';
const PROD='https://zick2526-ai.github.io/AIA-financial-planer/';
function client(){return [window.sb,window.supabaseClient,window.db,window._supabase].find(x=>x&&x.auth&&typeof x.auth.signUp==='function')||null}
function el(id){return document.getElementById(id)}
async function signup(){
  const x=client(),status=el('authStatus'),email=(el('authEmail')?.value||'').trim(),password=el('authPassword')?.value||'';
  if(!x){if(status)status.textContent='ระบบสมัครสมาชิกยังไม่พร้อม กรุณาลองใหม่';return}
  if(!email){if(status)status.textContent='กรุณากรอกอีเมล';return}
  if(password.length<6){if(status)status.textContent='รหัสผ่านต้องมีอย่างน้อย 6 ตัว';return}
  if(status)status.textContent='กำลังสมัครใช้งาน...';
  try{
    const {data,error}=await x.auth.signUp({email,password,options:{emailRedirectTo:PROD}});
    if(error){if(status)status.textContent=error.message;return}
    if(status)status.textContent=data?.session?'สมัครสำเร็จและเข้าสู่ระบบแล้ว':'สมัครสำเร็จ กรุณาตรวจอีเมลเพื่อยืนยันบัญชี';
    if(data?.session&&typeof window.bootCloud==='function')await window.bootCloud();
  }catch(err){if(status)status.textContent=err?.message||'สมัครใช้งานไม่สำเร็จ กรุณาลองใหม่'}
}
function install(){window.signupUser=signup;return true}
install();
window.AIAAuthRedirectRegressionV60={signup,redirect:PROD};
})();
