export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ reply: "Vercel-এ API Key পাওয়া যায়নি।" });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();
    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "দুঃখিত, আমি উত্তর খুঁজে পাচ্ছি না।";
    
    res.status(200).json({ reply: botReply });
  } catch (error) {
    res.status(500).json({ reply: "সার্ভার কানেকশনে সমস্যা হচ্ছে।" });
  }
}
