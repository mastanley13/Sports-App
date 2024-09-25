const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function fetchContacts(query) {
    console.log('Fetching contacts with query:', query);
    try {
        const oauthDataPath = path.join(__dirname, '../oauth_data.json');
        const oauthData = JSON.parse(fs.readFileSync(oauthDataPath, 'utf8'));
        const accessToken = oauthData.access_token;
        const locationId = oauthData.locationId;

        const options = {
            method: 'GET',
            url: 'https://services.leadconnectorhq.com/contacts/',
            params: { locationId: locationId, query: query, limit: 20 },
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Version: '2021-07-28',
                Accept: 'application/json'
            }
        };

        console.log('Making API request with options:', options);
        const response = await axios.request(options);
        console.log('API response:', response.data);
        return { contacts: response.data.contacts };
    } catch (error) {
        console.error('Failed to fetch contacts:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
        throw error;
    }
}

router.get('/contacts', async (req, res) => {
    try {
        const firstName = req.query.firstName || '';
        const contacts = await fetchContacts(firstName.trim());
        res.json(contacts);
    } catch (error) {
        console.error('Error in /contacts route:', error);
        res.status(500).send('Error fetching contacts');
    }
});

module.exports = router;
module.exports.fetchContacts = fetchContacts;