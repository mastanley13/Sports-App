export function initializeEmailTemplateAction() {
    const emailTemplateModal = document.getElementById('emailTemplateModal');
    const sendEmailButton = document.getElementById('sendEmailButton');
    const closeEmailTemplateModal = emailTemplateModal.querySelector('.close');
    const templateSelect = document.getElementById("emailTemplateSelect");
    const contactNameInput = document.getElementById("emailTemplateContactName");
    const contactIdInput = document.getElementById("emailTemplateContactId");
    const subjectInput = document.getElementById("emailTemplateSubject");
    const bodyInput = document.getElementById("emailTemplateBody");
    const clearEmailButton = document.getElementById("clearEmailButton");

    templateSelect.onchange = async function() {
        const selectedTemplateId = this.value;
        console.log("Selected template ID:", selectedTemplateId);
        
        if (selectedTemplateId) {
            try {
                const response = await fetch(`/api/templates?type=email`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                console.log("Fetched template data:", data);
                
                const selectedTemplate = data.templates.find(template => template.id === selectedTemplateId);
                console.log("Selected template:", selectedTemplate);
                
                if (selectedTemplate) {
                    console.log("Subject input element found:", subjectInput);
                    console.log("Body input element found:", bodyInput);
                    
                    subjectInput.value = selectedTemplate.subject || "";
                    
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(selectedTemplate.body, 'text/html');
                    const bodyText = doc.body.textContent || "";
                    
                    bodyInput.value = bodyText;
                    
                    console.log("Populated subject:", subjectInput.value);
                    console.log("Populated body:", bodyInput.value);
                    
                    // Force update of the input fields
                    subjectInput.dispatchEvent(new Event('input', { bubbles: true }));
                    bodyInput.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    // Double-check if the values are set correctly
                    setTimeout(() => {
                        console.log("Subject after timeout:", subjectInput.value);
                        console.log("Body after timeout:", bodyInput.value);
                    }, 100);
                } else {
                    console.error("Selected template not found in fetched data");
                }
            } catch (error) {
                console.error('Failed to fetch or process template details:', error);
                alert('Failed to load template details. Please try again.');
            }
        } else {
            subjectInput.value = "";
            bodyInput.value = "";
            console.log("No template selected, cleared fields");
        }
    }

    // Close modal functionality
    closeEmailTemplateModal.addEventListener('click', function() {
        emailTemplateModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === emailTemplateModal) {
            emailTemplateModal.style.display = 'none';
        }
    });

    // Send email functionality
    sendEmailButton.addEventListener('click', sendEmail);

    // Clear email functionality
    clearEmailButton.addEventListener('click', clearEmailForm);

    async function sendEmail() {
        const type = 'Email';
        const contactId = contactIdInput.value;
        const subject = subjectInput.value;
        const html = bodyInput.value;
    
        if (!contactId || !subject || !html) {
            alert('Please ensure contact is selected, subject is entered, and message body is not empty.');
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
            emailTemplateModal.style.display = 'none';
        } catch (error) {
            console.error('Failed to send email:', error);
            alert('Failed to send email. Please try again.');
        }
    }

    function clearEmailForm() {
        templateSelect.selectedIndex = 0;
        contactNameInput.value = '';
        contactIdInput.value = '';
        subjectInput.value = '';
        bodyInput.value = '';
    }
}

export function openEmailTemplateModal(taskData) {
    const emailTemplateModal = document.getElementById("emailTemplateModal");
    if (!emailTemplateModal) {
        console.error("Email template modal not found");
        return;
    }

    const elements = {
        templateSelect: document.getElementById("emailTemplateSelect"),
        contactNameInput: document.getElementById("emailTemplateContactName"),
        contactIdInput: document.getElementById("emailTemplateContactId"),
        subjectInput: document.getElementById("emailTemplateSubject"),
        bodyInput: document.getElementById("emailTemplateBody")
    };

    // Check if all elements exist
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Element not found: ${key}`);
            return;
        }
    }

    // Clear previous values
    elements.contactNameInput.value = "";
    elements.contactIdInput.value = "";
    elements.subjectInput.value = "";
    elements.bodyInput.value = "";
    elements.templateSelect.selectedIndex = 0;

    // Populate with task data if available
    if (taskData) {
        elements.contactNameInput.value = taskData.contactFullName || "";
        elements.contactIdInput.value = taskData.contactId || "";
        
        console.log("Populated contact name:", elements.contactNameInput.value);
        console.log("Populated contact ID:", elements.contactIdInput.value);
    }

    // Fetch and populate templates
    fetchAndPopulateTemplates();

    console.log('Populating email template modal:', taskData);
    emailTemplateModal.style.display = "block";
}

async function fetchAndPopulateTemplates() {
    try {
        const response = await fetch('/api/templates?type=email');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const templates = data.templates || [];

        console.log("Fetched templates:", templates);

        const templateSelect = document.getElementById("emailTemplateSelect");
        templateSelect.innerHTML = '<option value="">Select a template</option>';
        templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            templateSelect.appendChild(option);
        });

        console.log("Populated select element:", templateSelect.innerHTML);
    } catch (error) {
        console.error('Failed to fetch templates:', error);
        alert(`Failed to fetch email templates. Please try again. Error: ${error.message}`);
    }
}