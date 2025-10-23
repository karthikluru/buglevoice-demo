// Vercel API route handler - converted from AWS Lambda
import https from 'https';
import querystring from 'querystring';

// Environment variables
const VAPI_API_KEY = process.env.VAPI_API_KEY || "515ea128-6cba-4655-aae0-4d6199251c7a";
const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID || "45bb15ee-8850-4675-9b95-9e235ebcbb91";
const VAPI_PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID || "0cd865a1-41ad-4023-a936-cbe45e356126";

// HTML content
const HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Try Luru : Instant AI Call</title>
  <meta name="description" content="Trigger an instant AI call from Luru's voice assistant." />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root { --bg:#0b0b10; --card:#12121a; --text:#eaeaf2; --muted:#a8a8b3; --accent:#7c5cff; --accent-2:#5ee1a2; }
    *{box-sizing:border-box} 
    body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial;color:var(--text);background:radial-gradient(600px 300px at 80% -20%, rgba(124,92,255,.15), transparent),radial-gradient(600px 300px at -10% 120%, rgba(94,225,162,.1), transparent),var(--bg);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px} 
    a{color:var(--accent)} 
    .container{max-width:820px;width:100%;padding:32px}
    header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:24px;flex-wrap:wrap}
    .brand{display:flex;gap:12px;align-items:center}
    .logo{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--accent-2));box-shadow:0 8px 24px rgba(124,92,255,.35)}
    .logo-img{width:36px;height:36px;border-radius:10px;box-shadow:0 8px 24px rgba(124,92,255,.35)}
    .title{font-size:18px;font-weight:700}
    .bugle-container{display:flex;align-items:center;justify-content:center}
    .bugle-img{width:60px;height:60px;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,.2);transition:transform 0.3s ease}
    .bugle-img:hover{transform:scale(1.05)}
    .card{background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:28px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
    h1{font-size:32px;line-height:1.1;margin:0 0 8px}
    .sub{color:var(--muted);margin:0 0 20px}
    form{display:grid;gap:12px;margin-top:8px}
    .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    input,button{font:inherit}
    input{width:100%;padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:#0f0f16;color:var(--text)}
    input::placeholder{color:#818191}
    button{cursor:pointer;border:0;border-radius:12px;padding:12px 16px;font-weight:700;background:linear-gradient(135deg,var(--accent),#5f46ff);color:white;box-shadow:0 8px 24px rgba(124,92,255,.35)}
    .small{font-size:12px;color:var(--muted)}
    .consent-text{margin:16px 0;padding:16px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:8px;font-size:7.8px;color:var(--muted)}
    .consent-text p{margin:0 0 8px;font-weight:600;color:var(--text)}
    .consent-text ol{margin:0;padding-left:20px}
    .consent-text li{margin-bottom:4px;line-height:1.4}
    .success{display:none;margin-top:12px;padding:12px;border:1px solid rgba(94,225,162,.4);background:rgba(94,225,162,.12);border-radius:10px}
    .error{display:none;margin-top:12px;padding:12px;border:1px solid rgba(255,145,145,.4);background:rgba(255,145,145,.12);border-radius:10px}
    @media (max-width:768px){
      body{padding:16px}
      .container{padding:24px;max-width:100%}
      .row{grid-template-columns:1fr}
      h1{font-size:28px;line-height:1.2}
      .card{padding:20px}
      .brand{gap:8px}
      .logo-img,.logo{width:32px;height:32px}
      .title{font-size:16px}
      .bugle-img{width:50px;height:50px}
      .consent-text{padding:12px;font-size:7.2px}
      .consent-text ol{padding-left:16px}
      input,button{padding:14px 16px;font-size:16px}
      button{padding:16px 20px;font-size:16px}
      header{justify-content:center;text-align:center;margin-bottom:20px}
    }
    @media (max-width:480px){
      body{padding:12px}
      .container{padding:16px}
      .card{padding:16px}
      h1{font-size:24px}
      .sub{font-size:14px}
      .consent-text{padding:10px;font-size:6.6px}
      .consent-text p{margin-bottom:6px}
      .consent-text li{margin-bottom:2px}
      .bugle-img{width:40px;height:40px}
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand"><img src="https://luruai-ss.s3.us-west-2.amazonaws.com/luru/artifacts/newluru-new-logo.png" alt="Luru Logo" class="logo-img"><div class="title">Luru</div></div>
      <div class="bugle-container"><img src="https://luruai-ss.s3.us-west-2.amazonaws.com/luru/artifacts/Bugle_nobg.png" alt="Bugle AI" class="bugle-img"></div>
    </header>

    <main class="card">
      <h1>Talk to Bugle AI</h1>
      <p class="sub">Enter your details and tap <b>Call me now</b>. Bugle will call you immediately.</p>

      <form id="call-form" method="POST" action="">
        <div class="row">
          <input required name="first_name" type="text" placeholder="First name" />
          <input required name="company" type="text" placeholder="Company name" />
        </div>
        <input required name="phone" type="tel" placeholder="Phone number (e.g., +1 415 555 0100)" />

        <input type="hidden" name="utm_source" />
        <input type="hidden" name="utm_medium" />
        <input type="hidden" name="utm_campaign" />
        <input type="hidden" name="utm_content" />
        <input type="hidden" name="utm_term" />
        <input type="hidden" name="referrer" />

        <div class="consent-text">
          <p>By clicking "Call me now" below, you:</p>
          <ol>
            <li>Confirm that the phone number entered is your own</li>
            <li>Consent to receive calls from Luru using AI and/or human agents</li>
            <li>Acknowledge that standard call rates may apply</li>
          </ol>
        </div>

        <button type="submit">Call me now</button>
        <div id="ok" class="success">We're calling you now—keep your phone ready.</div>
        <div id="err" class="error">Something went wrong starting the call. Please try again in a moment.</div>
      </form>
    </main>
  </div>

  <script>
    (function(){
      const params = new URLSearchParams(window.location.search);
      const fields = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"]; 
      fields.forEach(k=>{ const el=document.querySelector(\`[name="\${k}"]\`); if(el) el.value = params.get(k)||""; });
      const ref = document.querySelector('[name="referrer"]'); if(ref) ref.value = document.referrer||"";
    })();

    const form = document.getElementById('call-form');
    const ok = document.getElementById('ok');
    const err = document.getElementById('err');
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); ok.style.display='none'; err.style.display='none';
      const fd = new FormData(form);
      try {
        const res = await fetch('', { method: 'POST', headers: { 'content-type':'application/x-www-form-urlencoded' }, body: new URLSearchParams([...fd]).toString() });
        if (res.ok) { ok.style.display='block'; form.reset(); window.scrollTo({top:0,behavior:'smooth'}); }
        else { err.style.display='block'; }
      } catch { err.style.display='block'; }
    });
  </script>
</body>
</html>`;

// Helper functions
function toE164(num, defaultCountry = "+91") {
  if (!num) return null;
  const cleaned = num.replace(/[^\d+]/g, '');
  if (!cleaned) return null;
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.length >= 10 && cleaned.length <= 15 && /^\d+$/.test(cleaned)) {
    if (cleaned.length === 10) return defaultCountry + cleaned;
    return '+' + cleaned;
  }
  return null;
}

function makeHttpsRequest(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    if (options.data) req.write(options.data);
    req.end();
  });
}

async function testVapiConnectivity() {
  console.log('Testing Vapi API connectivity...');
  
  try {
    const response = await makeHttpsRequest('https://api.vapi.ai/assistant', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Accept': 'application/json',
        'User-Agent': 'Vercel-Node/18.x'
      }
    });
    
    console.log(`Assistant endpoint test - Status: ${response.status}`);
    return response.status === 200;
  } catch (error) {
    console.log(`Assistant endpoint test failed: ${error.message}`);
    return false;
  }
}

async function startVapiCall(firstName, company, phoneE164) {
  console.log(`Making Vapi call: ${firstName} at ${company} - ${phoneE164}`);
  
  const payload = {
    assistantId: VAPI_ASSISTANT_ID,
    phoneNumberId: VAPI_PHONE_NUMBER_ID,
    customer: { number: phoneE164, name: firstName },
    assistantOverrides: {
      variableValues: {
        company_name: company,
        first_name: firstName
      }
    }
  };
  
  const data = JSON.stringify(payload);
  
  const headers = {
    'Authorization': `Bearer ${VAPI_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Vercel-Node/18.x',
    'X-Requested-With': 'XMLHttpRequest'
  };
  
  console.log(`Request payload: ${data}`);
  
  try {
    const response = await makeHttpsRequest('https://api.vapi.ai/call', {
      method: 'POST',
      headers,
      data
    });
    
    console.log(`Vapi response status: ${response.status}`);
    console.log(`Vapi response body: ${JSON.stringify(response.data)}`);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.log(`Vapi error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'content-type'
  };
}

export default async function handler(req, res) {
  console.log(`Vercel request: ${req.method} ${req.url}`);
  
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(204).setHeader(corsHeaders()).end();
    return;
  }
  
  if (req.method === 'GET') {
    res.status(200)
      .setHeader({
        ...corsHeaders(),
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store'
      })
      .send(HTML);
    return;
  }
  
  if (req.method === 'POST') {
    const { first_name, company, phone } = req.body;
    const firstName = (first_name || '').trim();
    const companyName = (company || '').trim();
    const phoneRaw = (phone || '').trim();
    const phoneE164 = toE164(phoneRaw);
    
    console.log(`Form data: first_name=${firstName}, company=${companyName}, phone_raw=${phoneRaw}, phone_e164=${phoneE164}`);
    
    if (!firstName || !companyName || !phoneE164) {
      res.status(400)
        .setHeader({
          ...corsHeaders(),
          'content-type': 'application/json'
        })
        .json({ ok: false, message: 'Missing or invalid fields' });
      return;
    }
    
    // Test API connectivity first
    if (!(await testVapiConnectivity())) {
      res.status(502)
        .setHeader({
          ...corsHeaders(),
          'content-type': 'application/json'
        })
        .json({ ok: false, message: 'API connectivity test failed' });
      return;
    }
    
    const result = await startVapiCall(firstName, companyName, phoneE164);
    if (!result.success) {
      res.status(502)
        .setHeader({
          ...corsHeaders(),
          'content-type': 'application/json'
        })
        .json({ ok: false, message: 'We couldn\'t start the call right now. Please try again shortly.' });
      return;
    }
    
    const callId = result.data?.id || null;
    res.status(200)
      .setHeader({
        ...corsHeaders(),
        'content-type': 'application/json'
      })
      .json({ ok: true, callId });
    return;
  }
  
  res.status(405).setHeader(corsHeaders()).send('Method Not Allowed');
}
