const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

router.get('/templates', async (req, res) => {
    try {
        const type = req.query.type || 'email'; // Default to 'email' if not provided
        
        const oauthDataPath = path.join(__dirname, '../oauth_data.json');
        const oauthDataRaw = await fs.readFile(oauthDataPath, 'utf8');
        const oauthData = JSON.parse(oauthDataRaw);
        const accessToken = oauthData.access_token;
        const locationId = oauthData.locationId;

        const options = {
            method: 'GET',
            url: `https://services.leadconnectorhq.com/locations/${locationId}/templates`,
            params: { type, limit: 100 },
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Version: '2021-07-28',
                Accept: 'application/json'
            }
        };

        const response = await axios.request(options);
        
        // Modify response to include template name and nested information
        const templates = response.data.templates.map(template => ({
            id: template.id,
            name: template.name,
            subject: template.template.subject,
            body: template.template.html
        }));
        
        res.json({ templates }); // Return modified templates
    } catch (error) {
        console.error('Error fetching templates:', error.response ? error.response.data : error.message);
        res.status(500).json({ 
            error: 'Failed to fetch templates', 
            details: error.message,
            response: error.response ? error.response.data : null
        });
    }
});


module.exports = router;