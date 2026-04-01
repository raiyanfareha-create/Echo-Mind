const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// ১. মেটা ভেরিফিকেশন (Webhook Setup)
app.get('/api/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === 'AR_RAIYAN_SECRET_TOKEN') {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// ২. মেসেজ হ্যান্ডলিং (Smart Routing)
app.post('/api/webhook', async (req, res) => {
    try {
        const entry = req.body.entry?.[0];
        const changes = entry?.changes?.[0];
        const message = changes?.value?.messages?.[0];

        if (message && message.text) {
            const from = message.from;
            const text = message.text.body.toLowerCase();

            let reply = "";

            // স্মার্ট রাউটিং লজিক
            if (text.includes('diagnostic') || text.includes('report')) {
                reply = "হ্যালো! আমি 'Echo Mind', আপনার স্মার্ট ডায়াগনস্টিক অ্যাসিস্ট্যান্ট। আপনার রিপোর্ট কি তৈরি হয়েছে?";
            } else if (text.includes('mart') || text.includes('order')) {
                reply = "স্বাগতম! 'Echo Mind' বলছি। Ar RaiyanMart-এর সব অফার আমার কাছে আছে।";
            } else {
                reply = "শুভেচ্ছা! আমি 'Echo Mind', Ar Raiyan Ecosystem-এর অফিসিয়াল এআই। আপনাকে কীভাবে সাহায্য করতে পারি?";
            }

            // মেসেজ পাঠানোর ফাংশন কল
            await sendWhatsAppMessage(from, reply);
        }
        res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
        res.sendStatus(200); // মেটাকে সবসময় ২০০ পাঠাতে হয় যেন সে এরর না ভাবে
    }
});

// ৩. মেসেজ পাঠানোর ফাংশন
async function sendWhatsAppMessage(to, text) {
    try {
        await axios.post(
            `https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages`,
            {
                messaging_product: "whatsapp",
                to: to,
                text: { body: text }
            },
            {
                headers: { 'Authorization': `Bearer YOUR_ACCESS_TOKEN` }
            }
        );
    } catch (err) {
        console.error("Error sending message");
    }
}

module.exports = app;
