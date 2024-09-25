// Get DOM elements
const addContactBtn = document.getElementById('addContactBtn');
const addContactModal = document.getElementById('addContactModal');
const closeBtn = addContactModal.querySelector('.close');
const newContactForm = document.getElementById('newContactForm');

// Show modal when Add Contact button is clicked
addContactBtn.addEventListener('click', () => {
  addContactModal.style.display = 'block';
});

// Hide modal when close button is clicked
closeBtn.addEventListener('click', () => {
  addContactModal.style.display = 'none';
});

// Hide modal when clicking outside of it
window.addEventListener('click', (event) => {
  if (event.target === addContactModal) {
    addContactModal.style.display = 'none';
  }
});

// Handle form submission
newContactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Collect form data
  const formData = new FormData(newContactForm);
  const contactData = Object.fromEntries(formData.entries());

  // Ensure all required fields are present
  const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
  for (const field of requiredFields) {
    if (!contactData[field]) {
      alert(`Please fill in the ${field} field.`);
      return;
    }
  }

  try {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add contact');
    }
    
    const result = await response.json();
    console.log('Contact added successfully:', result);
    addContactModal.style.display = 'none';
    newContactForm.reset();
  } catch (error) {
    console.error('Error adding contact:', error.message);
    alert(`Failed to add contact: ${error.message}`);
  }
});