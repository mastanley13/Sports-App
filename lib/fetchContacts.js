const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Mapping of custom field IDs to field names
const customFieldIdToNameMap = {
    'b0wPMAyfFKBPTu5NIjYG': 'Game ID',          // General Game ID
    // Other mappings...
};

async function fetchContacts(query) {
    console.log('Fetching contacts with query:', query);
    try {
        const oauthDataPath = path.join(__dirname, '../oauth_data.json');
        const oauthData = JSON.parse(fs.readFileSync(oauthDataPath, 'utf8'));
        const accessToken = oauthData.access_token;
        const locationId = oauthData.locationId;

        const customFieldIdToNameMap = {
            'b0wPMAyfFKBPTu5NIjYG': 'Game ID',          // General Game ID
            's9ucCtN8WpyedW7SZhuc': 'Week 4 Game ID',   // Week 4 Game ID
            '73neDmvUzB4SsUUqsKJl': 'Current Week',
            // Add other custom field mappings here as needed
        };

        const options = {
            method: 'GET',
            url: 'https://services.leadconnectorhq.com/contacts/',
            params: { locationId: locationId, query: query, limit: 100 },
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Version: '2021-07-28',
                Accept: 'application/json'
            }
        };

        console.log('Making API request with options:', options);
        const response = await axios.request(options);
        console.log('API response:', response.data);

        // Unpack custom fields for each contact
        const contactsWithCustomFields = response.data.contacts.map(contact => {
            console.log('Contact before mapping custom fields:', contact);

            if (contact.customFields && Array.isArray(contact.customFields)) {
                contact.customFields.forEach(field => {
                    // Map custom field ID to name
                    const fieldName = customFieldIdToNameMap[field.id] || field.id;
                    contact[fieldName] = field.value;
                });
            }

            console.log('Contact after mapping custom fields:', contact);
            return contact;
        });

        // Return only contacts without currentWeek
        return { contacts: contactsWithCustomFields };
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