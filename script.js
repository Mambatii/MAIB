// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBgJUV-KWP0KOqcx07vxGAy5YIOKW3Qiog",
    authDomain: "relap-237bc.firebaseapp.com",
    databaseURL: "https://relap-237bc-default-rtdb.firebaseio.com",
    projectId: "relap-237bc",
    storageBucket: "relap-237bc.appspot.com",
    messagingSenderId: "376049279398",
    appId: "1:376049279398:web:8d7ee8485f61ed6167af67"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database();

// Discord webhook URL
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1277738896016277554/KTG9B2teYXuLMWiqhEmUcY8qQBonLcatX3sj8nCC3KvrTZp_KZX1sCEj5uxxCkvk6QK3'; // Replace with your actual webhook URL

// Function to send Discord notifications
async function sendDiscordNotification(message) {
    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: message }),
        });

        if (!response.ok) {
            throw new Error('Failed to send message to Discord');
        }
        console.log('Message sent successfully to Discord');
    } catch (error) {
        console.error('Error sending message to Discord:', error);
    }
}

// Clock class to manage each clock
class Clock {
    constructor(prefix) {
        this.prefix = prefix;
        this.daysEl = document.getElementById(`${prefix}Days`);
        this.hoursEl = document.getElementById(`${prefix}Hours`);
        this.minutesEl = document.getElementById(`${prefix}Minutes`);
        this.secondsEl = document.getElementById(`${prefix}Seconds`);
        this.dateTimePicker = document.getElementById(`${prefix}DateTimePicker`);
        this.setDateTimeBtn = document.getElementById(`${prefix}SetDateTime`);
        this.startTimeDisplay = document.getElementById(`${prefix}StartTimeDisplay`);
        this.startTime = null;

        this.setDateTimeBtn.addEventListener('click', () => this.toggleDateTimePicker());
        this.loadStartTime();
    }

    loadStartTime() {
        const startTimeRef = database.ref(`${this.prefix}StartTime`);
        startTimeRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                this.startTime = new Date(data);
                this.updateStartTimeDisplay();
                this.updateTimeDifference();
            } else {
                this.setNewStartTime(new Date());
            }
        });
    }

    updateStartTimeDisplay() {
        this.startTimeDisplay.textContent = this.startTime.toLocaleString();
    }

    updateTimeDifference() {
        const now = new Date();
        const difference = now - this.startTime;

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        this.daysEl.textContent = days.toString().padStart(2, '0');
        this.hoursEl.textContent = hours.toString().padStart(2, '0');
        this.minutesEl.textContent = minutes.toString().padStart(2, '0');
        this.secondsEl.textContent = seconds.toString().padStart(2, '0');

        requestAnimationFrame(() => this.updateTimeDifference());
    }

    toggleDateTimePicker() {
        if (this.dateTimePicker.classList.contains('hidden')) {
            this.dateTimePicker.classList.remove('hidden');
            this.setDateTimeBtn.textContent = 'Confirm';
            this.dateTimePicker.value = formatDateTimeLocal(new Date());
        } else {
            this.setNewStartTime();
            this.dateTimePicker.classList.add('hidden');
            this.setDateTimeBtn.textContent = 'Reset';
        }
    }

    async setNewStartTime(newTime = null) {
        const newStartTime = newTime || new Date(this.dateTimePicker.value);
        if (isNaN(newStartTime.getTime())) {
            alert('Please enter a valid date and time.');
            return;
        }
        await database.ref(`${this.prefix}StartTime`).set(newStartTime.getTime());
        
        // Send Discord notification
        await sendDiscordNotification(`The ${this.prefix.toUpperCase()} clock has been reset to ${newStartTime.toLocaleString()}`);
        
        this.startTime = newStartTime;
        this.updateStartTimeDisplay();
    }
}

// Function to format time for datetime-local input
function formatDateTimeLocal(date) {
    return date.getFullYear().toString() +
           '-' + (date.getMonth() + 1).toString().padStart(2, '0') +
           '-' + date.getDate().toString().padStart(2, '0') +
           'T' + date.getHours().toString().padStart(2, '0') +
           ':' + date.getMinutes().toString().padStart(2, '0');
}

// DOM elements
const themeToggle = document.getElementById('themeToggle');

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    themeToggle.textContent = document.body.classList.contains('light-theme') ? '🌙' : '☀️';
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

// Event listeners
themeToggle.addEventListener('click', toggleTheme);

// Initialize clocks
const ibClock = new Clock('ib');
const maClock = new Clock('ma');

// Set theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeToggle.textContent = '🌙';
}

// Update date-time pickers every minute
function updateDateTimePickers() {
    const now = new Date();
    ibClock.dateTimePicker.value = formatDateTimeLocal(now);
    maClock.dateTimePicker.value = formatDateTimeLocal(now);
}

setInterval(updateDateTimePickers, 60000); // Update every minute
updateDateTimePickers(); // Initial update

// Error handling for Firebase connection
database.ref('.info/connected').on('value', (snap) => {
    if (snap.val() === true) {
        console.log('Connected to Firebase');
    } else {
        console.log('Disconnected from Firebase');
    }
});

// Ensure the page is fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
});

// Prevent accidental page reloads
window.addEventListener('beforeunload', (event) => {
    event.preventDefault(); // Cancel the event
    event.returnValue = ''; // Display a default message in some browsers
});
