document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("userName")) {
    window.location.href = "login.html";
  }

  // DOM elements
  const selectedDateInput = document.getElementById("selected-date");
  const userNameElement = document.getElementById("user-name");
  const greetingTimeElement = document.getElementById("greeting-time");
  const currentDateElement = document.getElementById("current-date");
  const addBtn = document.getElementById("add-task-btn");
  const popup = document.getElementById("popup");
  const closePopup = document.getElementById("close-popup");
  const saveTask = document.getElementById("save-task");
  const taskList = document.getElementById("task-list");
  const laterTaskList = document.querySelector(".later-task-list");
  const taskTitleInput = document.getElementById("task-title");
  const taskTimeInput = document.getElementById("task-time");
  const doLaterCheckbox = document.getElementById("do-later-checkbox");

  // Initialize date and greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
  greetingTimeElement.textContent = greeting;

  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];
  selectedDateInput.value = todayDate;
  selectedDateInput.min = "2023-01-01";
  selectedDateInput.max = "2030-12-31";

  let selectedDate = todayDate;

  // Initialize current date display
  currentDateElement.textContent = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Initialize user name
  const userName = localStorage.getItem("userName") || "User";
  userNameElement.textContent = userName;

  // Date change handler
  selectedDateInput.addEventListener("change", () => {
    selectedDate = selectedDateInput.value;
    loadTasksForDate(selectedDate);
  });

  // Initialize quotes
  const quotes = [
  "Push yourself, because no one else is going to do it for you.",
  "Don’t watch the clock; do what it does. Keep going.",
  "Doubt kills more dreams than failure ever will.",
  "Success is what comes after you stop making excuses.",
  "You are capable of amazing things.",
  "Believe in yourself and all that you are.",
  "Stay focused and never give up.",
  "Your only limit is your mind.",
  "Start where you are. Use what you have. Do what you can.",
  "Small steps every day lead to big results."
];

// Create a hash function to get a consistent quote per day
function getHashFromDate(dateString) {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

const todayStr = new Date().toISOString().split("T")[0]; // e.g. "2025-06-25"
const quoteIndex = getHashFromDate(todayStr) % quotes.length;

document.getElementById("quote-text").textContent = quotes[quoteIndex];

  // Popup handlers
  addBtn.addEventListener("click", () => {
    resetPopup();
    popup.style.display = "flex";
    taskTitleInput.focus();
  });

  closePopup.addEventListener("click", () => {
    popup.style.display = "none";
  });

  // FIXED: Save task handler - fixed the issue where tasks weren't saving to selected date
  saveTask.addEventListener("click", () => {
    const title = taskTitleInput.value.trim();
    const time = taskTimeInput.value.trim();
    const isDoLater = doLaterCheckbox.checked;

    if (!title || !time) {
      alert("Please fill in both fields.");
      return;
    }

    const task = { title, time, completed: false };

    if (isDoLater) {
      const doLaterTasks = JSON.parse(localStorage.getItem("doLaterTasks")) || [];
      doLaterTasks.push(task);
      localStorage.setItem("doLaterTasks", JSON.stringify(doLaterTasks));
      loadDoLaterTasks();
    } else {
      // FIX: Properly handle the tasksByDate structure
      const tasksByDate = JSON.parse(localStorage.getItem("tasksByDate")) || {};
      const tasksForDate = tasksByDate[selectedDate] || [];
      
      tasksForDate.push(task);
      tasksByDate[selectedDate] = tasksForDate;
      
      localStorage.setItem("tasksByDate", JSON.stringify(tasksByDate));
      loadTasksForDate(selectedDate);
    }

    popup.style.display = "none";
  });

  function resetPopup() {
    taskTitleInput.value = "";
    taskTimeInput.value = "";
    doLaterCheckbox.checked = false;
  }

  function loadTasksForDate(date) {
    taskList.innerHTML = "";
    const tasksByDate = JSON.parse(localStorage.getItem("tasksByDate")) || {};
    const tasks = tasksByDate[date] || [];

    if (tasks.length === 0) {
      taskList.innerHTML = `<p class="no-tasks">No tasks for this date. Add one!</p>`;
      return;
    }

    tasks.forEach((task, index) => {
      const taskCard = createTaskCard(task, tasks, index, date, "tasksByDate");
      taskList.appendChild(taskCard);
    });
  }

  function loadDoLaterTasks() {
    laterTaskList.innerHTML = "";
    const tasks = JSON.parse(localStorage.getItem("doLaterTasks")) || [];

    if (tasks.length === 0) {
      laterTaskList.innerHTML = `<p class="no-tasks">No "Do Later" tasks yet.</p>`;
      return;
    }

    tasks.forEach((task, index) => {
      const taskCard = createTaskCard(task, tasks, index, null, "doLaterTasks");
      laterTaskList.appendChild(taskCard);
    });
  }

  function createTaskCard(task, taskArray, index, dateKey, storageKey) {
    const taskCard = document.createElement("div");
    taskCard.className = "task-card";
    if (task.completed) taskCard.classList.add("completed");

    taskCard.innerHTML = `
      <div class="task-content">
        <h4>${task.title}</h4>
        <p>${task.time}</p>
      </div>
      <div class="task-actions">
        <button class="complete-btn">${task.completed ? "✅" : "✔️"}</button>
        <button class="edit-btn">✏️</button>
        <button class="delete-btn">🗑️</button>
      </div>
    `;

    taskCard.querySelector(".complete-btn").addEventListener("click", () => {
      taskArray[index].completed = !taskArray[index].completed;
      localStorage.setItem(storageKey, JSON.stringify(taskArray));
      storageKey === "tasksByDate"
        ? loadTasksForDate(dateKey)
        : loadDoLaterTasks();
    });

    taskCard.querySelector(".edit-btn").addEventListener("click", () => {
      const newTitle = prompt("Edit task title:", task.title);
      const newTime = prompt("Edit time:", task.time);
      if (newTitle && newTime) {
        taskArray[index].title = newTitle;
        taskArray[index].time = newTime;
        localStorage.setItem(storageKey, JSON.stringify(taskArray));
        storageKey === "tasksByDate"
          ? loadTasksForDate(dateKey)
          : loadDoLaterTasks();
      }
    });

    taskCard.querySelector(".delete-btn").addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this task?")) {
        taskArray.splice(index, 1);
        localStorage.setItem(storageKey, JSON.stringify(taskArray));
        storageKey === "tasksByDate"
          ? loadTasksForDate(dateKey)
          : loadDoLaterTasks();
      }
    });

    return taskCard;
  }

  // Initialize the app
  loadTasksForDate(selectedDate);
  loadDoLaterTasks();
});
