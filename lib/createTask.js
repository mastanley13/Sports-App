const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

function formatDateWithTimezoneOffset(date) {
    const pad = (num) => (num < 10 ? '0' : '') + num;
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const hours = pad(Math.floor(Math.abs(offset) / 60));
    const minutes = pad(Math.abs(offset) % 60);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${sign}${hours}:${minutes}`;
}

router.post('/create-task', async (req, res) => {
    try {
        const taskData = req.body; // Extract task data from request body
        console.log('Received task data:', taskData);
        const contactId = taskData.contactId;
        console.log('Contact ID:', contactId); // Verify this is correct

        const oauthDataPath = path.join(__dirname, '../oauth_data.json');
        const oauthData = JSON.parse(fs.readFileSync(oauthDataPath, 'utf8'));
        console.log('OAuth data:', oauthData);

        const accessToken = oauthData.access_token;

        if (!contactId) {
            throw new Error('contactId is required');
        }

        // Format the dueDate to the required format
        const dueDate = formatDateWithTimezoneOffset(new Date(taskData.dueDate));

        const url = `https://services.leadconnectorhq.com/contacts/${contactId}/tasks`;
        const options = {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Version: '2021-07-28',
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                title: taskData.title,
                body: taskData.body,
                dueDate: dueDate,
                completed: taskData.completed || false
            })
        };

        console.log('Request options:', options);

        const response = await fetch(url, options);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).send('Error creating task');
    }
});

module.exports = router;
module.exports = router;