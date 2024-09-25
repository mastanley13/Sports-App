document.addEventListener('DOMContentLoaded', function() {
    const emailModal = document.getElementById('emailModal');
    const closeEmailModal = document.getElementById('closeEmailModal');
    const craftEmail = document.getElementById('craftEmail');
    const emailContactId = document.getElementById('emailContactId');
    const contactFirstNameInput = document.getElementById('emailcontactFirstName');
    const contactLastNameInput = document.getElementById('emailcontactLastName');
    const contactSuggestionsContainer = document.getElementById('emailContactSuggestions');
    const emailSubjectInput = document.getElementById('emailSubject');
    const emailBodyInput = document.getElementById('emailBody');

    // Correctly initialize the button variable by selecting the element by its ID
    var sendEmailButton = document.getElementById('sendEmail'); // Updated to match HTML

    // Check if sendEmailButton exists before adding the event listener
    if (sendEmailButton) {
        // Event listener for sending an email
        sendEmailButton.addEventListener('click', sendEmail); // Updated to call sendEmail
    } else {
        console.error('sendEmailButton element not found');
    }

    // Show Email modal
    craftEmail.addEventListener('click', function() {
        console.log('Craft Email button clicked');
        emailContactId.value = ''; // Set the contact ID if available
        emailContactId.style.display = emailContactId.value ? 'block' : 'none';
        emailModal.style.display = 'block';
    });

    // Close Email modal
    closeEmailModal.addEventListener('click', function() {
        console.log('Close button clicked'); // Debug: Check if this logs when the close button is clicked
        emailModal.style.display = 'none';
    });

    // Close Email modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === emailModal) {
            console.log('Clicked outside the Email modal');
            emailModal.style.display = 'none';
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
                            contactLastNameInput.value = capitalizeFirstLetter(contact.lastName);
                            emailContactId.value = contact.id;
                            emailContactId.style.display = 'block'; // Ensure the contact ID field is visible
                            contactSuggestionsContainer.innerHTML = '';
                            contactSuggestionsContainer.classList.remove('visible');
                        });
                        contactSuggestionsContainer.appendChild(suggestionElement);
                    });

                    const inputRect = contactFirstNameInput.getBoundingClientRect();
                    const modalRect = emailModal.getBoundingClientRect();
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
    botIconLabel.textContent = 'AI Email Assistant: Generate Emails in Seconds!';
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

    sendEmailButton.parentNode.insertBefore(botIconContainer, sendEmailButton);

    // Create form fields for AI-generated email content
    const aiFormContainer = document.createElement('div');
    aiFormContainer.className = 'ai-form-container';
    aiFormContainer.style.display = 'none'; // Initially hidden

    const emailPurposeInput = document.createElement('input');
    emailPurposeInput.type = 'text';
    emailPurposeInput.placeholder = 'What is this email about?';
    aiFormContainer.appendChild(emailPurposeInput);

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

    emailModal.appendChild(aiFormContainer);

    // Show AI form fields when bot icon is clicked
    botIcon.addEventListener('click', function() {
        aiFormContainer.style.display = aiFormContainer.style.display === 'none' ? 'block' : 'none';
    });

    // Handle AI form submission
    generateButton.addEventListener('click', async function() {
        const emailPurpose = emailPurposeInput.value;
        const tone = toneSelect.value;
        const length = lengthSelect.value;
        const contactFirstName = contactFirstNameInput.value.trim();
        const contactLastName = contactLastNameInput.value.trim();

        if (!emailPurpose || !tone || !length) {
            alert('Please fill out all fields.');
            return;
        }

        let prompt = `Generate a ${tone} email about ${emailPurpose} with a ${length} length.`;
        if (contactFirstName && contactLastName) {
            prompt += ` Address the email to ${contactFirstName} ${contactLastName}.`;
        } else {
            prompt += ` Use a non-personalized greeting. The greeting at the beginning of the body should be similar to "Hi," or "Hello There" or similar!`;
        }

        try {
            const response = await fetch('/generate-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            // Remove "Subject:" from the generated subject
            const subject = data.subject.replace(/^Subject:\s*/i, '');
            const body = data.body;

            emailSubjectInput.value = subject;
            emailBodyInput.value = body;

            // Save user preferences
            localStorage.setItem('emailTone', tone);
            localStorage.setItem('emailLength', length);

            aiFormContainer.style.display = 'none';
        } catch (error) {
            console.error('Failed to generate email:', error);
            alert('Failed to generate email. Please try again.');
        }
    });

    // Load user preferences
    const savedTone = localStorage.getItem('emailTone');
    const savedLength = localStorage.getItem('emailLength');
    if (savedTone) toneSelect.value = savedTone;
    if (savedLength) lengthSelect.value = savedLength;

    async function sendEmail() {
        const type = 'Email'; // Updated to match the valid enum value
        const contactId = emailContactId.value;
        const subject = emailSubjectInput.value;
        const html = emailBodyInput.value;

        if (!contactId || !subject || !html) {
            alert('Please select a contact, enter a subject, and enter a message.');
            return;
        }

        try {
            console.log('Creating email with contactId:', contactId, 'subject:', subject, 'and html:', html);
            const response = await fetch('/create-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type, contactId, subject, html })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            alert('Email sent successfully!');
            emailModal.style.display = 'none';
        } catch (error) {
            console.error('Failed to send email:', error);
            alert('Failed to send email. Please try again.');
        }
    }

    // Add Clear Email button
    const clearEmailButton = document.createElement('button');
    clearEmailButton.textContent = 'Clear Email';
    clearEmailButton.style.backgroundColor = '#f44336'; // Red background
    clearEmailButton.style.color = 'white'; // White text
    clearEmailButton.style.border = 'none'; // No border
    clearEmailButton.style.padding = '5px 10px'; // Smaller padding
    clearEmailButton.style.cursor = 'pointer'; // Pointer cursor on hover
    clearEmailButton.style.borderRadius = '15px'; // Rounded corners
    clearEmailButton.style.fontSize = '12px'; // Smaller font size
    clearEmailButton.style.position = 'center';
    clearEmailButton.style.width = '20%';
    emailModal.insertBefore(clearEmailButton, emailModal.firstChild);

    // Clear Email button functionality
    clearEmailButton.addEventListener('click', function() {
        emailSubjectInput.value = '';
        emailBodyInput.value = '';
        contactFirstNameInput.value = '';
        contactLastNameInput.value = '';
        emailContactId.value = '';
    });
});

export function initializeEmailAction() {
    const emailModal = document.getElementById('emailModal');
    const sendEmailButton = document.getElementById('sendEmail');
    const emailContactId = document.getElementById('emailContactId');
    const emailSubjectInput = document.getElementById('emailSubject');
    const emailBodyInput = document.getElementById('emailBody');
}
