const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
require('dotenv').config(); // Ensure this line is present to load environment variables

router.post('/generate-sms', async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.error('OpenAI API key is missing');
        return res.status(500).json({ error: 'OpenAI API key is missing' });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 150
            })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        const message = data.choices[0].message.content;

        res.json({ message });
    } catch (error) {
        console.error('Error generating SMS:', error);
        res.status(500).json({ error: 'Failed to generate SMS' });
    }
});

module.exports = router;
