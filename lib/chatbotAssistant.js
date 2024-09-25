const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const fs = require('fs');
const dotenv = require('dotenv');
const axios = require('axios');
const { getContactIdByName } = require('./contactService');
const { fetchContacts } = require('./fetchContacts');
const getContact = require('./getContact');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.CHATBOT_ASSISTANT_ID;
let threadId = process.env.CHATBOT_THREAD_ID;

function updateEnvFile(key, value) {
    const envConfig = dotenv.parse(fs.readFileSync('.env'));
    envConfig[key] = value;
    fs.writeFileSync('.env', Object.entries(envConfig).map(([key, value]) => `${key}=${value}`).join('\n'));
}

router.post('/chatbot', async (req, res) => {
    const { message } = req.body;
    try {
        // Create a new thread if one doesn't exist
        if (!threadId) {
            await createNewThread();
        }

        // Add the user's message to the thread
        await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: message
        });

        // Run the assistant
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: ASSISTANT_ID
        });

        // Wait for the run to complete or require action
        let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
        while (runStatus.status !== 'completed' && runStatus.status !== 'requires_action') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
        }

        // Check if the run requires action (function call)
        if (runStatus.status === 'requires_action') {
            const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
            const toolOutputs = await Promise.all(toolCalls.map(async (toolCall) => {
                const functionName = toolCall.function.name;
                const functionArgs = JSON.parse(toolCall.function.arguments);
                
                // Execute the function and get the result
                const functionResult = await executeFunctionCall(functionName, functionArgs);
                
                return {
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(functionResult),
                };
            }));

            // Submit the tool outputs back to the assistant
            await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
                tool_outputs: toolOutputs,
            });

            // Wait for the run to complete after submitting tool outputs
            runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
            while (runStatus.status !== 'completed') {
                await new Promise(resolve => setTimeout(resolve, 1000));
                runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
            }
        }

        // Get the assistant's response
        const messages = await openai.beta.threads.messages.list(threadId);
        let botResponse = messages.data[0].content[0].text.value;

        // Format the response text
        botResponse = formatResponseText(botResponse);

        res.json({ content: botResponse });
    } catch (error) {
        console.error('Error interacting with Chatbot:', error);
        res.status(500).json({ error: 'Failed to interact with Chatbot' });
    }
});

// New route to create a new thread
router.post('/chatbot/new-thread', async (req, res) => {
    try {
        await createNewThread();
        res.json({ message: 'New thread created successfully' });
    } catch (error) {
        console.error('Error creating new thread:', error);
        res.status(500).json({ error: 'Failed to create new thread' });
    }
});

async function createNewThread() {
    const thread = await openai.beta.threads.create();
    threadId = thread.id;
    console.log('New thread created:', threadId);
    updateEnvFile('CHATBOT_THREAD_ID', threadId);
    process.env.CHATBOT_THREAD_ID = threadId;
}

// Function to execute the appropriate backend action based on the function name
async function executeFunctionCall(functionName, args) {
    switch (functionName) {
        case 'fetch_contact':
            return await fetchContact(args);
        case 'generate_note':
            return await generateNote(args);
        case 'send_email':
            return await sendEmail(args);
        case 'create_task':
            return await createTask(args);
        case 'get_contact':
            return await getContactInfo(args);
        default:
            throw new Error(`Unknown function: ${functionName}`);
    }
}

async function getContactInfo(args) {
    const { search_query, contact_id } = args;
    console.log('Getting contact info with args:', args);

    try {
        if (!contact_id) {
            console.log('Attempting to fetch contacts with query:', search_query);
            const searchResults = await fetchContacts(search_query);
            console.log('Search results:', searchResults);

            if (!searchResults || !searchResults.contacts || searchResults.contacts.length === 0) {
                return {
                    success: false,
                    message: "No contacts found matching the search query.",
                    searchResults: []
                };
            }
            return {
                success: true,
                message: "Contacts found. Please select a specific contact for detailed information.",
                searchResults: searchResults.contacts.map(c => ({ id: c.id, name: `${c.firstName} ${c.lastName}` }))
            };
        } else {
            // Get detailed information for a specific contact
            const contactDetails = await getContact(contact_id);
            return {
                success: true,
                message: "Contact details retrieved successfully.",
                contactDetails: contactDetails.data
            };
        }
    } catch (error) {
        console.error('Error getting contact info:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while fetching contact information'
        };
    }
}

async function fetchContact(args) {
    const { contact_name } = args;
    try {
        const contactsResponse = await fetchContacts(contact_name);
        if (!contactsResponse.contacts || contactsResponse.contacts.length === 0) {
            return {
                success: false,
                error: `No contact found with name: ${contact_name}`
            };
        }
        
        // Assume the first contact is the correct one
        const contact = contactsResponse.contacts[0];
        const { data: contactDetails } = await getContact(contact.id);

        return {
            success: true,
            contact: contactDetails
        };
    } catch (error) {
        console.error('Error fetching contact:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function generateNote(args) {
    const { contact_name, note_content } = args;
    console.log('Generating note with args:', args);

    try {
        // Use getContactIdByName to fetch the contact ID
        const contactId = await getContactIdByName(contact_name);
        
        if (!contactId) {
            throw new Error(`No contact found with name: ${contact_name}`);
        }

        // Now create the note
        const response = await axios.post('http://localhost:3000/create-note', {
            contactId: contactId,
            body: note_content
        });

        console.log('Note creation response:', response.data);

        return {
            success: true,
            message: "Note created successfully",
            noteDetails: response.data
        };
    } catch (error) {
        console.error('Error generating note:', error.response ? error.response.data : error.message);
        return {
            success: false,
            error: error.response ? error.response.data : error.message
        };
    }
}

async function sendEmail(args) {
    const { contact_name, email_subject, email_content } = args;
    console.log('Sending email with args:', args);

    try {
        // Get contact ID
        const contactId = await getContactIdByName(contact_name);
        if (!contactId) {
            throw new Error(`No contact found with name: ${contact_name}`);
        }

        // Generate email HTML using the existing endpoint
        const generateResponse = await axios.post('http://localhost:3000/generate-email', {
            prompt: `Subject: ${email_subject}\n\nContent: ${email_content}`
        });
        const { subject, body: html } = generateResponse.data;

        // Send email using the existing endpoint
        const sendResponse = await axios.post('http://localhost:3000/create-email', {
            contactId,
            userId: 'default_user_id', // You might want to handle this dynamically
            subject,
            html
        });

        console.log('Email sending response:', sendResponse.data);

        return {
            success: true,
            message: "Email sent successfully",
            emailDetails: sendResponse.data
        };
    } catch (error) {
        console.error('Error sending email:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

async function createTask(args) {
    const { contact_name, task_title, task_body, due_date } = args;
    console.log('Creating task with args:', args);

    try {
        // Get contact ID
        const contactId = await getContactIdByName(contact_name);
        if (!contactId) {
            throw new Error(`No contact found with name: ${contact_name}`);
        }

        // Create task using the existing endpoint
        const response = await axios.post('http://localhost:3000/create-task', {
            contactId,
            title: task_title,
            body: task_body,
            dueDate: due_date,
            completed: false
        });

        console.log('Task creation response:', response.data);

        return {
            success: true,
            message: "Task created successfully",
            taskDetails: response.data
        };
    } catch (error) {
        console.error('Error creating task:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Function to format the response text
function formatResponseText(responseText) {
    return responseText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
        .replace(/##(.*?)##/g, '<h3>$1</h3>') // Headers
        .replace(/###(.*?)###/g, '<h4>$1</h4>') // Sub-headers
        .replace(/####(.*?)####/g, '<h5>$1</h5>') // Sub-sub-headers
        .replace(/\n/g, '<br>'); // Line breaks
}


module.exports = router;