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
  try {
    const res = await fetch('/api/call', {
      method: 'POST',
      headers: { 'content-type':'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) { ok.style.display='block'; form.reset(); window.scrollTo({top:0,behavior:'smooth'}); }
    else { err.style.display='block'; }
  } catch { err.style.display='block'; }
});

