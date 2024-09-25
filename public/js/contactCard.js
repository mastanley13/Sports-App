import { createContactCardTaskElement } from './taskLoading.js';
import { initializeTaskEventHandlers } from './taskEventHandlers.js';

export function initializeContactCard() {
    const modal = document.getElementById('contactCardModal');
    const closeBtn = modal.querySelector('.close');

    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    function capitalizeWords(string) {
        return string.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    
    async function openContactCard(contact) {
        const modalContent = modal.querySelector('.modal-content');
        modalContent.innerHTML = ''; // Clear existing content

        // Create left half for contact information
        const leftHalf = document.createElement('div');
        leftHalf.className = 'modal-half left-half';
        leftHalf.innerHTML = `
            <h2>Contact Information</h2>
            <div id="contactInfo"></div>
        `;
        modalContent.appendChild(leftHalf);

        // Create right half for tasks
        const rightHalf = document.createElement('div');
        rightHalf.className = 'modal-half right-half';
        rightHalf.innerHTML = `
            <h2>${capitalizeWords(contact.firstName + ' ' + contact.lastName)}</h2>
            <div id="contactTasks"></div>
        `;
        modalContent.appendChild(rightHalf);

        // Populate contact information
        populateContactInfo(contact);

        // Fetch and populate tasks
        try {
            const tasks = await fetchTasks(contact.id);
            console.log('Fetched tasks:', tasks);

            const tasksContainer = rightHalf.querySelector('#contactTasks');
            tasksContainer.innerHTML = '';

            if (Array.isArray(tasks) && tasks.length > 0) {
                tasks.forEach(task => {
                    try {
                        const taskWithContactInfo = {
                            ...task,
                            contactId: contact.id,
                            contactName: `${contact.firstName} ${contact.lastName}`.trim()
                        };
                        const taskElement = createContactCardTaskElement(taskWithContactInfo);
                        tasksContainer.appendChild(taskElement);
                    } catch (error) {
                        console.error('Error creating task element:', error);
                        const errorElement = document.createElement('p');
                        errorElement.textContent = 'Error loading task';
                        errorElement.style.color = 'red';
                        tasksContainer.appendChild(errorElement);
                    }
                });

                initializeTaskEventHandlers();
            } else {
                tasksContainer.innerHTML = '<p>No tasks found for this contact.</p>';
            }

            modal.style.display = "block";
        } catch (error) {
            console.error('Error fetching tasks:', error);
            rightHalf.querySelector('#contactTasks').innerHTML = '<p>Error loading tasks. Please try again.</p>';
            modal.style.display = "block";
        }
    }

    function populateContactInfo(contact) {
        const contactInfoContainer = document.getElementById('contactInfo');
        contactInfoContainer.innerHTML = `
            <p><strong>First Name:</strong> ${capitalizeFirstLetter(contact.firstName)}</p>
            <p><strong>Last Name:</strong> ${capitalizeFirstLetter(contact.lastName)}</p>
            <p><strong>Email:</strong> ${contact.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${contact.phone || 'N/A'}</p>
            <p><strong>Contact Roles:</strong> ${contact.contactRoles ? contact.contactRoles.join(', ') : 'N/A'}</p>
        `;
    }

    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    async function fetchTasks(contactId) {
        try {
            const response = await fetch(`/get-tasks/${contactId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            throw error;
        }
    }

    return { openContactCard };
}