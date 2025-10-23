import https from "https";
import querystring from "querystring";

// Environment variables
const { VAPI_API_KEY, VAPI_ASSISTANT_ID, VAPI_PHONE_NUMBER_ID } = process.env;

// ---------- Helper functions ----------

function toE164(num, defaultCountry = "+91") {
  if (!num) return null;
  const cleaned = num.replace(/[^\d+]/g, "");
  if (!cleaned) return null;
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.length >= 10 && cleaned.length <= 15 && /^\d+$/.test(cleaned)) {
    if (cleaned.length === 10) return defaultCountry + cleaned;
    return "+" + cleaned;
  }
  return null;
}

function makeHttpsRequest(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on("error", reject);
    if (options.data) req.write(options.data);
    req.end();
  });
}

// ---------- API Connectivity Test ----------

async function testVapiConnectivity() {
  console.log("Testing Vapi API connectivity...");

  try {
    const response = await makeHttpsRequest(
      `https://api.vapi.ai/assistant/${VAPI_ASSISTANT_ID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          Accept: "application/json",
          "User-Agent": "Vercel-Node/18.x",
        },
      }
    );

    console.log(`Assistant endpoint test - Status: ${response.status}`);
    return response.status === 200;
  } catch (error) {
    console.log(`Assistant endpoint test failed: ${error.message}`);
    return false;
  }
}

// ---------- Create Call ----------

async function startVapiCall(firstName, company, phoneE164) {
  console.log(`Making Vapi call: ${firstName} at ${company} - ${phoneE164}`);

  const payload = {
    assistantId: VAPI_ASSISTANT_ID,
    phoneNumberId: VAPI_PHONE_NUMBER_ID,
    customer: {
      number: phoneE164,
      name: firstName || "Unknown",
    },
    // Optional — for tracking context
    metadata: {
      company_name: company,
    },
  };

  const data = JSON.stringify(payload);

  const headers = {
    Authorization: `Bearer ${VAPI_API_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "Vercel-Node/18.x",
  };

  console.log("Request payload:", data);

  try {
    // ✅ Use correct endpoint (singular)
    const response = await makeHttpsRequest("https://api.vapi.ai/call", {
      method: "POST",
      headers,
      data,
    });

    console.log(`Vapi response status: ${response.status}`);
    console.log(`Vapi response body: ${JSON.stringify(response.data)}`);

    return { success: response.status < 400, data: response.data };
  } catch (error) {
    console.log(`Vapi error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ---------- CORS + Headers ----------

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
  };
}

function applyHeaders(res, headers) {
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
}

// ---------- Main Handler ----------

export default async function handler(req, res) {
  console.log(`Vercel request: ${req.method} ${req.url}`);

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.status(204);
    applyHeaders(res, corsHeaders());
    res.end();
    return;
  }

  // GET → health check
  if (req.method === "GET") {
    res.status(200);
    applyHeaders(res, { ...corsHeaders(), "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // POST → start call
  if (req.method === "POST") {
    const contentType = (req.headers["content-type"] || "").toLowerCase();
    let body = req.body;

    if (typeof body === "string") {
      try {
        if (contentType.includes("application/json")) body = JSON.parse(body);
        else if (contentType.includes("application/x-www-form-urlencoded"))
          body = querystring.parse(body);
        else body = JSON.parse(body);
      } catch {
        try {
          body = querystring.parse(body);
        } catch {
          body = {};
        }
      }
    }

    const { first_name, company_name, phone } = body || {};
    const firstName = (first_name || "").trim();
    const companyName = (company_name || "").trim();
    const phoneRaw = (phone || "").trim();
    const phoneE164 = toE164(phoneRaw);

    console.log(
      `Form data: first_name=${firstName}, company_name=${companyName}, phone_raw=${phoneRaw}, phone_e164=${phoneE164}`
    );

    if (!firstName || !companyName || !phoneE164) {
      res.status(400);
      applyHeaders(res, {
        ...corsHeaders(),
        "content-type": "application/json",
      });
      res.end(JSON.stringify({ ok: false, message: "Missing or invalid fields" }));
      return;
    }

    // Test API connectivity
    if (!(await testVapiConnectivity())) {
      res.status(502);
      applyHeaders(res, {
        ...corsHeaders(),
        "content-type": "application/json",
      });
      res.end(JSON.stringify({ ok: false, message: "API connectivity test failed" }));
      return;
    }

    // Start the call
    const result = await startVapiCall(firstName, companyName, phoneE164);
    if (!result.success) {
      res.status(502);
      applyHeaders(res, {
        ...corsHeaders(),
        "content-type": "application/json",
      });
      res.end(
        JSON.stringify({
          ok: false,
          message:
            "We couldn't start the call right now. Please try again shortly.",
        })
      );
      return;
    }

    const callId = result.data?.id || null;
    res.status(200);
    applyHeaders(res, { ...corsHeaders(), "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, callId }));
    return;
  }

  // Unsupported methods
  res.status(405);
  applyHeaders(res, corsHeaders());
  res.end("Method Not Allowed");
}
