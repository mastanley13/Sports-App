const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

router.delete('/delete-task/:taskId', async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const contactId = req.body.contactId; // Assuming contactId is sent in the request body

        if (!taskId || !contactId) {
            return res.status(400).send('taskId and contactId are required');
        }

        const oauthDataPath = path.join(__dirname, '../oauth_data.json');
        const oauthData = JSON.parse(fs.readFileSync(oauthDataPath, 'utf8'));
        const accessToken = oauthData.access_token;

        const url = `https://services.leadconnectorhq.com/contacts/${contactId}/tasks/${taskId}`;
        const options = {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Version: '2021-07-28',
                Accept: 'application/json'
            }
        };

        const { data } = await axios.request({ url, ...options });
        console.log('Task deleted:', data);
        res.json(data);
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).send('Error deleting task');
    }
});

module.exports = router;

