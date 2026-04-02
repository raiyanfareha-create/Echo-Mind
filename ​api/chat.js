const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // CORS Header যোগ করা হয়েছে যাতে ব্রাউজার রিকোয়েস্ট না আটকায়
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const apiKey = process.env.GEMINI_API_KEY;
  const { message } = req.body;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const botReply = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply: botReply });
    } else {
      res.status(500).json({ reply: "Gemini API থেক কোনো উত্তর আসেনি।" });
    }
  } catch (error) {
    res.status(500).json({ reply: "সার্ভারে সমস্যা হয়েছে।" });
  }
};
