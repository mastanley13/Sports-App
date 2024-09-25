const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateEmailContent(contactName, emailSubject, emailBody) {
  try {
    const prompt = `Generate a well-formatted email in HTML with the following details:
    - Contact Name: ${contactName}
    - Subject: ${emailSubject}
    - Body: ${emailBody}
    Ensure the email is properly formatted in HTML, with no mis-cased characters, and addresses the recipient appropriately. Do not include a signature or any placeholders like [your name].`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Generate a well-formatted email in HTML. Ensure no mis-cased characters, and addresses the recipient appropriately. Do not close the email with signature or any placeholders like [your name].' },
        { role: 'user', content: prompt }
      ],
    });

    const emailContent = response.choices[0].message.content;
    
    // Split the email content into subject and body
    const lines = emailContent.split('\n').filter(line => line.trim() !== '');
    const subject = lines[0].replace('Subject: ', '').trim(); // Extract subject from the first line
    const body = lines.slice(1).join('\n').trim(); // Join the rest as body

    return {
      subject: subject,
      body: `<html><body>${body}</body></html>`, // Wrap body in HTML tags
    };
  } catch (error) {
    console.error('Error generating email content:', error);
    return {
      subject: 'Error generating subject',
      body: '<html><body>Error generating body</body></html>',
    };
  }
}

module.exports = { generateEmailContent };