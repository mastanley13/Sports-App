import { initializeContactCard } from '/js/contactCard.js';

export function initializeAISearch() {
    const searchButton = document.getElementById('searchButton');
    const searchContainer = document.getElementById('searchContainer');
    const searchInput = document.getElementById('searchInput');
    const searchSubmitButton = document.getElementById('searchSubmitButton');
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'aiSearchSuggestions';
    suggestionsContainer.className = 'aisuggestions-container';
    searchContainer.appendChild(suggestionsContainer);

    searchButton.addEventListener('click', () => {
        if (searchContainer.style.display === 'none' || searchContainer.style.display === '') {
            searchContainer.style.display = 'block';
        } else {
            searchContainer.style.display = 'none';
        }
    });

    function capitalizeWords(string) {
        return string.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    const { openContactCard } = initializeContactCard();

    searchInput.addEventListener('input', async () => {
        const query = searchInput.value.trim();
        if (query.length >= 3) {
            try {
                const response = await fetch(`/contacts?firstName=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                displaySuggestions(data.contacts);
            } catch (error) {
                console.error('Failed to fetch suggestions:', error);
                suggestionsContainer.style.display = 'none';
            }
        } else {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = 'none';
        }
    });

    function displaySuggestions(contacts) {
        suggestionsContainer.innerHTML = '';
        if (contacts && contacts.length > 0) {
            contacts.forEach(contact => {
                const suggestionElement = document.createElement('div');
                const capitalizedName = capitalizeWords(`${contact.firstName} ${contact.lastName}`);
                suggestionElement.textContent = capitalizedName;
                suggestionElement.addEventListener('click', () => {
                    searchInput.value = capitalizedName;
                    suggestionsContainer.innerHTML = '';
                    suggestionsContainer.style.display = 'none';
                    openContactCard(contact); // Pass the entire contact object
                });
                suggestionsContainer.appendChild(suggestionElement);
            });
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    }

    searchSubmitButton.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        if (query) {
            const capitalizedQuery = capitalizeWords(query);
            try {
                const response = await fetch('/api/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: capitalizedQuery }),
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                console.log(data);
            } catch (error) {
                console.error('Failed to fetch search results:', error);
                alert('Failed to fetch search results. Please try again.');
            }
        }
    });
}