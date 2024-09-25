export async function loadTasks() {
    try {
        const response = await fetch('/fetch-tasks', { method: 'POST' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log('Fetched tasks:', data);

        if (data && Array.isArray(data.tasks)) {
            console.log("Tasks array is present, populating tasks.");
            // Ensure contactId is properly set for each task
            const processedTasks = data.tasks.map(task => ({
                ...task,
                contactId: task.contactDetails?.id || task.contactId
            }));
            populateTasks(processedTasks);
        } else {
            console.log('No tasks array to display', data);
        }
    } catch (error) {
        console.error('Failed to load tasks:', error);
        alert('Failed to load tasks. Please try again.');
    }
}

function populateTasks(tasks) {
    document.querySelectorAll('.task-list').forEach(e => e.innerHTML = ''); // Clear existing tasks

    const columns = {
        'overdue': [], // Move overdue to the first position
        'today': [],
        'tomorrow': []
    };

    tasks.forEach(task => {
        const columnId = determineColumnForTask(task);
        if (columnId) {
            columns[columnId].push(task);
        }
    });

    console.log('Tasks sorted into columns:', columns);

    // Update the order of processing
    const columnOrder = ['overdue', 'today', 'tomorrow'];
    
    for (const columnId of columnOrder) {
        const tasksInColumn = columns[columnId];
        console.log(`Updating column: ${columnId} with ${tasksInColumn.length} tasks`);
        const sortOrder = columnId === 'overdue' ? 'asc' : 'asc';
        const sortedTasks = sortTasks(tasksInColumn, sortOrder);
        
        // Create and append task elements
        sortedTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            console.log(`Appending task to ${columnId}:`, taskElement);
            document.getElementById(columnId)?.querySelector('.task-list').appendChild(taskElement);
        });

        // Update task count after appending tasks
        const columnTitle = document.querySelector(`.column-title[data-title*="${columnId.charAt(0).toUpperCase() + columnId.slice(1)}"]`);
        if (columnTitle) {
            const taskCountSpan = columnTitle.querySelector('.task-count');
            if (taskCountSpan) {
                console.log(`Updating count for ${columnId}:`, {
                    columnTitle: !!columnTitle,
                    taskCountSpan: !!taskCountSpan,
                    tasksCount: tasksInColumn.length
                });
                taskCountSpan.textContent = `(${tasksInColumn.length})`;
                console.log(`Updated task count for ${columnId}: ${tasksInColumn.length}`);
            } else {
                console.log(`Task count span not found for ${columnId}`);
            }
        } else {
            console.log(`Column title not found for ${columnId}`);
        }
    }
}

function determineColumnForTask(task) {
    if (isToday(task.dueDate)) {
        return 'today';
    } else if (isTomorrow(task.dueDate)) {
        return 'tomorrow';
    } else if (isOverdue(task.dueDate)) {
        return 'overdue';
    }
    return null;
}

function sortTasks(tasks, order = 'asc') {
    return tasks.sort((a, b) => {
        let dateA = new Date(a.dueDate);
        let dateB = new Date(b.dueDate);
        return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
}

export function createTaskElement(task) {
    console.log('Creating task element for task:', task);

    const taskElement = document.createElement('div');
    taskElement.className = 'task';
    taskElement.dataset.taskId = task._id || task.taskId; // Use _id if available, fallback to id
    taskElement.dataset.contactId = task.contactDetails?.id || task.contactId;
    
    const aiButton = document.createElement('button');
    aiButton.className = 'ai-button';
    aiButton.innerHTML = '<i class="fas fa-robot"></i>'; // AI/Robot icon
    taskElement.appendChild(aiButton);

    const titleElement = document.createElement('h3');
    titleElement.textContent = task.title;
    taskElement.appendChild(titleElement);

    const contactElement = document.createElement('p');
    const contactFirstName = task.contactDetails?.firstName ? capitalizeFirstLetter(task.contactDetails.firstName) : '';
    const contactLastName = task.contactDetails?.lastName ? capitalizeFirstLetter(task.contactDetails.lastName) : '';
    contactElement.textContent = `Contact: ${contactFirstName} ${contactLastName}`.trim();
    taskElement.appendChild(contactElement);

    const dueDateElement = document.createElement('p');
    dueDateElement.textContent = `Due Date: ${new Date(task.dueDate).toLocaleDateString()}`;
    taskElement.appendChild(dueDateElement);

    const bodyElement = document.createElement('p');
    bodyElement.textContent = `Description: ${task.body}`;
    bodyElement.style.display = 'none'; // Hide the description
    taskElement.appendChild(bodyElement);

    const taskIdElement = document.createElement('p');
    taskIdElement.className = 'task-id';
    taskIdElement.textContent = `Task ID: ${task._id || task.id}`; // Use _id if available, fallback to id
    taskIdElement.style.display = 'none'; // Hide this element
    taskElement.appendChild(taskIdElement);

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'task-buttons';

    const editButton = document.createElement('button');
    editButton.className = 'edit-button';
    editButton.innerHTML = '<i class="fas fa-edit"></i>'; // Edit icon
    buttonContainer.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Delete icon
    buttonContainer.appendChild(deleteButton);

    const completeButton = document.createElement('button');
    completeButton.className = 'complete-button';
    completeButton.innerHTML = '<i class="fas fa-check-circle"></i>'; // Complete icon
    buttonContainer.appendChild(completeButton);

    const contactButton = document.createElement('button');
    contactButton.className = 'contact-button';
    contactButton.innerHTML = '<i class="fas fa-user"></i>'; // Contact icon
    buttonContainer.appendChild(contactButton);

    const emailTemplateButton = document.createElement('button');
    emailTemplateButton.className = 'email-template-button';
    emailTemplateButton.innerHTML = '<i class="fas fa-bolt"></i>'; // Lightning bolt icon
    buttonContainer.appendChild(emailTemplateButton);

    taskElement.appendChild(buttonContainer);

    return taskElement;
}

export function createContactCardTaskElement(task) {
    console.log('Creating contact card task element for task:', task);

    const taskElement = document.createElement('div');
    taskElement.className = 'task contact-card-task';
    taskElement.dataset.taskId = task.id;
    taskElement.dataset.contactId = task.contactId;

    const titleElement = document.createElement('h3');
    titleElement.textContent = task.title || 'Untitled Task';
    taskElement.appendChild(titleElement);

    const contactElement = document.createElement('p');
    contactElement.className = 'contact-name';
    // Use the contact name from the task data or from the contact details
    const firstName = capitalizeFirstLetter(task.contactDetails?.firstName || task.contactFirstName || '');
    const lastName = capitalizeFirstLetter(task.contactDetails?.lastName || task.contactLastName || '');
    const contactName = task.contactName ? 
        task.contactName.split(' ').map(capitalizeFirstLetter).join(' ') : 
        `${firstName} ${lastName}`.trim();
    contactElement.textContent = `Contact: ${contactName}`;
    taskElement.appendChild(contactElement);

    const dueDateElement = document.createElement('p');
    dueDateElement.textContent = `Due Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}`;
    taskElement.appendChild(dueDateElement);

    const bodyElement = document.createElement('p');
    bodyElement.textContent = `Description: ${task.body || 'No description'}`;
    taskElement.appendChild(bodyElement);

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'task-buttons';

    const aiButton = document.createElement('button');
    aiButton.className = 'contact-card-ai-button';
    aiButton.innerHTML = '<i class="fas fa-robot"></i>'; // AI/Robot icon
    buttonContainer.appendChild(aiButton);

    const editButton = document.createElement('button');
    editButton.className = 'contact-card-edit-button';
    editButton.innerHTML = '<i class="fas fa-edit"></i>'; // Edit icon
    buttonContainer.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'contact-card-delete-button';
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Delete icon
    buttonContainer.appendChild(deleteButton);

    const completeButton = document.createElement('button');
    completeButton.className = 'contact-card-complete-button';
    completeButton.innerHTML = '<i class="fas fa-check-circle"></i>'; // Complete icon
    buttonContainer.appendChild(completeButton);

    const contactButton = document.createElement('button');
    contactButton.className = 'contact-card-contact-button';
    contactButton.innerHTML = '<i class="fas fa-user"></i>'; // Contact icon
    buttonContainer.appendChild(contactButton);

    const emailTemplateButton = document.createElement('button');
    emailTemplateButton.className = 'contact-card-email-template-button';
    emailTemplateButton.innerHTML = '<i class="fas fa-bolt"></i>'; // Lightning bolt icon
    buttonContainer.appendChild(emailTemplateButton);

    taskElement.appendChild(buttonContainer);

    return taskElement;
}

function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function isToday(date) {
    const today = new Date();
    const taskDate = new Date(date);
    return today.toDateString() === taskDate.toDateString();
}

function isTomorrow(date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const taskDate = new Date(date);
    return tomorrow.toDateString() === taskDate.toDateString();
}

function isOverdue(date) {
    const today = new Date();
    const taskDate = new Date(date);
    return taskDate < today && !isToday(date);
}