const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function createContact(contactData) {
    const oauthDataPath = path.join(__dirname, '../oauth_data.json');
    console.log('OAuth data path:', oauthDataPath);
    let oauthData;
    try {
        oauthData = JSON.parse(fs.readFileSync(oauthDataPath, 'utf8'));
        console.log('OAuth data loaded successfully:', oauthData);
    } catch (error) {
        console.error('Error reading oauth_data.json:', error);
        throw error;
    }
    const accessToken = oauthData.access_token;
    const locationId = oauthData.locationId;
    console.log('Access Token:', accessToken);
    console.log('Location ID:', locationId);

    // Add locationId to contactData
    contactData.locationId = locationId;

    const options = {
        method: 'POST',
        url: 'https://services.leadconnectorhq.com/contacts/',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        data: contactData
    };

    console.log('Sending request to GHL API:', JSON.stringify(options, null, 2));

    try {
        const response = await axios(options);
        console.log('Successful response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating contact:', error.message);
        if (error.response) {
            console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        }
        throw error;
    }
}

router.post('/contacts', async (req, res) => {
    try {
        console.log('Received contact data:', JSON.stringify(req.body, null, 2));
        const newContact = await createContact(req.body);
        res.status(201).json(newContact);
    } catch (error) {
        console.error('Error in /contacts route:', error);
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to create contact', 
            details: error.response?.data || error.message
        });
    }
});

module.exports = router;
