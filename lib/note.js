const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

router.post('/create-note', async (req, res) => {
    console.log('Received note creation request:', req.body);
    const { contactId, body } = req.body;

    if (!contactId || !body) {
        console.error('Missing required fields:', { contactId, body });
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Read the oauth_data.json file to get the access token
        const oauthDataPath = path.join(__dirname, '../oauth_data.json');
        const oauthDataRaw = await fs.promises.readFile(oauthDataPath, 'utf8');
        const oauthData = JSON.parse(oauthDataRaw);
        const accessToken = oauthData.access_token;

        const options = {
            method: 'POST',
            url: `https://services.leadconnectorhq.com/contacts/${contactId}/notes`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Version: '2021-07-28',
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            data: { body }
        };

        const { data } = await axios.request(options);
        res.json(data);
    } catch (error) {
        console.error('Error creating note:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.response ? error.response.data : 'Failed to create note' });
    }
});

module.exports = router;