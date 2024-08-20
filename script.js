// DOM elements
const timeDisplay = document.querySelector('.time-display');
const startStopBtn = document.getElementById('startStop');
const lapBtn = document.getElementById('lap');
const resetBtn = document.getElementById('reset');
const lapList = document.getElementById('lapList');
const themeToggle = document.getElementById('themeToggle');
const exportCSVBtn = document.getElementById('exportCSV');
const circle = document.querySelector('.progress-ring__circle');

// Variables
let startTime;
let elapsedTime = 0;
let timerInterval;
let running = false;
let lapTimes = [];

// Calculate circle properties
const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;

// Update time display
function updateDisplay() {
    const time = new Date(elapsedTime);
    const minutes = time.getUTCMinutes().toString().padStart(2, '0');
    const seconds = time.getUTCSeconds().toString().padStart(2, '0');
    const milliseconds = Math.floor(time.getUTCMilliseconds() / 10).toString().padStart(2, '0');
    timeDisplay.textContent = `${minutes}:${seconds}.${milliseconds}`;

    // Update progress ring
    const progress = (seconds % 60) / 60;
    const offset = circumference - (progress * circumference);
    circle.style.strokeDashoffset = offset;
}

// Start or stop the timer
function startStop() {
    if (running) {
        clearInterval(timerInterval);
        startStopBtn.textContent = 'Start';
        running = false;
    } else {
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(function() {
            elapsedTime = Date.now() - startTime;
            updateDisplay();
        }, 10);
        startStopBtn.textContent = 'Stop';
        running = true;
    }
    startStopBtn.classList.toggle('active');
    playClickSound();
    vibrate();
}

// Record a lap time
function lap() {
    if (running) {
        const lapTime = elapsedTime;
        lapTimes.push(lapTime);
        const lapItem = document.createElement('li');
        lapItem.innerHTML = `<span>Lap ${lapTimes.length}</span><span>${formatTime(lapTime)}</span>`;
        lapList.insertBefore(lapItem, lapList.firstChild);
        playClickSound();
        vibrate();
    }
}

// Reset the timer
function reset() {
    clearInterval(timerInterval);
    elapsedTime = 0;
    updateDisplay();
    startStopBtn.textContent = 'Start';
    startStopBtn.classList.remove('active');
    running = false;
    lapTimes = [];
    lapList.innerHTML = '';
    playClickSound();
    vibrate();
}

// Format time for lap display
function formatTime(time) {
    const date = new Date(time);
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    const milliseconds = Math.floor(date.getUTCMilliseconds() / 10).toString().padStart(2, '0');
    return `${minutes}:${seconds}.${milliseconds}`;
}

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    themeToggle.textContent = document.body.classList.contains('light-theme') ? '🌙' : '☀️';
    playClickSound();
    vibrate();
}

// Export lap times to CSV
function exportToCSV() {
    if (lapTimes.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Lap,Time\n";
    lapTimes.forEach((time, index) => {
        csvContent += `${index + 1},${formatTime(time)}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lap_times.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Play click sound
function playClickSound() {
    const audio = new Audio('data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwPj4+Pj4+TExMTExZWVlZWVlnZ2dnZ3V1dXV1dYODg4ODkZGRkZGRn5+fn5+frKysrKy6urq6urrIyMjIyNbW1tbW1uTk5OTk8vLy8vLy//////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAQKAAAAAAAAHjOZTf9/AAAAAAAAAAAAAAAAAAAAAP/zYsAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEAAABoAAAABhMfU1AgAAAABieVNDOAAAAAAAAH/+7EGAAAf0AASQAAAKAAAlAAACBEQBP8AAAEAKAGkAAAAhnEHQTTT6tp9bT7PBHhRWEVV9/k4fID4eHMXMXMXcf+0/D91Ep3qoMXKA0HAn/4O8G8CHHw7wQz4GXBnBqjX/+JTChlKVNEAKgWOIQGgMWRpMBe+hnhlKKOC7YIAKLf/SxVK0m9cP/6LnlUBX////+1M+pZshVJCffCpNyxqOb//PyxqOcy7YjxKlQOjLJX/dB0WClEp+yZDjC9+0r/xOHoiUHoiFP6goBRy2KYgfyGh0GIxdBVWh8CUCmGTMTn1/ztNBq/bTEzOXB/55tF4eV5xfxf/rvk2JEOPdNquU2IExzpgRgFUvSh+AkHGOHzCXEDQAq+Cn89+97ncWGMZTWWDdUZyJGZbSIlBUASrWVANoTaWs/t2+JFDzM6QUekyPMzM6UJBMAoAdBISklHg/TZnGOWnY0QFVVSwxMr7//PJJ2hd33c0Tep/k//UzCfHlDjGHZufLTCxWPdMgwFK11YALfRgWwiBSO8JgyEzIyiuBCCiCsABFxw4Yg6WgvgpGYRZu0qKl/DFDgECU0KzTLXkHhjGCqpXdTIVUy8Q0bnMVNRTnTmX6uqDz5UBaANoWI1PZXWruMwCQUMwmjXfCMAGOZwJUi5VUlcxTOAKrRi8G4GjRCRgm0jWijlcsNsVlEZrV6UGb0iVIQEuYHJqygQST7XZWQ6OXVfP6VIaaqUbMUiKpEFSEA0kBUsbVPUhYVkYE4V8GyKq/pAbBhlDIcOXioRhZcWzB5dkA3NSLGVq9OCcYhO68o11qb8V64r4xF1KHjjEgpQz3MvTdKMt//nGNhbLtWqkOECpAAAAoAAA4MpjOLXMmB8gE8DBkYo8OUmBhqBIm4fUhHyMnCFpjOoXKYD9wHCpAB8jn9WqB2cLABMmfY1mHcMzVAI49y6MbEK4ZKoXy7LaZAJmK6ZY/W2RJxRxJYM1Rb5PZrKrWCkMfNcThFTA2XSowP2NxMmgaBe+Kk4hBi0EMRKLAjKQc7T3EjJDSOH3KMK9ONiGrmC2QjP8VnN5JXBZLsShPNmEmSUGy7CElG1GjKWRhTz
