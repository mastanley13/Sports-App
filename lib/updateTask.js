const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

router.put('/update-task/:taskId', async (req, res) => {
    console.log('Update task route hit');
    try {
        const taskId = req.params.taskId;
        const taskData = req.body; // Extract task data from request body
        console.log('Received task data for update:', taskData);

        const oauthDataPath = path.join(__dirname, '../oauth_data.json');
        const oauthData = JSON.parse(fs.readFileSync(oauthDataPath, 'utf8'));
        const accessToken = oauthData.access_token;
        const contactId = taskData.contactId; // Extract contactId from task data

        console.log('Task ID:', taskId);
        console.log('Contact ID:', contactId);

        if (!contactId) {
            throw new Error('contactId is required');
        }

        // Format the dueDate to the required format
        const dueDate = new Date(taskData.dueDate).toISOString();

        const url = `https://services.leadconnectorhq.com/contacts/${contactId}/tasks/${taskId}`;
        console.log('Constructed URL:', url);

        const options = {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Version: '2021-07-28',
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            data: {
                title: taskData.title,
                body: taskData.body,
                dueDate: dueDate,
                completed: taskData.completed || false,
                assignedTo: taskData.assignedTo || null
            }
        };

        console.log('Request options:', options);

        const response = await axios.request({ url, ...options });
        res.json(response.data);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).send('Error updating task');
    }
});

module.exports = router;
module.exports = router;