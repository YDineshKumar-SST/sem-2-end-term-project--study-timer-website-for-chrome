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
            resetTimer();
            document.getElementById('timerLabel').innerText = `Studying: ${name}`;
            localStorage.setItem('timer_label', `Studying: ${name}`);
            startTimer();
            await triggerMiniMode();
            window.open(url, '_blank');
        }

        async function trackTask(title, link) {
            resetTimer();
            document.getElementById('timerLabel').innerText = `Task: ${title}`;
            localStorage.setItem('timer_label', `Task: ${title}`);
            startTimer();
            await triggerMiniMode();
            if (link) window.open(link, '_blank');
        }

        document.getElementById('pipBtn').addEventListener('click', triggerMiniMode);

        window.onload = function () {
            if (isRunning) { elapsedTime = Date.now() - startTime; startTimer(true); }
            else { document.getElementById("display").innerHTML = timeToString(elapsedTime); }
            if (localStorage.getItem('timer_label')) document.getElementById('timerLabel').innerText = localStorage.getItem('timer_label');
            renderTasks();
        };

        function saveAndRender() { localStorage.setItem('tasks', JSON.stringify(taskList)); renderTasks(); }

        function addTaskFromInput() {
            const title = document.getElementById('taskTitle').value;
            const date = document.getElementById('dueDate').value;
            if (!title || !date) return alert('Enter title and date');
            taskList.push({
                id: Date.now(), title, dueDate: date,
                dueTime: document.getElementById('dueTime').value || "No time",
                priority: document.getElementById('priority').value,
                link: document.getElementById('taskLink').value.trim(), completed: false
            });
            saveAndRender();
        }

        function toggleTask(id) { taskList = taskList.map(t => t.id === id ? { ...t, completed: !t.completed } : t); saveAndRender(); }

        function deleteTask(id) {
            const task = taskList.find(t => t.id === id);
            if (task && task.completed) { taskList = taskList.filter(t => t.id !== id); saveAndRender(); }
            else alert("Complete first!");
        }

        function renderTasks() {
            const container = document.getElementById('tasksContainer');
            container.innerHTML = taskList.map(task => `
                <div class="task-card ${task.completed ? 'completed' : ''}">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTask(${task.id})">
                    <div class="task-info" style="margin-left:10px">
                        <span class="task-title">${task.title}</span>
                        <div class="task-meta">📅 ${task.dueDate} ⏰ ${task.dueTime}</div>
                    </div>
                    <button class="btn-icon" onclick="trackTask('${task.title}', '${task.link}')">⏱️</button>
                    <button class="btn-icon" onclick="deleteTask(${task.id})">Del</button>
                </div>
            `).join('');
        }