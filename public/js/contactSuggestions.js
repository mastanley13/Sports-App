export function initializeContactSuggestions() {
    const contactFirstNameInput = document.getElementById('contactFirstName');
    const contactLastNameInput = document.getElementById('contactLastName');
    const contactIdInput = document.getElementById("contactId");  // Ensure this line is added
    const contactSuggestionsContainer = document.getElementById('contactSuggestions');

    if (contactFirstNameInput && contactSuggestionsContainer) {
        const handleInput = async function() {
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
                                contactIdInput.value = contact.id; // This line corresponds to your error
                                contactSuggestionsContainer.innerHTML = '';
                                contactSuggestionsContainer.classList.remove('visible');
                            });
                            contactSuggestionsContainer.appendChild(suggestionElement);
                        });

                        const inputRect = contactFirstNameInput.getBoundingClientRect();
                        const modalRect = document.querySelector('.modal-content').getBoundingClientRect();
                        contactSuggestionsContainer.style.top = `${inputRect.bottom - modalRect.top}px`;
                        contactSuggestionsContainer.style.left = `${inputRect.left - modalRect.left}px`;
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
        };

        contactFirstNameInput.addEventListener('input', handleInput);
    } else {
        console.error('Contact name inputs or suggestions container not found');
    }
    
    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
}
