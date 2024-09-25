const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

router.put('/complete-task/:taskId', async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const contactId = req.body.contactId; // Assuming contactId is sent in the request body

        if (!taskId || !contactId) {
            console.error('taskId or contactId missing');
            return res.status(400).send('taskId and contactId are required');
        }

        const oauthDataPath = path.join(__dirname, '../oauth_data.json');
        const oauthData = JSON.parse(fs.readFileSync(oauthDataPath, 'utf8'));
        const accessToken = oauthData.access_token;

        console.log('OAuth Data:', oauthData);
        console.log('Access Token:', accessToken);

        const url = `https://services.leadconnectorhq.com/contacts/${contactId}/tasks/${taskId}/completed`;
        const options = {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Version: '2021-07-28',
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            data: { completed: true }
        };

        console.log('Request URL:', url);
        console.log('Request options:', options);

        const { data } = await axios.request({ url, ...options });
        console.log('Task marked as complete:', data);
        res.json(data);
    } catch (error) {
        console.error('Error marking task as complete:', error);
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        }
        res.status(500).send('Error marking task as complete');
    }
});

module.exports = router;
