const axios = require('axios');
const qs = require('qs');
const config = require('../config/config');

async function refresh(req, res) {
    try {
        const data = qs.stringify({
            'client_id': config.clientId,
            'client_secret': config.clientSecret,
            'grant_type': 'refresh_token',
            'refresh_token': req.query.token,
            'user_type': 'Location',
            'redirect_uri': config.redirectUri
        });

        const axiosConfig = {
            method: 'post',
            maxBodyLength: Infinity,
            url: config.tokenEndpoint,
            headers: { 
                'Accept': 'application/json', 
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        const response = await axios.request(axiosConfig);
        return res.json({ data: response.data });
    } catch (error) {
        console.error('Error refreshing token:', error);
        return res.status(500).send('Error refreshing token');
    }
}

module.exports = refresh;

