const config = require('../config/config');

module.exports = async (req, res) => {
    try {
        const options = {
            requestType: "code",
            redirectUri: config.redirectUri,
            clientId: config.clientId,
            scopes: [
                "contacts.readonly",
                "contacts.write",
                "locations.readonly",
                "locations/tasks.readonly",
                "conversations/message.write",
                "conversations/message.readonly",
                "locations/templates.readonly"
            ]
        };

        const authUrl = `${config.baseUrl}/oauth/chooselocation?response_type=${options.requestType}&redirect_uri=${options.redirectUri}&client_id=${options.clientId}&scope=${options.scopes.join(' ')}`;
        return res.redirect(authUrl);
    } catch (error) {
        res.status(500).send('Error initiating');
    }
};