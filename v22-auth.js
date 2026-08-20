(()=>{
const statusEl=()=>document.getElementById('authStatus');
const emailEl=()=>document.getElementById('authEmail');
const passEl=()=>document.getElementById('authPassword');
const authCard=document.querySelector('.auth-card');
let resendBtn=document.getElementById('resendConfirmBtn');
if(authCard && !resendBtn){
  resendBtn=document.createElement('button');
  resendBtn.id='resendConfirmBtn';
  resendBtn.className='btn light';
  resendBtn.style.cssText='margin-top:10px;display:none';
  resendBtn.textContent='ส่งอีเมลยืนยันอีกครั้ง';
  const st=statusEl();
  st?.parentNode.insertBefore(resendBtn,st?.nextSibling||null);
}
function thAuthMessage(error){
  if(!error) return '';
  const code=error.code||'';
  const msg=String(error.message||'');
  if(code==='email_not_confirmed'||/Email not confirmed/i.test(msg)) return 'บัญชีนี้สมัครแล้ว แต่ยังไม่ได้ยืนยันอีเมล กรุณาเปิดอีเมลจาก Supabase แล้วกดลิงก์ยืนยัน จากนั้นกลับมาเข้าสู่ระบบอีกครั้ง';
  if(code==='over_email_send_rate_limit'||/only request this after/i.test(msg)) return 'ระบบเพิ่งส่งอีเมลยืนยันไปแล้ว กรุณารอสักครู่ก่อนขอส่งซ้ำ';
  if(/Invalid login credentials/i.test(msg)) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
  if(/User already registered/i.test(msg)) return 'อีเมลนี้สมัครไว้แล้ว กรุณากดเข้าสู่ระบบแทน';
  if(/Password should be at least/i.test(msg)) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
  return msg;
}
function setStatus(msg,isError=false){const el=statusEl();if(!el)return;el.textContent=msg;el.style.color=isError?'#b91c1c':'#6b7280'}
function showResend(show=true){if(resendBtn)resendBtn.style.display=show?'inline-block':'none'}
window.loginUser=async function(){
  const email=emailEl()?.value.trim()||'',password=passEl()?.value||'';
  if(!email||!password){setStatus('กรุณากรอกอีเมลและรหัสผ่าน',true);return}
  setStatus('กำลังเข้าสู่ระบบ...');
  const {error}=await sb.auth.signInWithPassword({email,password});
  if(error){const m=thAuthMessage(error);setStatus(m,true);showResend(error.code==='email_not_confirmed'||/Email not confirmed/i.test(error.message||''));return}
  showResend(false);setStatus('เข้าสู่ระบบสำเร็จ');await bootCloud();
};
window.signupUser=async function(){
  const email=emailEl()?.value.trim()||'',password=passEl()?.value||'';
  if(!email){setStatus('กรุณากรอกอีเมล',true);return}
  if(password.length<6){setStatus('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',true);return}
  setStatus('กำลังสมัครใช้งาน...');
  const {data,error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}});
  if(error){setStatus(thAuthMessage(error),true);showResend(error.code==='over_email_send_rate_limit'||/only request this after/i.test(error.message||''));return}
  if(data.session){showResend(false);setStatus('สมัครสำเร็จและเข้าสู่ระบบแล้ว');await bootCloud();return}
  showResend(true);setStatus('สมัครสำเร็จ กรุณาเปิดอีเมลจาก Supabase แล้วกดลิงก์ยืนยัน จากนั้นกลับมาเข้าสู่ระบบ');
};
let cooldown=0,timer=null;
function startCooldown(seconds=60){cooldown=seconds;if(!resendBtn)return;resendBtn.disabled=true;clearInterval(timer);timer=setInterval(()=>{cooldown--;resendBtn.textContent=cooldown>0?`ส่งอีเมลยืนยันอีกครั้ง (${cooldown})`:'ส่งอีเมลยืนยันอีกครั้ง';if(cooldown<=0){clearInterval(timer);resendBtn.disabled=false}},1000)}
if(resendBtn)resendBtn.onclick=async()=>{
  const email=emailEl()?.value.trim()||'';
  if(!email){setStatus('กรุณากรอกอีเมลก่อน',true);return}
  resendBtn.disabled=true;setStatus('กำลังส่งอีเมลยืนยัน...');
  const {error}=await sb.auth.resend({type:'signup',email,options:{emailRedirectTo:location.origin+location.pathname}});
  if(error){setStatus(thAuthMessage(error),true);startCooldown(60);return}
  setStatus('ส่งอีเมลยืนยันแล้ว กรุณาตรวจ Inbox และ Junk/Spam');startCooldown(60);
};
const hash=new URLSearchParams(location.hash.replace(/^#/,'?'));
if(hash.get('access_token')) setStatus('ยืนยันอีเมลแล้ว กำลังเข้าสู่ระบบ...');
})();