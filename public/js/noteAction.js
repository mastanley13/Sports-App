document.addEventListener('DOMContentLoaded', function() {
    const noteModal = document.getElementById('noteModal');
    const closeNoteModal = document.getElementById('closeNoteModal');
    const craftNote = document.getElementById('craftNote');
    const noteContactId = document.getElementById('noteContactId');
    const contactFirstNameInput = document.getElementById('noteContactFirstName');
    const contactSuggestionsContainer = document.getElementById('noteContactSuggestions');

    // Correctly initialize the button variable by selecting the element by its ID
    var createNoteButton = document.getElementById('addNote');

    // Event listener for creating a note
    createNoteButton.addEventListener('click', createNote);

    // Show Note modal
    craftNote.addEventListener('click', function() {
        console.log('Craft Note button clicked');
        noteContactId.value = ''; // Set the contact ID if available
        noteContactId.style.display = noteContactId.value ? 'block' : 'none';
        noteModal.style.display = 'block';
    });

    // Close Note modal
    closeNoteModal.addEventListener('click', function() {
        console.log('Close Note modal button clicked');
        noteModal.style.display = 'none';
    });

    // Close Note modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === noteModal) {
            console.log('Clicked outside the Note modal');
            noteModal.style.display = 'none';
        }
    });

    // Fetch and display contact suggestions
    contactFirstNameInput.addEventListener('input', async function() {
        const firstNameQuery = contactFirstNameInput.value.trim();
        if (firstNameQuery.length >= 3) {
            try {
                console.log('Fetching contact suggestions for:', firstNameQuery);
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
                            document.getElementById('noteContactLastName').value = capitalizeFirstLetter(contact.lastName);
                            noteContactId.value = contact.id;
                            noteContactId.style.display = 'block'; // Ensure the contact ID field is visible
                            contactSuggestionsContainer.innerHTML = '';
                            contactSuggestionsContainer.classList.remove('visible');
                        });
                        contactSuggestionsContainer.appendChild(suggestionElement);
                    });

                    const inputRect = contactFirstNameInput.getBoundingClientRect();
                    const modalRect = noteModal.getBoundingClientRect();
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

    const noteBodyInput = document.getElementById('noteBody');

    // Function to create a note
    async function createNote() {
        const contactId = noteContactId.value;
        const body = noteBodyInput.value;

        if (!contactId || !body) {
            alert('Contact ID and note body are required.');
            return;
        }

        try {
            console.log('Creating note with contactId:', contactId, 'and body:', body);
            // Fetch userId from oauth_data.json
            const oauthResponse = await fetch('/oauth_data.json');
            const oauthData = await oauthResponse.json();
            const userId = oauthData.userId;

            const response = await fetch('/create-note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ contactId, userId, body })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log('Note created successfully:', data);
            alert('Note created successfully!');
            noteModal.style.display = 'none';
        } catch (error) {
            console.error('Failed to create note:', error);
            alert('Failed to create note. Please try again.');
        }
    }
});
