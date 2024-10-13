const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const getNotes = require('./getNotes'); // Import getNotes

async function getContact(contactId) {
    const oauthDataPath = path.join(__dirname, '../oauth_data.json');
    const oauthData = JSON.parse(fs.readFileSync(oauthDataPath, 'utf8'));
    const accessToken = oauthData.access_token;

    const options = {
        method: 'GET',
        url: `https://services.leadconnectorhq.com/contacts/${contactId}`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Version: '2021-07-28',
            Accept: 'application/json'
        }
    };

    try {
        const { data } = await axios.request(options);
        return { data, accessToken }; // Return both data and accessToken
    } catch (error) {
        console.error('Error fetching contact data:', error);
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        }
        throw new Error('Failed to fetch contact data');
    }
}

router.get('/get-contact/:contactId', async (req, res) => {
    try {
        const contactId = req.params.contactId;
        const { data: contact, accessToken } = await getContact(contactId);
        const notes = await getNotes(contactId, accessToken); // Pass accessToken
        res.json({ contact, notes }); // Return both contact and notes
    } catch (error) {
        console.error('Failed to fetch contact or notes:', error);
        res.status(500).json({ error: 'Error fetching contact or notes' });
    }
});

module.exports = router;
module.exports.getContact = getContact;
