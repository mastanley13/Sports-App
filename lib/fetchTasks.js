const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

router.post('/fetch-tasks', async (req, res) => {
    try {
        console.log('Request body:', req.body);
        const tasks = await getTasksFromDataSource(req.body);
        console.log('Tasks fetched from data source:', tasks);
        res.json({ tasks });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).send('Error fetching tasks');
    }
});

async function getTasksFromDataSource(requestBody) {
    try {
        // Read the oauth_data.json file to get the access token and location ID
        const oauthDataPath = path.join(__dirname, '../oauth_data.json');
        const oauthData = JSON.parse(fs.readFileSync(oauthDataPath, 'utf8'));
        const accessToken = oauthData.access_token;
        const locationId = oauthData.locationId;

        // Merge the incoming request body with default values
        const data = {
            ...requestBody,
            completed: false,
            limit: 1000
        };

        const options = {
            method: 'POST',
            url: `https://services.leadconnectorhq.com/locations/${locationId}/tasks/search`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Version: '2021-07-28',
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            data
        };

        console.log('Sending request to external API with options:', options);
        const response = await axios.request(options);
        console.log('Response from external API:', response.data);
        return response.data.tasks; // Adjust based on actual API response structure
    } catch (error) {
        console.error('Error fetching tasks from API:', error);
        throw error;
    }
}
module.exports = router;