import https from 'https';
import querystring from 'querystring';

// Environment variables
const { VAPI_API_KEY, VAPI_ASSISTANT_ID, VAPI_PHONE_NUMBER_ID } = process.env;

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
  
  if (req.method === 'OPTIONS') {
    res.status(204).setHeader(corsHeaders()).end();
    return;
  }
  
  if (req.method === 'GET') {
    res.status(200)
      .setHeader({
        ...corsHeaders(),
        'content-type': 'application/json'
      })
      .json({ ok: true });
    return;
  }
  
  if (req.method === 'POST') {
    const contentType = (req.headers['content-type'] || '').toLowerCase();
    let body = req.body;
    if (typeof body === 'string') {
      try {
        if (contentType.includes('application/json')) body = JSON.parse(body);
        else if (contentType.includes('application/x-www-form-urlencoded')) body = querystring.parse(body);
        else body = JSON.parse(body);
      } catch {
        try { body = querystring.parse(body); } catch { body = {}; }
      }
    }
    const { first_name, company, phone } = body || {};
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
