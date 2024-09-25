const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

async function getOAuthData() {
    try {
        const data = await fs.readFile(path.join(__dirname, '..', 'oauth_data.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading oauth_data.json:', error);
        throw error;
    }
}

async function getTasks(contactId) {
    try {
        const oauthData = await getOAuthData();
        const { access_token: accessToken, locationId } = oauthData;

        const response = await axios.get(`https://services.leadconnectorhq.com/contacts/${contactId}/tasks`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Version': '2021-07-28',
                'Accept': 'application/json',
                'Location-Id': locationId
            }
        });

        return response.data.tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }
}

module.exports = { getTasks };