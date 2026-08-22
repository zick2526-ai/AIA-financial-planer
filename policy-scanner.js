(() => {
  'use strict';

  const SCANNER_VERSION = '1.0.0';
  const TESSERACT_SRC = 'https://cdn.jsdelivr.net/npm/tesseract.js@7/dist/tesseract.min.js';
  let tesseractPromise = null;
  let activeJob = 0;

  function toast(message, bad = false) {
    let el = document.getElementById('policy-scan-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'policy-scan-toast';
      el.style.cssText = 'position:fixed;z-index:14000;left:50%;bottom:24px;transform:translateX(-50%);max-width:92vw;padding:12px 16px;border-radius:12px;color:#fff;font:700 14px system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.22);text-align:center;';
      document.body.appendChild(el);
    }
    el.style.background = bad ? '#a81633' : '#202733';
    el.textContent = message;
    el.style.display = 'block';
    clearTimeout(el._timer);
    el._timer = setTimeout(() => { el.style.display = 'none'; }, 3500);
  }

  function loadTesseract() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (tesseractPromise) return tesseractPromise;
    tesseractPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = TESSERACT_SRC;
      s.async = true;
      s.onload = () => window.Tesseract ? resolve(window.Tesseract) : reject(new Error('โหลด OCR ไม่สำเร็จ'));
      s.onerror = () => reject(new Error('โหลด OCR ไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ต'));
      document.head.appendChild(s);
    });
    return tesseractPromise;
  }

  function waitForPolicyForm(timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      const started = Date.now();
      const tick = () => {
        const form = document.getElementById('pp28-policy-form');
        if (form) return resolve(form);
        if (Date.now() - started > timeoutMs) return reject(new Error('ไม่พบฟอร์มกรมธรรม์'));
        requestAnimationFrame(tick);
      };
      tick();
    });
  }

  function addStatus(form, text = 'กำลังเตรียมสแกนเอกสาร...') {
    let box = document.getElementById('policy-scan-status');
    if (!box) {
      box = document.createElement('div');
      box.id = 'policy-scan-status';
      box.style.cssText = 'margin:12px 0 2px;padding:12px 14px;border-radius:12px;background:#fff4f7;border:1px solid #ffd7e1;color:#7f1731;font:700 13px system-ui,sans-serif;line-height:1.5;';
      form.parentElement?.insertBefore(box, form);
    }
    box.textContent = text;
    return box;
  }

  async function preprocessImage(file) {
    const bitmap = await createImageBitmap(file);
    const maxSide = 1900;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const image = ctx.getImageData(0, 0, width, height);
    const d = image.data;
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const boosted = gray < 160 ? Math.max(0, (gray - 128) * 1.35 + 128) : Math.min(255, (gray - 128) * 1.15 + 128);
      d[i] = d[i + 1] = d[i + 2] = boosted;
    }
    ctx.putImageData(image, 0, 0);
    return canvas;
  }

  function cleanText(text) {
    return String(text || '')
      .replace(/\r/g, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function normalizeNumber(value) {
    if (value == null) return null;
    const digits = String(value)
      .replace(/[Oo]/g, '0')
      .replace(/[Il|]/g, '1')
      .replace(/[^0-9.,]/g, '')
      .replace(/,/g, '');
    const n = Number(digits);
    return Number.isFinite(n) ? n : null;
  }

  function firstMatch(text, patterns, group = 1) {
    for (const pattern of patterns) {
      const m = text.match(pattern);
      if (m?.[group]) return m[group].trim();
    }
    return '';
  }

  function amountNear(text, labels) {
    for (const label of labels) {
      const re = new RegExp(label + '[^\\n\\d]{0,40}([0-9OIl|][0-9OIl|, .]{2,})', 'i');
      const m = text.match(re);
      const n = normalizeNumber(m?.[1]);
      if (n != null && n >= 0) return n;
    }
    return null;
  }

  function lineAfterLabel(text, labels) {
    const lines = text.split('\n').map(x => x.trim()).filter(Boolean);
    for (let i = 0; i < lines.length; i++) {
      for (const label of labels) {
        const re = new RegExp(label, 'i');
        if (!re.test(lines[i])) continue;
        const same = lines[i].replace(re, '').replace(/^[\s:：\-]+/, '').trim();
        if (same && same.length > 2) return same;
        if (lines[i + 1] && lines[i + 1].length > 2) return lines[i + 1];
      }
    }
    return '';
  }

  function detectInsurer(text) {
    const t = text.toLowerCase();
    const companies = [
      ['AIA', [/\baia\b/i, /เอไอเอ/i]],
      ['เมืองไทยประกันชีวิต', [/เมืองไทยประกันชีวิต/i, /muang thai life/i]],
      ['ไทยประกันชีวิต', [/ไทยประกันชีวิต/i, /thai life/i]],
      ['FWD', [/\bfwd\b/i, /เอฟดับบลิวดี/i]],
      ['Allianz Ayudhya', [/allianz/i, /อลิอันซ์/i]],
      ['Prudential', [/prudential/i, /พรูเด็นเชียล/i]],
      ['Krungthai-AXA', [/krungthai.?axa/i, /กรุงไทย.?แอกซ่า/i]],
      ['Tokio Marine', [/tokio marine/i, /โตเกียวมารีน/i]],
      ['Chubb', [/\bchubb\b/i, /ชับบ์/i]],
      ['Generali', [/generali/i, /เจนเนอราลี่/i]],
    ];
    for (const [name, patterns] of companies) if (patterns.some(r => r.test(t))) return name;
    return '';
  }

  function detectPolicyType(text) {
    const t = text.toLowerCase();
    if (/unit\s*linked|ยูนิต.?ลิงค์|ยูนิตลิงค์/.test(t)) return 'Unit Linked';
    if (/บำนาญ|annuity|pension/.test(t)) return 'บำนาญ';
    if (/สะสมทรัพย์|endowment/.test(t)) return 'สะสมทรัพย์';
    if (/โรคร้ายแรง|critical illness|ci benefit/.test(t)) return 'โรคร้ายแรง';
    if (/สุขภาพ|medical|hospital|ค่ารักษา/.test(t)) return 'สุขภาพ';
    if (/อุบัติเหตุ|accident/.test(t)) return 'อุบัติเหตุ';
    if (/ชีวิต|life insurance|life assured/.test(t)) return 'ชีวิต';
    return 'อื่น ๆ';
  }

  function extractPolicyData(rawText) {
    const text = cleanText(rawText);
    const policyNumber = firstMatch(text, [
      /(?:เลขที่?กรมธรรม์|เลขกรมธรรม์|policy\s*(?:no\.?|number))\s*[:：#-]?\s*([A-Z0-9][A-Z0-9\/-]{4,})/i,
      /(?:กรมธรรม์เลขที่)\s*[:：#-]?\s*([A-Z0-9][A-Z0-9\/-]{4,})/i,
    ]);

    const insuredName = lineAfterLabel(text, [
      'ผู้เอาประกันภัย', 'ผู้เอาประกัน', 'ชื่อผู้เอาประกันภัย', 'insured\\s*name', 'life\\s*assured'
    ]).replace(/(?:เลขที่|วันเกิด|อายุ|เพศ).*$/i, '').trim();

    const productName = lineAfterLabel(text, [
      'ชื่อแบบประกัน', 'แบบประกัน', 'ชื่อผลิตภัณฑ์', 'แผนประกัน', 'product\\s*name', 'plan\\s*name'
    ]).replace(/(?:เลขที่|ทุนประกัน|เบี้ยประกัน).*$/i, '').trim();

    const sumAssured = amountNear(text, [
      'ทุนประกัน(?:ชีวิต)?', 'จำนวนเงินเอาประกันภัย', 'จำนวนเงินเอาประกัน', 'sum\\s*assured', 'death\\s*benefit'
    ]);
    const annualPremium = amountNear(text, [
      'เบี้ยประกัน(?:ภัย)?รายปี', 'เบี้ยประกันต่อปี', 'เบี้ยประกันภัย', 'annual\\s*premium', 'premium'
    ]);
    const healthLimit = amountNear(text, [
      'วงเงินสุขภาพ', 'ผลประโยชน์สุขภาพ', 'ค่ารักษาพยาบาล', 'medical\\s*benefit', 'health\\s*benefit'
    ]);
    const ciLimit = amountNear(text, [
      'วงเงินโรคร้ายแรง', 'ผลประโยชน์โรคร้ายแรง', 'critical\\s*illness', 'ci\\s*benefit'
    ]);
    const annualCashback = amountNear(text, [
      'เงินคืนรายปี', 'เงินคืนต่อปี', 'ผลประโยชน์เงินคืน', 'annual\\s*cashback', 'cashback'
    ]);
    const maturityBenefit = amountNear(text, [
      'เงินครบกำหนด', 'ผลประโยชน์ครบกำหนด', 'maturity\\s*benefit', 'maturity'
    ]);

    const startAge = normalizeNumber(firstMatch(text, [
      /(?:อายุเริ่มสัญญา|อายุเมื่อเริ่มทำประกัน|issue\s*age)\s*[:：]?\s*(\d{1,3})/i
    ]));
    const termYears = normalizeNumber(firstMatch(text, [
      /(?:ระยะเวลาคุ้มครอง|ระยะสัญญา|policy\s*term)\s*[:：]?\s*(\d{1,3})\s*(?:ปี|years?)?/i
    ]));
    const payYears = normalizeNumber(firstMatch(text, [
      /(?:ระยะเวลาชำระเบี้ย|ชำระเบี้ย|premium\s*pay(?:ment)?\s*term)\s*[:：]?\s*(\d{1,3})\s*(?:ปี|years?)?/i
    ]));

    return {
      raw_text: text,
      insured_name: insuredName,
      policy_number: policyNumber,
      insurer: detectInsurer(text),
      product_name: productName,
      policy_type: detectPolicyType(text),
      sum_assured: sumAssured,
      annual_premium: annualPremium,
      health_limit: healthLimit,
      ci_limit: ciLimit,
      start_age: startAge,
      term_years: termYears,
      pay_years: payYears,
      annual_cashback: annualCashback,
      maturity_benefit: maturityBenefit,
    };
  }

  function setField(form, name, value, opts = {}) {
    if (value == null || value === '') return false;
    const el = form.elements[name];
    if (!el) return false;

    if (el.tagName === 'SELECT') {
      const wanted = String(value).trim().toLowerCase();
      const opt = [...el.options].find(o =>
        String(o.value).trim().toLowerCase() === wanted ||
        String(o.textContent).trim().toLowerCase() === wanted ||
        String(o.dataset?.name || '').trim().toLowerCase() === wanted
      );
      if (opt) {
        el.value = opt.value;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    }

    if (opts.onlyIfBlank) {
      const current = String(el.value || '').trim();
      if (current && current !== '0' && !(name === 'insurer' && current === 'AIA')) return false;
    }
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function fillForm(form, data) {
    let count = 0;
    const memberSelect = form.elements.insured_member_id;
    if (data.insured_name && memberSelect) {
      const needle = data.insured_name.replace(/\s+/g, '').toLowerCase();
      const opt = [...memberSelect.options].find(o => {
        const n1 = String(o.dataset?.name || '').replace(/\s+/g, '').toLowerCase();
        const n2 = String(o.textContent || '').split('—')[0].replace(/\s+/g, '').toLowerCase();
        return n1 && (needle.includes(n1) || n1.includes(needle) || needle.includes(n2) || n2.includes(needle));
      });
      if (opt) { memberSelect.value = opt.value; count++; }
    }

    const fields = [
      'policy_number','insurer','product_name','policy_type','sum_assured','annual_premium',
      'health_limit','ci_limit','start_age','term_years','pay_years','annual_cashback','maturity_benefit'
    ];
    for (const field of fields) if (setField(form, field, data[field], { onlyIfBlank: true })) count++;
    return count;
  }

  function attachRawTextDetails(form, text) {
    let d = document.getElementById('policy-scan-raw');
    if (!d) {
      d = document.createElement('details');
      d.id = 'policy-scan-raw';
      d.style.cssText = 'margin:8px 0 0;font:12px system-ui,sans-serif;color:#687180;';
      d.innerHTML = '<summary style="cursor:pointer;font-weight:700">ดูข้อความที่สแกนได้</summary><pre style="white-space:pre-wrap;max-height:180px;overflow:auto;background:#f7f8fa;padding:10px;border-radius:10px"></pre>';
      form.parentElement?.insertBefore(d, form.nextSibling);
    }
    d.querySelector('pre').textContent = text;
  }

  async function scanImage(file, jobId) {
    const form = await waitForPolicyForm();
    const status = addStatus(form, 'กำลังโหลดระบบอ่านเอกสาร...');
    try {
      const Tesseract = await loadTesseract();
      if (jobId !== activeJob) return;
      const canvas = await preprocessImage(file);
      status.textContent = 'กำลังอ่านตัวอักษรจากกรมธรรม์...';

      const worker = await Tesseract.createWorker('tha+eng', 1, {
        logger: m => {
          if (jobId !== activeJob) return;
          if (m.status === 'recognizing text' && Number.isFinite(m.progress)) {
            status.textContent = `กำลังอ่านกรมธรรม์ ${Math.round(m.progress * 100)}%`;
          }
        }
      });

      let result;
      try {
        result = await worker.recognize(canvas);
      } finally {
        await worker.terminate();
      }
      if (jobId !== activeJob) return;

      const data = extractPolicyData(result?.data?.text || '');
      const filled = fillForm(form, data);
      attachRawTextDetails(form, data.raw_text);

      if (!data.raw_text) {
        status.textContent = 'สแกนไม่พบข้อความ กรุณาถ่ายใหม่ให้เอกสารตรง ชัด และมีแสงเพียงพอ';
        toast('สแกนไม่พบข้อความ กรุณาถ่ายรูปใหม่', true);
      } else if (filled > 0) {
        status.textContent = `สแกนเสร็จแล้ว ✓ เติมข้อมูลอัตโนมัติ ${filled} ช่อง — กรุณาตรวจสอบก่อนบันทึก`;
        toast('สแกนกรมธรรม์และเติมข้อมูลแล้ว');
      } else {
        status.textContent = 'อ่านเอกสารได้แล้ว แต่ยังจับคู่ช่องข้อมูลไม่ครบ กรุณาตรวจข้อความสแกนและกรอกส่วนที่เหลือ';
        toast('อ่านเอกสารได้ แต่กรุณาตรวจข้อมูลก่อนบันทึก');
      }
    } catch (err) {
      console.error('[Policy Scanner]', err);
      status.textContent = 'สแกนไม่สำเร็จ: ' + (err?.message || 'เกิดข้อผิดพลาด');
      toast(err?.message || 'สแกนกรมธรรม์ไม่สำเร็จ', true);
    }
  }

  document.addEventListener('change', e => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'file') return;
    if (!['pp28-camera-input','pp28-file-input'].includes(input.id)) return;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
        setTimeout(async () => {
          try {
            const form = await waitForPolicyForm();
            addStatus(form, 'ไฟล์ PDF ถูกแนบแล้ว — เวอร์ชันนี้สแกนอัตโนมัติจากภาพถ่าย/ไฟล์รูปก่อน กรุณากรอกข้อมูล PDF ด้วยตนเอง');
          } catch (_) {}
        }, 0);
      }
      return;
    }
    const jobId = ++activeJob;
    setTimeout(() => scanImage(file, jobId), 0);
  }, true);

  console.info(`[Policy Scanner V${SCANNER_VERSION}] ready`);
})();
