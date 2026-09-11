const form = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const priorityInput = document.querySelector("#priority");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const taskMessage = document.querySelector("#task-message");


// Store the tasks while the page is open
const tasks = [];


// Add a task
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const taskName = taskInput.value.trim();
    const taskPriority = priorityInput.value;

    // Check if the user entered a task
    if (taskName === "") {
        alert("Please enter a task.");
        return;
    }

    const newTask = {
        name: taskName,
        priority: taskPriority,
        completed: false
    };

    tasks.push(newTask);

    displayTasks();

    taskInput.value = "";
    taskInput.focus();
});


// Display the tasks
function displayTasks() {

    taskList.innerHTML = "";

    tasks.forEach(function (task, index) {

        const taskElement = document.createElement("div");

        taskElement.classList.add("task");
        taskElement.classList.add(task.priority);


        if (task.completed) {
            taskElement.classList.add("completed");
        }


        const taskInfo = document.createElement("div");


        const name = document.createElement("div");
        name.classList.add("task-name");
        name.textContent = task.name;


        const priority = document.createElement("div");
        priority.classList.add("task-priority");

        priority.textContent =
            "Priority: " + capitalize(task.priority);


        taskInfo.appendChild(name);
        taskInfo.appendChild(priority);


        const buttons = document.createElement("div");
        buttons.classList.add("task-buttons");


        // Complete button
        const completeButton = document.createElement("button");
        completeButton.type = "button";

        if (task.completed) {
            completeButton.textContent = "Undo";
        } else {
            completeButton.textContent = "Complete";
        }


        completeButton.addEventListener("click", function () {

            tasks[index].completed = !tasks[index].completed;

            displayTasks();
        });


        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";


        deleteButton.addEventListener("click", function () {

            tasks.splice(index, 1);

            displayTasks();
        });


        buttons.appendChild(completeButton);
        buttons.appendChild(deleteButton);

        taskElement.appendChild(taskInfo);
        taskElement.appendChild(buttons);

        taskList.appendChild(taskElement);
    });


    updateTaskInfo();
}


// Update the number of tasks
function updateTaskInfo() {

    const totalTasks = tasks.length;

    let completedTasks = 0;


    tasks.forEach(function (task) {

        if (task.completed) {
            completedTasks++;
        }

    });


    if (totalTasks === 1) {
        taskCount.textContent = "1 task";
    } else {
        taskCount.textContent = totalTasks + " tasks";
    }


    if (totalTasks === 0) {

        taskMessage.textContent = "No tasks added yet.";

    } else {

        taskMessage.textContent =
            completedTasks + " completed out of " + totalTasks;

    }
}


// Capitalize the priority name
function capitalize(word) {

    return word.charAt(0).toUpperCase() + word.slice(1);

}