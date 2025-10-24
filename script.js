(function(){
  const params = new URLSearchParams(window.location.search);
  const fields = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"]; 
  fields.forEach(k=>{ const el=document.querySelector(`[name="${k}"]`); if(el) el.value = params.get(k)||""; });
  const ref = document.querySelector('[name="referrer"]'); if(ref) ref.value = document.referrer||"";
})();

const form = document.getElementById('call-form');
const ok = document.getElementById('ok');
const err = document.getElementById('err');

form.addEventListener('submit', async (e) => {
  e.preventDefault(); ok.style.display='none'; err.style.display='none';
  const fd = new FormData(form);
  const payload = Object.fromEntries(fd.entries());
  
  // Log all form data before processing
  console.log('=== FORM SUBMISSION START ===');
  console.log('Raw form data:', payload);
  console.log('Timestamp:', new Date().toISOString());
  console.log('User Agent:', navigator.userAgent);
  console.log('Referrer:', document.referrer);
  console.log('Current URL:', window.location.href);
  
  // Combine country code and phone number
  const countryCode = payload.country_code;
  const phoneNumber = payload.phone_number;
  if (countryCode && phoneNumber) {
    payload.phone = countryCode + phoneNumber;
    console.log(`✅ Phone number combination: ${countryCode} + ${phoneNumber} = ${payload.phone}`);
  } else {
    console.warn('❌ Missing country code or phone number:', { countryCode, phoneNumber });
  }
  
  // Remove the separate fields as we now have combined phone
  delete payload.country_code;
  delete payload.phone_number;
  
  // Log final payload being sent to API
  console.log('Final API payload:', payload);
  console.log('=== FORM SUBMISSION END ===');
  
  try {
    const res = await fetch('/api/call', {
      method: 'POST',
      headers: { 'content-type':'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log('API Response Status:', res.status);
    console.log('API Response OK:', res.ok);
    
    if (res.ok) { 
      ok.style.display='block'; 
      form.reset(); 
      window.scrollTo({top:0,behavior:'smooth'}); 
      console.log('✅ Form submitted successfully');
    } else { 
      err.style.display='block'; 
      console.error('❌ API returned error status:', res.status);
    }
  } catch (error) { 
    err.style.display='block'; 
    console.error('❌ Network error:', error);
  }
});

