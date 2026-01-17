let taskList = JSON.parse(localStorage.getItem('tasks')) || [];
let elapsedTime = parseInt(localStorage.getItem('timer_elapsedTime')) || 0;
let isRunning = localStorage.getItem('timer_isRunning') === 'true';
let startTime = parseInt(localStorage.getItem('timer_startTime')) || Date.now();
let timerInterval;

const canvas = document.getElementById('pipCanvas');
const ctx = canvas.getContext('2d');
const video = document.getElementById('pipVideo');

function timeToString(time) {
    let hh = Math.floor(time / 3600000);
    let mm = Math.floor((time % 3600000) / 60000);
    let ss = Math.floor((time % 60000) / 1000);
    return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
}

function updatePiPCanvas() {
    ctx.fillStyle = "#1e293b"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fbbf24"; ctx.font = "bold 40px monospace"; ctx.textAlign = "center";
    ctx.fillText(timeToString(elapsedTime), canvas.width / 2, 70);
    ctx.fillStyle = "#ffffff"; ctx.font = "12px Arial";
    ctx.fillText(document.getElementById('timerLabel').innerText, canvas.width / 2, 110);
}

async function triggerMiniMode() {
    try {
        video.srcObject = canvas.captureStream();
        await video.play();
        if (document.pictureInPictureElement) return;
        await video.requestPictureInPicture();
    } catch (e) { console.log("PiP Auto-activation failed or not supported."); }
}

function startTimer(isResuming = false) {
    clearInterval(timerInterval);
    if (!isResuming) startTime = Date.now() - elapsedTime;
    isRunning = true;
    localStorage.setItem('timer_isRunning', 'true');
    localStorage.setItem('timer_startTime', startTime);
    timerInterval = setInterval(() => {
        elapsedTime = Date.now() - startTime;
        document.getElementById("display").innerHTML = timeToString(elapsedTime);
        updatePiPCanvas();
        if (Math.floor(elapsedTime / 1000) % 5 === 0) localStorage.setItem('timer_elapsedTime', elapsedTime);
    }, 1000);
}

function pauseTimer() { clearInterval(timerInterval); isRunning = false; localStorage.setItem('timer_isRunning', 'false'); }

function resetTimer() {
    clearInterval(timerInterval);
    document.getElementById("display").innerHTML = "00:00:00";
    elapsedTime = 0; isRunning = false;
    document.getElementById('timerLabel').innerText = "No task selected";
    localStorage.setItem('timer_elapsedTime', '0');
    localStorage.setItem('timer_isRunning', 'false');
    localStorage.removeItem('timer_label');
}

async function autoTrack(name, url) {
    try {
        resetTimer();
        document.getElementById('timerLabel').innerText = `Studying: ${name}`;
        localStorage.setItem('timer_label', `Studying: ${name}`);
        startTimer();
        await triggerMiniMode();
        window.open(url, '_blank');
    } catch (error) {
        console.error('Error in autoTrack:', error);
        showNotification('Could not open resource. Check your connection.', 'error');
    }
}

async function trackTask(title, link) {
    try {
        resetTimer();
        document.getElementById('timerLabel').innerText = `Task: ${escapeHtml(title)}`;
        localStorage.setItem('timer_label', `Task: ${title}`);
        startTimer();
        await triggerMiniMode();
        if (link && link !== '' && isValidUrl(link)) {
            window.open(link, '_blank');
        }
    } catch (error) {
        console.error('Error tracking task:', error);
        showNotification('Error starting task timer', 'error');
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

document.getElementById('pipBtn').addEventListener('click', triggerMiniMode);

document.getElementById('taskTitle').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') addTaskFromInput();
});

document.getElementById('taskLink').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') addTaskFromInput();
});

window.onload = function () {
    if (isRunning) { elapsedTime = Date.now() - startTime; startTimer(true); }
    else { document.getElementById("display").innerHTML = timeToString(elapsedTime); }
    if (localStorage.getItem('timer_label')) document.getElementById('timerLabel').innerText = localStorage.getItem('timer_label');
    renderTasks();
};

function saveAndRender() {
    try {
        localStorage.setItem('tasks', JSON.stringify(taskList));
        renderTasks();
    } catch (error) {
        console.error('Error saving tasks:', error);
        showNotification('Error saving tasks. Check browser storage.', 'error');
    }
}

function addTaskFromInput() {
    try {
        const title = document.getElementById('taskTitle').value.trim();
        const date = document.getElementById('dueDate').value;
        const time = document.getElementById('dueTime').value || "No time";
        const priority = document.getElementById('priority').value;
        const link = document.getElementById('taskLink').value.trim();

        if (!title) {
            showNotification('Please enter a task description', 'error');
            return;
        }
        if (!date) {
            showNotification('Please select a due date', 'error');
            return;
        }

        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            showNotification('Due date cannot be in the past', 'error');
            return;
        }

        const newTask = {
            id: Date.now(),
            title: title,
            dueDate: date,
            dueTime: time,
            priority: priority,
            link: link,
            completed: false,
            createdAt: new Date().toISOString()
        };

        taskList.push(newTask);
        saveAndRender();
        clearTaskForm();
        showNotification('Task added successfully!', 'success');
    } catch (error) {
        console.error('Error adding task:', error);
        showNotification('Error adding task. Please try again.', 'error');
    }
}

function toggleTask(id) {
    try {
        taskList = taskList.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        saveAndRender();
        const task = taskList.find(t => t.id === id);
        const status = task.completed ? 'completed' : 'incomplete';
        showNotification(`Task marked as ${status}`, 'success');
    } catch (error) {
        console.error('Error toggling task:', error);
    }
}

function deleteTask(id) {
    try {
        const task = taskList.find(t => t.id === id);
        if (task && task.completed) {
            taskList = taskList.filter(t => t.id !== id);
            saveAndRender();
            showNotification('Task deleted successfully', 'success');
        } else {
            showNotification('Complete the task before deleting', 'error');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

function renderTasks() {
    const container = document.getElementById('tasksContainer');

    if (taskList.length === 0) {
        container.innerHTML = '<div class="no-tasks-message">📝 No tasks yet. Add one to get started!</div>';
        return;
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sortedTasks = [...taskList].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    container.innerHTML = sortedTasks.map(task => `
                <div class="task-card ${task.completed ? 'completed' : ''} priority-${task.priority}">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTask(${task.id})" class="task-checkbox">
                    <div class="priority-indicator priority-${task.priority}"></div>
                    <div class="task-info" style="margin-left:10px">
                        <span class="task-title" title="${task.title}">${escapeHtml(task.title)}</span>
                        <div class="task-meta">📅 ${formatDate(task.dueDate)} ⏰ ${task.dueTime}</div>
                        <div class="task-priority">Priority: <span class="priority-badge priority-${task.priority}">${task.priority.toUpperCase()}</span></div>
                    </div>
                    <button class="btn-icon btn-track" onclick="trackTask('${escapeHtml(task.title)}', '${escapeHtml(task.link)}')" title="Start tracking time">⏱️</button>
                    <button class="btn-icon btn-delete" onclick="deleteTask(${task.id})" title="Delete task">🗑️</button>
                </div>
            `).join('');
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function clearTaskForm() {
    document.getElementById('taskTitle').value = '';
    document.getElementById('dueDate').value = '';
    document.getElementById('dueTime').value = '';
    document.getElementById('taskLink').value = '';
    document.getElementById('priority').value = 'medium';
    document.getElementById('taskTitle').focus();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.animation = 'slideIn 0.3s ease-out';
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
