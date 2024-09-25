document.getElementById('chatbotButton').addEventListener('click', () => {
    const chatbotModal = document.getElementById('chatbotModal');
    chatbotModal.style.display = 'block';
});

document.querySelectorAll('#chatbotModal .close').forEach(closeButton => {
    closeButton.addEventListener('click', () => {
        const chatbotModal = document.getElementById('chatbotModal');
        chatbotModal.style.display = 'none';
    });
});

document.getElementById('chatForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const chatInput = document.getElementById('chatInput');
    const chatHistory = document.getElementById('chatHistory');
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
            // Send user message to the chatbot endpoint
            const response = await fetch('/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });
            const data = await response.json();

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
        } catch (error) {
            console.error('Error interacting with Chatbot Assistant:', error);
            alert('Failed to interact with Chatbot Assistant. Please try again.');
        }
    }
});

// Clear Chat functionality
document.getElementById('clearChatBtn').addEventListener('click', async () => {
    const chatHistory = document.getElementById('chatHistory');
    chatHistory.innerHTML = ''; // Clear the chat history

    try {
        // Send a request to create a new thread
        const response = await fetch('/chatbot/new-thread', {
            method: 'POST',
        });
        
        if (!response.ok) {
            throw new Error('Failed to create a new thread');
        }
        
        console.log('New thread created');
    } catch (error) {
        console.error('Error creating new thread:', error);
        alert('Failed to start a new conversation. Please try again.');
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