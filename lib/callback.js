const axios = require('axios');
const qs = require('qs');
const fs = require('fs');
const path = require('path');

const appConfig = require('../config/config.json');

async function callback(req, res) {
    const data = qs.stringify({
        'client_id': appConfig.clientId,
        'client_secret': appConfig.clientSecret,
        'grant_type': 'authorization_code',
        'code': req.query.code,
        'user_type': 'Location',
        'redirect_uri': appConfig.redirectUri
    });

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: appConfig.tokenEndpoint,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    };

    try {
        const response = await axios(config);
        const responseData = response.data;
        const filePath = path.join(__dirname, '..', 'oauth_data.json');
        fs.writeFileSync(filePath, JSON.stringify(responseData, null, 4));
        res.redirect('/'); // Redirect to the UI
    } catch (err) {
        console.error(err);
        res.status(err.response?.status || 500).json({ error: 'An error occurred during the callback process.' });
    }
}

module.exports = callback;
