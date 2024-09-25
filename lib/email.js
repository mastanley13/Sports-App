const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const fs = require('fs').promises;
const path = require('path');

router.post('/create-email', async (req, res) => {
    const { contactId, userId, subject, html } = req.body;

    try {
        // Read the oauth_data.json file to get the access token
        const oauthDataPath = path.join(__dirname, '../oauth_data.json');
        const oauthDataRaw = await fs.readFile(oauthDataPath, 'utf8');
        const oauthData = JSON.parse(oauthDataRaw);
        const accessToken = oauthData.access_token;


        const options = {
            method: 'POST',
            url: `https://services.leadconnectorhq.com/conversations/messages`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Version: '2021-04-15',
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            data: {
                type: "Email",
                contactId: contactId,
                subject: subject,
                html: html,
                conversationProviderId: userId
            }
        };

        const { data } = await axios.request(options);
        res.json(data);
    } catch (error) {
        console.error('Error creating email:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.response ? error.response.data : 'Failed to create email' });
    }
});

module.exports = router;

