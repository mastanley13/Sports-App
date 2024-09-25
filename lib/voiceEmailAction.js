const axios = require('axios');
const { getContactIdByName } = require('./contactService');
const { generateEmailContent } = require('./voiceGenerateEmail');

async function handleEmailAction(parameters) {
    const { contact_name, email_subject, email_body } = parameters;
    const contactId = await getContactIdByName(contact_name);
    if (!contactId) {
        throw new Error('Contact not found');
    }

    const generatedEmail = await generateEmailContent(contact_name, email_subject, email_body);

    const response = await axios.post('/create-email', {
        contactId,
        subject: generatedEmail.subject,
        html: generatedEmail.body
    });

    if (response.status !== 200) {
        throw new Error('Failed to send email');
    }

    return 'Email sent successfully';
}

module.exports = { handleEmailAction };