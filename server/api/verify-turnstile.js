const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

async function verifyTurnstileToken(token) {
  if (!token) {
    console.log('No token provided');
    return false;
  }
  
  if (!process.env.TURNSTILE_SECRET_KEY) {
    console.error('TURNSTILE_SECRET_KEY not found in environment variables');
    return false;
  }

  try {
    console.log('Verifying token with secret key:', process.env.TURNSTILE_SECRET_KEY);
    const formData = new URLSearchParams();
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY);
    formData.append('response', token);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    const data = await response.json();
    console.log('Turnstile verification response:', data);
    return data.success;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

router.post('/verify-turnstile', async (req, res) => {
  try {
    const { token } = req.body;
    const isValid = await verifyTurnstileToken(token);
    res.json({ success: isValid });
  } catch (error) {
    console.error('Turnstile verification error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

module.exports = router;
module.exports.verifyTurnstileToken = verifyTurnstileToken;
