(()=>{
'use strict';
const PROD='https://zick2526-ai.github.io/AIA-financial-planer/';
let mode='login';
function el(id){return document.getElementById(id)}
function client(){return [window.sb,window.supabaseClient,window.db,window._supabase].find(x=>x&&x.auth&&typeof x.auth.signUp==='function')||null}
function status(msg){const s=el('authStatus');if(s)s.textContent=msg}
function card(){return document.querySelector('#authOverlay .auth-card')}
function cleanPhone(v){return String(v||'').replace(/[\s()-]/g,'')}
function ensureSignupFields(){
  const c=card(),email=el('authEmail');
  if(!c||!email)return false;
  let wrap=el('advisor-signup-fields-v65');
  if(!wrap){
    wrap=document.createElement('div');
    wrap.id='advisor-signup-fields-v65';
    wrap.innerHTML=`
      <input id="authFullName" type="text" placeholder="ชื่อ-นามสกุล" autocomplete="name">
      <input id="authAgentCode" type="text" placeholder="รหัสตัวแทน AIA" autocomplete="off" autocapitalize="characters">
      <input id="authPhone" type="tel" placeholder="เบอร์โทรติดต่อ" autocomplete="tel" inputmode="tel">
    `;
    email.parentNode.insertBefore(wrap,email);
  }
  wrap.style.display=mode==='signup'?'block':'none';
  return true;
}
function renderMode(next){
  mode=next;
  ensureSignupFields();
  const c=card();if(!c)return false;
  const title=c.querySelector('h2'),desc=c.querySelector('p'),actions=c.querySelector('.auth-actions');
  const loginBtn=actions?.querySelector('button[onclick*="loginUser"]');
  const signupBtn=actions?.querySelector('button[onclick*="signupUser"]');
  if(mode==='signup'){
    if(title)title.textContent='สมัครใช้งาน AIA Financial Planner';
    if(desc)desc.textContent='กรอกข้อมูล Advisor ให้ครบเพื่อสร้างบัญชีผู้ใช้งาน';
    if(loginBtn){loginBtn.textContent='← กลับเข้าสู่ระบบ';loginBtn.onclick=(e)=>{e.preventDefault();renderMode('login')}}
    if(signupBtn){signupBtn.textContent='สร้างบัญชี';signupBtn.onclick=(e)=>{e.preventDefault();submitSignup()}}
    status('กรุณากรอกชื่อ-นามสกุล รหัสตัวแทน AIA เบอร์โทร E-mail และรหัสผ่าน');
  }else{
    if(title)title.textContent='AIA Financial Planner V2';
    if(desc)desc.textContent='เข้าสู่ระบบเพื่อบันทึกและเรียกดูข้อมูลลูกค้าของคุณอย่างปลอดภัย';
    if(loginBtn){loginBtn.textContent='เข้าสู่ระบบ';loginBtn.onclick=null;loginBtn.setAttribute('onclick','loginUser()')}
    if(signupBtn){signupBtn.textContent='สมัครใช้งาน';signupBtn.onclick=(e)=>{e.preventDefault();renderMode('signup')}}
    status('ข้อมูลจะถูกเก็บใน Supabase และจำกัดการเข้าถึงตามบัญชี Advisor');
  }
  return true;
}
function validate(){
  const fullName=(el('authFullName')?.value||'').trim();
  const agentCode=(el('authAgentCode')?.value||'').trim();
  const phone=cleanPhone(el('authPhone')?.value||'');
  const email=(el('authEmail')?.value||'').trim().toLowerCase();
  const password=el('authPassword')?.value||'';
  if(fullName.length<3)return {error:'กรุณากรอกชื่อ-นามสกุล'};
  if(!agentCode)return {error:'กรุณากรอกรหัสตัวแทน AIA'};
  if(!/^[0-9+]{8,15}$/.test(phone))return {error:'กรุณากรอกเบอร์โทรให้ถูกต้อง'};
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return {error:'กรุณากรอก E-mail ให้ถูกต้อง'};
  if(password.length<6)return {error:'รหัสผ่านต้องมีอย่างน้อย 6 ตัว'};
  return {fullName,agentCode,phone,email,password};
}
async function submitSignup(){
  const x=client();if(!x){status('ระบบสมัครสมาชิกยังไม่พร้อม กรุณาลองใหม่');return}
  const v=validate();if(v.error){status(v.error);return}
  status('กำลังสร้างบัญชี...');
  try{
    const {data,error}=await x.auth.signUp({email:v.email,password:v.password,options:{emailRedirectTo:PROD,data:{full_name:v.fullName,aia_agent_code:v.agentCode,phone:v.phone}}});
    if(error){
      const m=String(error.message||'');
      if(/rate limit|security purposes|429/i.test(m))status('ส่งอีเมลยืนยันถี่เกินไป กรุณารอสักครู่แล้วลองใหม่');
      else if(/duplicate|already|registered|unique/i.test(m))status('E-mail หรือรหัสตัวแทนนี้ถูกใช้งานแล้ว');
      else status(m||'สมัครใช้งานไม่สำเร็จ');
      return;
    }
    status(data?.session?'สร้างบัญชีสำเร็จและเข้าสู่ระบบแล้ว':'สร้างบัญชีสำเร็จ กรุณาตรวจ E-mail เพื่อยืนยันบัญชี');
    if(data?.session&&typeof window.bootCloud==='function')await window.bootCloud();
  }catch(err){status(err?.message||'สมัครใช้งานไม่สำเร็จ กรุณาลองใหม่')}
}
function signupEntry(){if(mode!=='signup'){renderMode('signup');return}return submitSignup()}
function install(){
  if(!card()||!el('authEmail'))return false;
  ensureSignupFields();
  const actions=card().querySelector('.auth-actions');
  const signupBtn=actions?.querySelector('button[onclick*="signupUser"]');
  if(signupBtn&&!signupBtn.dataset.v65){signupBtn.dataset.v65='1';signupBtn.onclick=(e)=>{e.preventDefault();signupEntry()}}
  window.signupUser=signupEntry;
  return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>100)clearInterval(timer)},100);
window.AIAAdvisorSignupProfileV65={showSignup:()=>renderMode('signup'),showLogin:()=>renderMode('login'),submit:submitSignup,install};
})();
