// Your web app's Firebase configuration
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
  
  // DOM elements
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const dateTimePicker = document.getElementById('dateTimePicker');
  const setDateTimeBtn = document.getElementById('setDateTime');
  const themeToggle = document.getElementById('themeToggle');
  const startTimeDisplay = document.getElementById('startTimeDisplay');
  
  let startTime;
  
  // Load start time from Firebase
  function loadStartTime() {
      const startTimeRef = database.ref('startTime');
      startTimeRef.on('value', (snapshot) => {
          const data = snapshot.val();
          if (data) {
              startTime = new Date(data);
              updateStartTimeDisplay();
              updateTimeDifference();
          } else {
              // If no start time is set in the database, set it to now
              setNewStartTime(new Date());
          }
      });
  }
  
  // Update the display of the start time
  function updateStartTimeDisplay() {
      startTimeDisplay.textContent = startTime.toLocaleString();
  }
  
  // Calculate and display the time difference
  function updateTimeDifference() {
      const now = new Date();
      const difference = now - startTime;
  
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
  
      daysEl.textContent = days.toString().padStart(2, '0');
      hoursEl.textContent = hours.toString().padStart(2, '0');
      minutesEl.textContent = minutes.toString().padStart(2, '0');
      secondsEl.textContent = seconds.toString().padStart(2, '0');
  
      requestAnimationFrame(updateTimeDifference);
  }
  
  // Set new start time
  function setNewStartTime(newTime = null) {
      const newStartTime = newTime || new Date(dateTimePicker.value);
      if (isNaN(newStartTime.getTime())) {
          alert('Please enter a valid date and time.');
          return;
      }
      database.ref('startTime').set(newStartTime.getTime());
  }
  
  // Toggle theme
  function toggleTheme() {
      document.body.classList.toggle('light-theme');
      themeToggle.textContent = document.body.classList.contains('light-theme') ? '🌙' : '☀️';
      localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
  }
  
  // Event listeners
  setDateTimeBtn.addEventListener('click', () => setNewStartTime());
  themeToggle.addEventListener('click', toggleTheme);
  
  // Initialize
  loadStartTime();
  
  // Set theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      themeToggle.textContent = '🌙';
  }
  
  // Set the date-time picker to the current time
  dateTimePicker.value = new Date().toISOString().slice(0, 16);
