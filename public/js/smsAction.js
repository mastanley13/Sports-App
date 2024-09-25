document.addEventListener('DOMContentLoaded', function() {
    const smsModal = document.getElementById('smsModal');
    const closeSmsModal = document.getElementById('closeSmsModal');
    const craftSms = document.getElementById('craftSMS');
    const smsContactId = document.getElementById('smsContactId');
    const contactFirstNameInput = document.getElementById('smsContactFirstName');
    const contactLastNameInput = document.getElementById('smsContactLastName');
    const contactSuggestionsContainer = document.getElementById('smsContactSuggestions');
    const smsBodyInput = document.getElementById('smsBody');

    // Correctly initialize the button variable by selecting the element by its ID
    var createSmsButton = document.getElementById('createSms'); // Updated to match HTML

    // Check if createSmsButton exists before adding the event listener
    if (createSmsButton) {
        // Event listener for creating a sms
        createSmsButton.addEventListener('click', sendSms); // Updated to call sendSms
    } else {
        console.error('createSmsButton element not found');
    }

    // Show SMS modal
    craftSms.addEventListener('click', function() {
        console.log('Craft SMS button clicked');
        smsContactId.value = ''; // Set the contact ID if available
        smsContactId.style.display = smsContactId.value ? 'block' : 'none';
        smsModal.style.display = 'block';
    });

    // Close SMS modal
    closeSmsModal.addEventListener('click', function() {
        console.log('Close button clicked'); // Debug: Check if this logs when the close button is clicked
        smsModal.style.display = 'none';
    });

    // Close SMS modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === smsModal) {
            console.log('Clicked outside the SMS modal');
            smsModal.style.display = 'none';
        }
    });

    // Fetch and display contact suggestions
    contactFirstNameInput.addEventListener('input', async function() {
        const firstNameQuery = contactFirstNameInput.value.trim();
        if (firstNameQuery.length >= 3) {
            try {
                const response = await fetch(`/contacts?firstName=${encodeURIComponent(firstNameQuery)}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                const contacts = data.contacts || [];

                contactSuggestionsContainer.innerHTML = '';

                if (contacts.length > 0) {
                    contactSuggestionsContainer.classList.add('visible');
                    contacts.forEach(contact => {
                        const suggestionElement = document.createElement('div');
                        suggestionElement.textContent = `${capitalizeFirstLetter(contact.firstName)} ${capitalizeFirstLetter(contact.lastName)}`;
                        suggestionElement.addEventListener('click', function() {
                            contactFirstNameInput.value = capitalizeFirstLetter(contact.firstName);
                            document.getElementById('smsContactLastName').value = capitalizeFirstLetter(contact.lastName);
                            smsContactId.value = contact.id;
                            smsContactId.style.display = 'block'; // Ensure the contact ID field is visible
                            contactSuggestionsContainer.innerHTML = '';
                            contactSuggestionsContainer.classList.remove('visible');
                        });
                        contactSuggestionsContainer.appendChild(suggestionElement);
                    });

                    const inputRect = contactFirstNameInput.getBoundingClientRect();
                    const modalRect = smsModal.getBoundingClientRect();
                    contactSuggestionsContainer.style.top = `${inputRect.bottom - modalRect.top}px`;
                    contactSuggestionsContainer.style.left = `${inputRect.left - modalRect.left}px`;
                    contactSuggestionsContainer.style.width = `${inputRect.width}px`; // Ensure the width matches the input field
                } else {
                    contactSuggestionsContainer.classList.remove('visible');
                }
            } catch (error) {
                console.error('Failed to fetch contacts:', error);
                alert('Failed to fetch contacts. Please try again.');
            }
        } else {
            contactSuggestionsContainer.classList.remove('visible');
        }
    });

    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    // Add bot icon prominently above the send button with a label
    const botIconContainer = document.createElement('div');
    botIconContainer.style.display = 'flex';
    botIconContainer.style.flexDirection = 'column';
    botIconContainer.style.alignItems = 'center';
    botIconContainer.style.marginBottom = '20px';

    const botIconLabel = document.createElement('span');
    botIconLabel.textContent = 'AI SMS Assistant: Generate SMS in Seconds!';
    botIconLabel.style.fontSize = '20px';
    botIconLabel.style.color = '#1363f7';
    botIconLabel.style.fontWeight = 'bold';
    botIconLabel.style.marginBottom = '10px';
    botIconLabel.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.2)';

    const botIcon = document.createElement('button');
    botIcon.className = 'bot-icon';
    botIcon.innerHTML = '✏️'; // Unicode pencil icon
    botIcon.style.backgroundColor = '#1363f7'; // Blue background
    botIcon.style.border = 'none';
    botIcon.style.borderRadius = '50%';
    botIcon.style.padding = '10px';
    botIcon.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    botIcon.style.width = '60px';
    botIcon.style.height = '60px';
    botIcon.style.display = 'flex';
    botIcon.style.alignItems = 'center';
    botIcon.style.justifyContent = 'center';
    botIcon.style.transition = 'transform 0.3s, box-shadow 0.3s';
    botIcon.style.fontSize = '24px';
    botIcon.style.color = '#fff';
    botIcon.addEventListener('mouseover', function() {
        botIcon.style.transform = 'scale(1.1)';
        botIcon.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
    });

    botIcon.addEventListener('mouseout', function() {
        botIcon.style.transform = 'scale(1)';
        botIcon.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.2)';
    });

    botIconContainer.appendChild(botIconLabel);
    botIconContainer.appendChild(botIcon);

    createSmsButton.parentNode.insertBefore(botIconContainer, createSmsButton);

    // Create form fields for AI-generated SMS content
    const aiFormContainer = document.createElement('div');
    aiFormContainer.className = 'ai-form-container';
    aiFormContainer.style.display = 'none'; // Initially hidden

    const smsPurposeInput = document.createElement('input');
    smsPurposeInput.type = 'text';
    smsPurposeInput.placeholder = 'What is this SMS about?';
    aiFormContainer.appendChild(smsPurposeInput);

    const toneSelect = document.createElement('select');
    ['Formal', 'Informal', 'Professional', 'Friendly'].forEach(tone => {
        const option = document.createElement('option');
        option.value = tone.toLowerCase();
        option.textContent = tone;
        toneSelect.appendChild(option);
    });
    aiFormContainer.appendChild(toneSelect);

    const lengthSelect = document.createElement('select');
    ['Short', 'Medium', 'Long'].forEach(length => {
        const option = document.createElement('option');
        option.value = length.toLowerCase();
        option.textContent = length;
        lengthSelect.appendChild(option);
    });
    aiFormContainer.appendChild(lengthSelect);

    const generateButton = document.createElement('button');
    generateButton.textContent = 'Generate';
    aiFormContainer.appendChild(generateButton);

    smsModal.appendChild(aiFormContainer);

    // Show AI form fields when bot icon is clicked
    botIcon.addEventListener('click', function() {
        aiFormContainer.style.display = aiFormContainer.style.display === 'none' ? 'block' : 'none';
    });

    // Handle AI form submission
    generateButton.addEventListener('click', async function() {
        const smsPurpose = smsPurposeInput.value;
        const tone = toneSelect.value;
        const length = lengthSelect.value;
        const contactFirstName = contactFirstNameInput.value.trim();
        const contactLastName = contactLastNameInput.value.trim();

        if (!smsPurpose || !tone || !length) {
            alert('Please fill out all fields.');
            return;
        }

        let prompt = `Generate a ${tone} SMS about ${smsPurpose} with a ${length} length.`;
        if (contactFirstName && contactLastName) {
            prompt += ` Address the SMS to ${contactFirstName} ${contactLastName}.`;
        } else {
            prompt += ` Use a non-personalized greeting.`;
        }

        try {
            const response = await fetch('/generate-sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const message = data.message;

            smsBodyInput.value = message;

            // Save user preferences
            localStorage.setItem('smsTone', tone);
            localStorage.setItem('smsLength', length);

            aiFormContainer.style.display = 'none';
        } catch (error) {
            console.error('Failed to generate SMS:', error);
            alert('Failed to generate SMS. Please try again.');
        }
    });

    // Load user preferences
    const savedTone = localStorage.getItem('smsTone');
    const savedLength = localStorage.getItem('smsLength');
    if (savedTone) toneSelect.value = savedTone;
    if (savedLength) lengthSelect.value = savedLength;

    async function sendSms() {
        const type = 'SMS';
        const contactId = smsContactId.value;
        const message = smsBodyInput.value; // Updated to use smsBodyInput

        if (!contactId || !message) {
            alert('Please select a contact and enter a message.');
            return;
        }

        try {
            console.log('Creating sms with contactId:', contactId, 'and message:', message);
            const response = await fetch('/create-sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type, contactId, message })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            alert('SMS sent successfully!');
            smsModal.style.display = 'none';
        } catch (error) {
            console.error('Failed to send SMS:', error);
            alert('Failed to send SMS. Please try again.');
        }
    }
});