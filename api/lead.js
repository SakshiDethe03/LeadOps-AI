/**
 * Vercel Serverless Function: Proxy Lead Form Submissions to Make.com Webhook
 * 
 * Exposes endpoint POST /api/lead
 * Protects the Make.com webhook URL by referencing process.env.MAKE_WEBHOOK_URL
 */

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Only POST requests are supported.'
    });
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('MAKE_WEBHOOK_URL is not configured in environment variables.');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error: Webhook endpoint not configured.'
    });
  }

  try {
    const { name, email, company, requirement } = req.body || {};

    if (!name || !email || !company || !requirement) {
      return res.status(400).json({
        success: false,
        error: 'Missing required lead fields (name, email, company, requirement).'
      });
    }

    const payload = {
      name: String(name).trim(),
      email: String(email).trim(),
      company: String(company).trim(),
      requirement: String(requirement).trim(),
      submittedAt: new Date().toISOString()
    };

    // Forward request to Make.com with 20s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const responseText = await response.text();
      return res.status(200).json({
        success: true,
        message: 'Lead successfully dispatched to Make.com workflow.',
        response: responseText || 'Accepted'
      });
    } else {
      console.error(`Make.com webhook returned HTTP status ${response.status}`);
      return res.status(502).json({
        success: false,
        error: `Workflow server error (HTTP ${response.status}). Please try again later.`
      });
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Request to Make.com timed out.');
      return res.status(504).json({
        success: false,
        error: 'Request to automation server timed out. Please try again.'
      });
    }

    console.error('Error proxying lead request:', error.message);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while dispatching lead.'
    });
  }
}
