const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function getNotes(contactId, accessToken) {
    const options = {
        method: 'GET',
        url: `https://services.leadconnectorhq.com/contacts/${contactId}/notes`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Version: '2021-07-28',
            Accept: 'application/json'
        }
    };

    try {
        const { data } = await axios.request(options);
        return data;
    } catch (error) {
        console.error('Error fetching notes:', error);
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        }
        throw new Error('Failed to fetch notes');
    }
}

module.exports = getNotes;