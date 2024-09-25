const axios = require('axios');
const { getContactIdByName } = require('./contactService');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateSmsContent(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Generate a concise SMS message based on the given prompt. Keep it under 160 characters.' },
        { role: 'user', content: prompt }
      ],
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating SMS content:', error);
    return 'Error generating SMS content';
  }
}

async function handleSmsAction(parameters) {
    const { contact_name, sms_prompt } = parameters;
    const contactId = await getContactIdByName(contact_name);
    if (!contactId) {
        throw new Error('Contact not found');
    }

    const smsContent = await generateSmsContent(sms_prompt);

    const response = await axios.post('/create-sms', {
        contactId,
        message: smsContent
    });

    if (response.status !== 200) {
        throw new Error('Failed to send SMS');
    }

    return 'SMS sent successfully';
}

module.exports = { handleSmsAction };
