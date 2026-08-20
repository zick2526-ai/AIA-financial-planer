(()=>{
function isNumericField(el){return el && el.tagName==='INPUT' && el.type==='number'}

document.addEventListener('focusin',e=>{
  const el=e.target;
  if(!isNumericField(el)) return;
  // If the field only contains zero, select it all so the first digit replaces it.
  if(String(el.value).trim()==='0'){
    try{el.select()}catch(_){ }
    // On some mobile browsers select() is unreliable for number inputs.
    // Clearing here gives the same UX while preserving 0 on blur if left empty.
    setTimeout(()=>{
      if(document.activeElement===el && String(el.value).trim()==='0') el.value='';
    },0);
  }
},true);

document.addEventListener('blur',e=>{
  const el=e.target;
  if(!isNumericField(el)) return;
  if(String(el.value).trim()===''){
    el.value='0';
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
  }
},true);
})();