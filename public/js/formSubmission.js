import { loadTasks } from './taskLoading.js'; // Ensure this import is correct

export function initializeFormSubmission() {
    // Ensure the modal is correctly referenced
    const modal = document.getElementById("addTaskModal");  // Adjust the ID as necessary

    document.getElementById('newTaskForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const task = {
            id: document.getElementById('taskId').value,
            title: document.getElementById('title').value,
            dueDate: document.getElementById('dueDate').value,
            contactId: document.getElementById('contactId').value,
            body: document.getElementById('description').value,
            completed: false,
        };

        console.log('Submitting task:', task);

        try {
            const response = await fetch(task.id ? `/update-task/${task.id}` : '/create-task', {
                method: task.id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(task)
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();
            console.log('Task saved:', result);

            // Close the modal after saving the task
            modal.style.display = "none";

            // Refresh the task list
            loadTasks();  // Assuming loadTasks is a function that fetches and displays the tasks
        } catch (error) {
            console.error('Failed to save task:', error);
            alert('Failed to save task. Please try again.');
        }
    });
}