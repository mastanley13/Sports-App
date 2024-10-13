require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');
const fs = require('fs');
const dotenv = require('dotenv');
const app = express();
const fetchTasksRouter = require('./lib/fetchTasks');
const createTaskRouter = require('./lib/createTask');
const updateTaskRouter = require('./lib/updateTask');
const deleteTaskRouter = require('./lib/deleteTask');
const fetchContactsRouter = require('./lib/fetchContacts');
const completeTaskRouter = require('./lib/completeTask');
const chatbotAssistantRouter = require('./lib/chatbotAssistant');
const getNotes = require('./lib/getNotes');
const getContact = require('./lib/getContact');
const { getOAuthData } = require('./db/dbUtils');
const emailRouter = require('./lib/email');
const noteRouter = require('./lib/note');
const smsRouter = require('./lib/sms');
const generateEmailRouter = require('./lib/generateEmail');
const generateSmsRouter = require('./lib/generateSms');
const { handleVoiceCommand, createNewVoiceCommandThread } = require('./lib/voiceCommandHandler');
const fetchTemplatesRouter = require('./lib/fetchTemplates');
const { getTasks } = require('./lib/getTasks');
const createContactRouter = require('./lib/createContact');
const getContactRouter = require('./lib/getContact');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

let contactThreadId = process.env.CONTACT_CHATBOT_THREAD_ID;

function updateEnvFile(key, value) {
    const envConfig = dotenv.parse(fs.readFileSync('.env'));
    envConfig[key] = value;
    fs.writeFileSync('.env', Object.entries(envConfig).map(([key, value]) => `${key}=${value}`).join('\n'));
}

console.log("API Key:", process.env.OPENAI_API_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'max-age=31536000, immutable');
        res.setHeader('X-Content-Type-Options', 'nosniff');
    }
}));

// Disable 'x-powered-by' header
app.disable('x-powered-by');

app.use(fetchTasksRouter);
app.use(createTaskRouter);
app.use(updateTaskRouter);
app.use(deleteTaskRouter);
app.use(fetchContactsRouter);
app.use(completeTaskRouter);
app.use(chatbotAssistantRouter);
app.use(emailRouter);
app.use(noteRouter);
app.use(smsRouter);
app.use(generateEmailRouter);
app.use(generateSmsRouter);
app.use('/api', fetchTemplatesRouter);
app.use('/api', createContactRouter);
app.use(getContactRouter);

// Serve oauth_data.json statically
app.use('/oauth_data.json', express.static(path.join(__dirname, 'oauth_data.json')));

app.get('/initiate', require('./lib/initiate'));
app.get('/refresh', require('./lib/refresh'));
app.get('/oauth/callback', require('./lib/callback'));

app.get('/get-tasks/:contactId', async (req, res) => {
    try {
        const tasks = await getTasks(req.params.contactId);
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// GPT-4 Search Endpoint
app.post('/api/search', async (req, res) => {
    const { query } = req.body;
    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: `Search for tasks or contacts related to: ${query}` }],
            model: "gpt-4o",
        });
        res.json(completion.choices[0].message);
    } catch (error) {
        console.error('Error interacting with GPT-4:', error);
        res.status(500).json({ error: 'Failed to fetch search results' });
    }
});

// Contact-specific Chatbot Endpoint
app.post('/api/contact-chatbot', async (req, res) => {
    const { message, contactId } = req.body;
    try {
        console.log(`Received message: ${message}`);
        console.log(`Fetching contact details for contactIds:`, contactId);

        // Fetch contact details for both teams
        const { data: homeTeam, accessToken: homeAccessToken } = await getContactRouter.getContact(contactId.homeTeam);
        const { data: awayTeam, accessToken: awayAccessToken } = await getContactRouter.getContact(contactId.awayTeam);

        // Fetch contact notes for both teams
        const homeTeamNotes = await getNotes(contactId.homeTeam, homeAccessToken);
        const awayTeamNotes = await getNotes(contactId.awayTeam, awayAccessToken);

        // Combine the information
        const matchupInfo = {
            homeTeam: { ...homeTeam, notes: homeTeamNotes },
            awayTeam: { ...awayTeam, notes: awayTeamNotes }
        };

        // Create a new thread if one doesn't exist
        if (!contactThreadId) {
            const thread = await openai.beta.threads.create();
            contactThreadId = thread.id;
            console.log('New contact thread created:', contactThreadId);
            updateEnvFile('CONTACT_CHATBOT_THREAD_ID', contactThreadId);
            process.env.CONTACT_CHATBOT_THREAD_ID = contactThreadId;
        }

        // Add messages to the thread
        await openai.beta.threads.messages.create(contactThreadId, {
            role: "user",
            content: `System: You are a helpful assistant with access to contact information and notes. The JSON string of contact data and notes are important information about a contact, that the user will ask general questions about. Do not use 'id' strings in your response, only use the data in plain language. Bullet Point or outline answers are preferred, but not mandatory. You provide very detailed and formatted responses, allowing the user to understand the information. The JSON string is: ${JSON.stringify(matchupInfo)}`
        });

        await openai.beta.threads.messages.create(contactThreadId, {
            role: "user",
            content: message
        });

        // Run the thread
        const run = await openai.beta.threads.runs.create(contactThreadId, {
            assistant_id: process.env.CONTACT_CHATBOT_ASSISTANT_ID
        });

        console.log("Run created:", run);

        // Wait for the run to complete
        let runStatus = await openai.beta.threads.runs.retrieve(contactThreadId, run.id);
        while (runStatus.status !== 'completed') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            runStatus = await openai.beta.threads.runs.retrieve(contactThreadId, run.id);
        }

        // Get the assistant's response
        const messages = await openai.beta.threads.messages.list(contactThreadId);
        const botResponse = messages.data[0].content[0].text.value;
        console.log("Assistant's response:", botResponse);

        res.json({ content: botResponse });
    } catch (error) {
        console.error('Error interacting with Contact Assistant:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        res.status(500).json({ error: 'Failed to interact with Contact Assistant', details: error.message });
    }
});

// New route to create a new contact thread
app.post('/api/contact-chatbot/new-thread', async (req, res) => {
    try {
        const thread = await openai.beta.threads.create();
        contactThreadId = thread.id;
        console.log('New contact thread created:', contactThreadId);
        updateEnvFile('CONTACT_CHATBOT_THREAD_ID', contactThreadId);
        process.env.CONTACT_CHATBOT_THREAD_ID = contactThreadId;
        res.json({ message: 'New contact thread created successfully' });
    } catch (error) {
        console.error('Error creating new contact thread:', error);
        res.status(500).json({ error: 'Failed to create new contact thread' });
    }
});

// Voice Command Endpoint
app.post('/api/voice-command', async (req, res) => {
    const { message } = req.body;
    try {
        const result = await handleVoiceCommand(message);
        if (result.error) {
            return res.status(400).json({ error: result.error });
        }
        res.json({
            content: result.content,
            audioFilePath: result.audioFilePath,
            functionCalls: result.functionCalls
        });
    } catch (error) {
        console.error('Error interacting with Voice Assistant:', error);
        res.status(500).json({ error: 'Failed to interact with Voice Assistant' });
    }
});

app.post('/api/fetch-contact', async (req, res) => {
    try {
        const contacts = await fetchContacts(req.body.query);
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

app.post('/api/generate-note', async (req, res) => {
    try {
        const note = await generateNote(req.body);
        res.json(note);
    } catch (error) {
        console.error('Error generating note:', error);
        res.status(500).json({ error: 'Failed to generate note' });
    }
});

app.post('/api/send-email', async (req, res) => {
    try {
        const result = await sendEmail(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.post('/api/create-task', async (req, res) => {
    try {
        const task = await createTask(req.body);
        res.json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

app.post('/api/get-contact-info', async (req, res) => {
    try {
        const contactInfo = await getContactInfo(req.body);
        res.json(contactInfo);
    } catch (error) {
        console.error('Error getting contact info:', error);
        res.status(500).json({ error: 'Failed to get contact info' });
    }
});

app.post('/api/voice-command/new-thread', async (req, res) => {
    try {
        await createNewVoiceCommandThread();
        res.json({ message: 'New voice command thread created successfully' });
    } catch (error) {
        console.error('Error creating new voice command thread:', error);
        res.status(500).json({ error: 'Failed to create new voice command thread' });
    }
});

// Serve audio file with no-cache headers
app.use('/speech.mp3', express.static(path.join(__dirname, 'public', 'speech.mp3'), {
    setHeaders: function (res, path) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App Listening on ${PORT} !`);
});

// Example usage
const locationId = 'kLMiHkgJHwQEDGzDNNSI';
getOAuthData(locationId, (err, data) => {
    if (err) {
        console.error(err);
    } else {
        console.log(data);
    }
});