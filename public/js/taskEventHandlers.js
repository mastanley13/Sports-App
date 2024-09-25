import { openContactChatWindow } from '../contactChatbot.js';
import { openEditTaskModal } from './modalManagement.js';
import { openEmailTemplateModal } from './emailTemplateAction.js';

document.addEventListener('DOMContentLoaded', function() {
    initializeTaskEventHandlers();
});

export function initializeTaskEventHandlers() {
    // Remove any existing event listeners
    document.removeEventListener('click', handleTaskButtonClick);
    
    // Add a single event listener for all task buttons
    document.addEventListener('click', handleTaskButtonClick);
}

function handleTaskButtonClick(event) {
    const target = event.target.closest('button');
    if (!target) return;

    const taskElement = target.closest('.task');
    if (!taskElement) return;

    console.log('Clicked element:', target);
    console.log('Task element found:', taskElement);

    if (target.classList.contains('ai-button') || target.classList.contains('contact-card-ai-button')) {
        handleAIButtonClick(taskElement);
    } else if (target.classList.contains('edit-button') || target.classList.contains('contact-card-edit-button')) {
        handleEditButtonClick(taskElement);
    } else if (target.classList.contains('delete-button') || target.classList.contains('contact-card-delete-button')) {
        handleDeleteButtonClick(taskElement);
    } else if (target.classList.contains('complete-button') || target.classList.contains('contact-card-complete-button')) {
        handleCompleteButtonClick(taskElement);
    } else if (target.classList.contains('contact-button') || target.classList.contains('contact-card-contact-button')) {
        handleContactButtonClick(taskElement);
    } else if (target.classList.contains('email-template-button') || target.classList.contains('contact-card-email-template-button')) {
        handleEmailTemplateButtonClick(taskElement);
    }
}

function handleEditButtonClick(taskElement) {
    const taskId = taskElement.dataset.taskId;
    console.log('Edit button clicked for task ID:', taskId);

    const taskTitleElement = taskElement.querySelector('h3');
    const contactNameElement = taskElement.querySelector('p:nth-of-type(1)');
    const taskDueDateElement = taskElement.querySelector('p:nth-of-type(2)');
    const taskDescriptionElement = taskElement.querySelector('p:nth-of-type(3)');

    if (!taskTitleElement || !taskDueDateElement || !taskDescriptionElement) {
        console.error('One or more task elements not found');
        return;
    }

    const taskTitle = taskTitleElement.textContent;
    const taskDueDate = taskDueDateElement.textContent.split(': ')[1];
    const taskDescription = taskDescriptionElement.textContent.split(': ')[1];
    
    let contactFirstName = '', contactLastName = '';
    if (contactNameElement) {
        const contactNameText = contactNameElement.textContent.split(': ')[1];
        const contactNameParts = contactNameText.trim().split(' ');
        contactFirstName = contactNameParts[0] || '';
        contactLastName = contactNameParts.slice(1).join(' ') || '';
    }

    const task = {
        id: taskId,
        title: taskTitle,
        dueDate: taskDueDate,
        description: taskDescription,
        contactFirstName: contactFirstName,
        contactLastName: contactLastName,
        contactId: taskElement.dataset.contactId
    };

    console.log('Opening edit modal for task:', task);
    openEditTaskModal(task);
}

function handleAIButtonClick(taskElement) {
    const contactId = taskElement.dataset.contactId;
    console.log('AI button clicked for contact:', contactId);
    if (contactId) {
        openContactChatWindow(contactId);
    } else {
        console.error('Contact ID not found for this task');
    }
}

async function handleDeleteButtonClick(taskElement) {
    const taskId = taskElement.dataset.taskId;
    const contactId = taskElement.dataset.contactId;

    if (confirm("Confirm you'd like to DELETE this task")) {
        try {
            const response = await fetch(`/delete-task/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ contactId: contactId })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();
            console.log('Task deleted:', result);

            // Optionally, remove the task element from the DOM
            taskElement.remove();
        } catch (error) {
            console.error('Failed to delete task:', error);
            alert('Failed to delete task. Please try again.');
        }
    }
}

async function handleCompleteButtonClick(taskElement) {
    const taskId = taskElement.dataset.taskId;
    const contactId = taskElement.dataset.contactId;

    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contactId: contactId, completed: true })
    };

    try {
        const response = await fetch(`/complete-task/${taskId}`, options);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        console.log('Task completed:', result);

        taskElement.classList.add('completed');
    } catch (error) {
        console.error('Failed to complete task:', error);
        alert('Failed to complete task. Please try again.');
    }
}

async function handleContactButtonClick(taskElement) {
    const contactId = taskElement.dataset.contactId;

    // Fetch locationId from oauth_data.json
    let locationId;
    try {
        const response = await fetch('/oauth_data.json');
        const oauthData = await response.json();
        locationId = oauthData.locationId;
    } catch (error) {
        console.error('Failed to fetch locationId:', error);
        alert('Failed to fetch locationId. Please try again.');
        return;
    }

    // Construct the URL
    const url = `https://app.strategixai.co/v2/location/${encodeURIComponent(locationId)}/contacts/detail/${encodeURIComponent(contactId)}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
}

function handleEmailTemplateButtonClick(taskElement) {
    const contactId = taskElement.dataset.contactId;
    const contactNameElement = taskElement.querySelector('p:nth-of-type(1)');
    const contactFullName = contactNameElement.textContent.split(': ')[1];
    
    // Split the full name, considering there might be multiple words in the business name
    const nameParts = contactFullName.split(' ');
    const contactFirstName = nameParts[0];
    const contactLastName = nameParts.slice(1).join(' '); // Join the rest of the name parts

    const taskData = {
        contactId,
        contactFirstName,
        contactLastName,
        contactFullName
    };

    console.log('Email template data:', taskData);
    openEmailTemplateModal(taskData);
}