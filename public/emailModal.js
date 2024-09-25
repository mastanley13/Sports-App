export function initializeEmailModal() {
    console.log('initializeEmailModal called');

    const emailModal = document.getElementById('emailModal');
    const craftEmail = document.getElementById('craftEmail');
    const sendEmailButton = document.getElementById('sendEmail');
    const contactFirstNameInput = document.getElementById('emailcontactFirstName');
    const contactLastNameInput = document.getElementById('emailcontactLastName');
    const contactSuggestionsContainer = document.getElementById('emailContactSuggestions');
    const emailSubjectInput = document.getElementById('emailSubject');
    const emailBodyInput = document.getElementById('emailBody');
    const closeModalButton = document.getElementById('closeEmailModal');
    const emailContactIdInput = document.getElementById('emailContactId');

    craftEmail.addEventListener('click', function() {
        console.log('Email button clicked');
        emailModal.style.display = 'block';
    });

    contactFirstNameInput.addEventListener('input', async function() {
        const query = contactFirstNameInput.value;
        if (query.length >= 3) {
            try {
                const response = await fetch(`/contacts?firstName=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                const contacts = data.contacts || [];
                contactSuggestionsContainer.innerHTML = contacts.map(contact => `<div data-id="${contact.id}" class="suggestion-item">${contact.firstName} ${contact.lastName}</div>`).join('');
                contactSuggestionsContainer.style.display = 'block';
            } catch (error) {
                console.error('Failed to fetch contacts:', error);
            }
        } else {
            contactSuggestionsContainer.innerHTML = '';
            contactSuggestionsContainer.style.display = 'none';
        }
    });

    contactSuggestionsContainer.addEventListener('click', function(event) {
        const contactElement = event.target;
        const contactName = contactElement.textContent;
        const contactId = contactElement.getAttribute('data-id');
        contactFirstNameInput.value = contactName.split(' ')[0];
        contactLastNameInput.value = contactName.split(' ')[1] || '';
        emailContactIdInput.value = contactId;
        contactSuggestionsContainer.innerHTML = '';
        contactSuggestionsContainer.style.display = 'none';
    });

    sendEmailButton.addEventListener('click', async function() {
        const contactId = emailContactIdInput.value;
        const subject = emailSubjectInput.value.trim();
        const message = emailBodyInput.value.trim();

        console.log('Sending email with data:', { contactId, subject, message });

        if (!contactId || subject === '' || message === '') {
            alert('Please fill in all fields');
            return;
        }

        const emailData = {
            contactId: contactId,
            subject: subject,
            message: message
        };

        try {
            const response = await fetch('/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailData)
            });

            const responseData = await response.json();

            if (response.ok) {
                console.log('Email sent successfully:', responseData);
                emailModal.style.display = 'none';
                alert('Email sent successfully!');
            } else {
                console.error('Failed to send email:', responseData);
                alert(`Failed to send email: ${responseData.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while sending the email');
        }
    });

    closeModalButton.addEventListener('click', function() {
        emailModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === emailModal) {
            emailModal.style.display = 'none';
        }
    });
}