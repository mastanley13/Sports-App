let currentContactId = null;

export function openContactChatWindow(contactId) {
    console.log('Opening contact chat window for contact:', contactId);
    currentContactId = contactId;
    const contactChatbotModal = document.getElementById('contactChatbotModal');
    if (contactChatbotModal) {
        contactChatbotModal.style.display = 'block';
        // Additional logic to set up the chat for the specific contact
    } else {
        console.error('Contact chatbot modal not found');
    }
}

document.querySelectorAll('.chatbot-modal .close').forEach(closeButton => {
    closeButton.addEventListener('click', () => {
        const contactChatbotModal = document.getElementById('contactChatbotModal');
        contactChatbotModal.style.display = 'none';
    });
});

document.getElementById('contactChatForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const chatInput = document.getElementById('contactChatInput');
    const chatHistory = document.getElementById('contactChatHistory');
    const userMessage = chatInput.value;

    if (userMessage) {
        // Display user's message
        const userMessageElement = document.createElement('div');
        userMessageElement.className = 'user-message';
        userMessageElement.innerHTML = `<strong>You:</strong><br>${userMessage}`;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = new Date().toLocaleTimeString();
        userMessageElement.appendChild(timestamp);

        chatHistory.appendChild(userMessageElement);

        // Scroll to the bottom after adding user's message
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // Clear input
        chatInput.value = '';

        try {
            // Send user message to the contact-specific chatbot endpoint
            const response = await fetch('/api/contact-chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, contactId: currentContactId }),
            });
            const data = await response.json();

            if (data.content) {
                // Format the response text
                const formattedResponse = formatResponseText(data.content);

                // Display chatbot's response
                const botMessageElement = document.createElement('div');
                botMessageElement.className = 'bot-message';
                botMessageElement.innerHTML = `<strong>StrategixAI Assistant:</strong><br>${formattedResponse}`;
                
                const botTimestamp = document.createElement('div');
                botTimestamp.className = 'message-timestamp';
                botTimestamp.textContent = new Date().toLocaleTimeString();
                botMessageElement.appendChild(botTimestamp);

                chatHistory.appendChild(botMessageElement);

                // Scroll to the bottom after adding bot's message
                chatHistory.scrollTop = chatHistory.scrollHeight;
            } else {
                console.error('No content in response:', data);
                alert('Failed to get a valid response from Contact Assistant.');
            }
        } catch (error) {
            console.error('Error interacting with Contact Assistant:', error);
            alert('Failed to interact with Contact Assistant. Please try again.');
        }
    }
});

// Clear Chat functionality
document.getElementById('clearContactChatBtn').addEventListener('click', async () => {
    const chatHistory = document.getElementById('contactChatHistory');
    chatHistory.innerHTML = ''; // Clear the chat history

    try {
        // Send a request to create a new thread
        const response = await fetch('/api/contact-chatbot/new-thread', {
            method: 'POST',
        });
        
        if (!response.ok) {
            throw new Error('Failed to create a new contact thread');
        }
        
        console.log('New contact thread created');
    } catch (error) {
        console.error('Error creating new contact thread:', error);
        alert('Failed to start a new contact conversation. Please try again.');
    }
});

// Function to format the response text
function formatResponseText(responseText) {
    return responseText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
        .replace(/##(.*?)##/g, '<h3>$1</h3>') // Headers
        .replace(/###(.*?)###/g, '<h4>$1</h4>') // Sub-headers
        .replace(/####(.*?)####/g, '<h5>$1</h5>') // Sub-sub-headers
        .replace(/#(.*?)#/g, '<h2>$1</h2>') // Main headers
        .replace(/\n/g, '<br>'); // Line breaks
}