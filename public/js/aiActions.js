export function initializeAIActions() {
  const aiActionBtn = document.getElementById('aiAction');
  const dropdown = document.getElementById('aiDropdown');

  aiActionBtn.addEventListener('click', function(event) {
    event.stopPropagation();
    dropdown.classList.toggle('show');
    
    // Position the dropdown
    if (window.innerWidth <= 768) {
      // Mobile positioning is handled by CSS
    } else {
      // Desktop positioning
      const rect = aiActionBtn.getBoundingClientRect();
      dropdown.style.top = `${rect.bottom}px`;
      dropdown.style.right = `${window.innerWidth - rect.right}px`;
    }
  });

  // Close the dropdown when clicking outside
  window.addEventListener('click', function(event) {
    if (!event.target.matches('.ai-action-button')) {
      dropdown.classList.remove('show');
    }
  });

  // Function to handle AI action clicks
  function handleAIAction(action) {
    console.log(`Craft ${action}`);
    dropdown.classList.remove('show');
    
    // Open the corresponding modal
    switch(action) {
      case 'Email':
        document.getElementById('emailModal').style.display = 'block';
        break;
      case 'SMS':
        document.getElementById('smsModal').style.display = 'block';
        break;
      case 'Note':
        document.getElementById('noteModal').style.display = 'block';
        break;
    }
  }

  // Event listeners for desktop dropdown items
  document.querySelectorAll('#aiDropdown a').forEach(item => {
    item.addEventListener('click', function(event) {
      event.preventDefault();
      handleAIAction(this.textContent.trim());
    });
  });

  // Event listeners for mobile dropdown items
  document.querySelectorAll('#mobileAiDropdown a').forEach(item => {
    item.addEventListener('click', function(event) {
      event.preventDefault();
      handleAIAction(this.textContent.trim());
      document.getElementById('mobileMenu').classList.remove('active');
      document.getElementById('mobileAiDropdown').classList.remove('show');
    });
  });
}