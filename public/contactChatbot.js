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
        displayMessage(chatHistory, 'You', userMessage);

        // Clear input
        chatInput.value = '';

        try {
            // Send user message to the contact-specific chatbot endpoint
            const response = await fetch('/api/contact-chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, contactId: currentContactId }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.content) {
                // Format and display chatbot's response
                const formattedResponse = formatResponseText(data.content);
                displayMessage(chatHistory, 'StrategixAI Assistant', formattedResponse);
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

    // Remove existing conversation starters
    const existingStarters = document.querySelector('.conversation-starters');
    if (existingStarters) {
        existingStarters.remove();
    }

    // Re-add conversation starters
    const newStartersContainer = createConversationStarters();

    // Insert the starters container before the chat form
    const chatForm = document.getElementById('contactChatForm');
    chatForm.parentNode.insertBefore(newStartersContainer, chatForm);

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

function createConversationStarters() {
    const starters = [
        "Give me a short analysis of the game prediction",
        "Who's injured on each team?",
        "What are the key matchups to watch?",
        "What's the historical record between these teams?"
    ];

    const startersContainer = document.createElement('div');
    startersContainer.className = 'conversation-starters collapsed';

    const toggleButton = document.createElement('button');
    toggleButton.className = 'starters-toggle';
    toggleButton.textContent = 'Show Conversation Starters';
    toggleButton.addEventListener('click', () => {
        startersContainer.classList.toggle('collapsed');
        toggleButton.textContent = startersContainer.classList.contains('collapsed') 
            ? 'Show Conversation Starters' 
            : 'Hide Conversation Starters';
    });

    const startersList = document.createElement('div');
    startersList.className = 'starters-list';

    starters.forEach(starter => {
        const starterButton = document.createElement('button');
        starterButton.className = 'starter-button';
        starterButton.textContent = starter;
        starterButton.addEventListener('click', () => {
            document.getElementById('contactChatInput').value = starter;
            document.getElementById('contactChatForm').dispatchEvent(new Event('submit'));
            startersContainer.classList.add('collapsed');
            toggleButton.textContent = 'Show Conversation Starters';
        });
        startersList.appendChild(starterButton);
    });

    startersContainer.appendChild(toggleButton);
    startersContainer.appendChild(startersList);

    return startersContainer;
}

export async function openMatchupChatWindow(matchup) {
    console.log('Opening matchup chat window for matchup:', matchup);
    const contactChatbotModal = document.getElementById('contactChatbotModal');
    if (contactChatbotModal) {
        contactChatbotModal.style.display = 'block';
        
        // Set up the chat for the specific matchup
        const chatHistory = document.getElementById('contactChatHistory');
        chatHistory.innerHTML = ''; // Clear previous chat history
        
        try {
            // Fetch contact information for both teams
            const homeTeamResponse = await fetch(`/get-contact/${matchup.homeTeam.id}`);
            const awayTeamResponse = await fetch(`/get-contact/${matchup.awayTeam.id}`);
            
            if (!homeTeamResponse.ok || !awayTeamResponse.ok) {
                throw new Error('Failed to fetch contact information');
            }
            
            const homeTeamData = await homeTeamResponse.json();
            const awayTeamData = await awayTeamResponse.json();
            
            // Display matchup information with logos
            const matchupInfo = document.createElement('div');
            matchupInfo.className = 'matchup-info';
            matchupInfo.innerHTML = `
                <div class="matchup-header">
                    <div class="team-info">
                        <img src="${matchup.homeTeam['1HGwmpbWMR6WayDWOL2k'] || 'default-logo.png'}" alt="${homeTeamData.contact.firstName} ${homeTeamData.contact.lastName} Logo" class="team-logo">
                    </div>
                    <div class="vs">VS</div>
                    <div class="team-info">
                        <img src="${matchup.awayTeam['1HGwmpbWMR6WayDWOL2k'] || 'default-logo.png'}" alt="${awayTeamData.contact.firstName} ${awayTeamData.contact.lastName} Logo" class="team-logo">
                    </div>
                </div>
                <p>Game ID: ${matchup.gameId}</p>
            `;
            chatHistory.appendChild(matchupInfo);

            // Prepare initial message with both teams' information
            const initialMessage = `Provide Analysis for this Game!`;
            document.getElementById('contactChatInput').value = initialMessage;
            
            // Store the matchup data for future use
            currentContactId = { homeTeam: matchup.homeTeam.id, awayTeam: matchup.awayTeam.id };
            
            // Optionally, you can automatically send this initial message
            // document.getElementById('contactChatForm').dispatchEvent(new Event('submit'));

            const chatForm = document.getElementById('contactChatForm');
            const startersContainer = createConversationStarters();
            chatForm.parentNode.insertBefore(startersContainer, chatForm);
        } catch (error) {
            console.error('Error fetching contact information:', error);
            chatHistory.innerHTML = '<p>Error: Failed to load matchup information</p>';
        }
    } else {
        console.error('Contact chatbot modal not found');
    }
}

function displayMessage(chatHistory, sender, message) {
    const messageElement = document.createElement('div');
    messageElement.className = sender === 'You' ? 'user-message' : 'bot-message';
    
    // Process the message content
    let processedMessage = message
        .replace(/^#\s*(.+)$/gm, '<strong>$1</strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```[\s\S]*?```/g, match => `<pre>${match.slice(3, -3)}</pre>`)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .split('\n\n').map(paragraph => `<p>${paragraph}</p>`).join('');

    messageElement.innerHTML = `
        <div class="message-content">${processedMessage}</div>
        <div class="message-timestamp">${new Date().toLocaleTimeString()}</div>
    `;

    chatHistory.appendChild(messageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}
