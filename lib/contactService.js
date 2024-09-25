const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function getContactIdByName(contactName) {
    const oauthDataPath = path.join(__dirname, '../oauth_data.json');
    const oauthData = JSON.parse(fs.readFileSync(oauthDataPath, 'utf8'));
    const accessToken = oauthData.access_token;
    const locationId = oauthData.locationId;

    const options = {
        method: 'GET',
        url: 'https://services.leadconnectorhq.com/contacts/',
        params: { locationId: locationId, query: contactName, limit: 1 },
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Version: '2021-07-28',
            Accept: 'application/json'
        }
    };

    const response = await axios.request(options);
    const contacts = response.data.contacts;
    if (contacts && contacts.length > 0) {
        return contacts[0].id;
    } else {
        return null;
    }
}

module.exports = { getContactIdByName };