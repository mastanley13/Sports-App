import { initializeContactSuggestions } from './contactSuggestions.js';
import { openEmailTemplateModal } from './emailTemplateAction.js';

export function initializeModalManagement() {
    const modal = document.getElementById("addTaskModal");
    const modalTitle = document.getElementById("modalTitle");
    const taskIdInput = document.getElementById("taskId");
    const taskIdVisibleInput = document.getElementById("taskIdVisible");
    const titleInput = document.getElementById("title");
    const dueDateInput = document.getElementById("dueDate");
    const contactFirstNameInput = document.getElementById("contactFirstName");
    const contactLastNameInput = document.getElementById("contactLastName");
    const contactIdInput = document.getElementById("contactId");
    const descriptionInput = document.getElementById("description");

    const btn = document.getElementById("addTaskBtn");
    const span = document.getElementsByClassName("close")[0];

    btn.onclick = function() {
        console.log("Add Task button clicked");
        modalTitle.textContent = "Add New Task";
        taskIdInput.value = "";
        taskIdVisibleInput.value = "";
        titleInput.value = "";
        dueDateInput.value = "";
        contactFirstNameInput.value = "";
        contactLastNameInput.value = "";
        contactIdInput.value = "";
        descriptionInput.value = "";
        modal.style.display = "block";
    }

    span.onclick = function() {
        console.log("Close button clicked");
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            console.log("Clicked outside the modal");
            modal.style.display = "none";
        }
    }

    // Initialize contact suggestions
    initializeContactSuggestions();
}

export function openEditTaskModal(task) {
    const modal = document.getElementById("addTaskModal");
    const modalTitle = document.getElementById("modalTitle");
    const taskIdInput = document.getElementById("taskId");
    const taskIdVisibleInput = document.getElementById("taskIdVisible");
    const titleInput = document.getElementById("title");
    const dueDateInput = document.getElementById("dueDate");
    const contactFirstNameInput = document.getElementById("contactFirstName");
    const contactLastNameInput = document.getElementById("contactLastName");
    const contactIdInput = document.getElementById("contactId");
    const descriptionInput = document.getElementById("description");

    modalTitle.textContent = "Edit Task";
    taskIdInput.value = task.id;
    taskIdVisibleInput.value = task.id;
    titleInput.value = task.title;
    dueDateInput.value = new Date(task.dueDate).toISOString().split('T')[0];
    contactFirstNameInput.value = task.contactFirstName;
    contactLastNameInput.value = task.contactLastName;
    contactIdInput.value = task.contactId;
    descriptionInput.value = task.description;

    modal.style.display = "block";
}

export { openEmailTemplateModal };