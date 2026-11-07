let currentUser = null;
let janitorsDB = [];
let assignmentsDB = [];
let attendanceDB = [];
let chartInstance = null;

// SVG EYE TOGGLE
function togglePass(id, btn) {
  const input = document.getElementById(id);
  const isPass = input.type === "password";
  input.type = isPass ? "text" : "password";
  
  btn.innerHTML = isPass 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
}

// TAB SWITCHING
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

  if (tab === 'login') {
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.getElementById('form-login').classList.add('active');
  } else if (tab === 'register') {
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    document.getElementById('form-register').classList.add('active');
  } else {
    document.querySelectorAll('.tab-btn')[2].classList.add('active');
    document.getElementById('form-admin').classList.add('active');
  }
}

// STAFF REGISTER (PREFERRED ID / UNIQUE ID IMPLEMENTATION)
function handleStaffRegister(e) {
  e.preventDefault();
  const fullname = document.getElementById('reg-fullname').value.trim();
  const preferredID = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value.trim();

  if (!fullname || !preferredID || !password) {
    alert("Please fill up all registration fields.");
    return;
  }

  // Check kung may katulad nang Preferred ID / Username
  const existingUser = janitorsDB.find(j => j.username.toLowerCase() === preferredID.toLowerCase() || j.uniqueCode.toLowerCase() === preferredID.toLowerCase());
  if (existingUser) {
    alert("Preferred ID / Username is already taken. Please choose another one.");
    return;
  }

  // Set preferredID as the main uniqueCode & username identification
  const uniqueCode = preferredID;

  janitorsDB.push({ uniqueCode, fullname, username: preferredID, password });
  alert(`Registration Successful!\nYour Registered Identification ID is: ${uniqueCode}\nYou can now use this to log in.`);
  
  switchTab('login');
  document.getElementById('form-register').reset();
}

// STAFF LOGIN (WITH PREFERRED ID & ERROR HANDLING)
function handleStaffLogin(e) {
  e.preventDefault();
  const inputID = document.getElementById('login-username').value.trim();
  const p = document.getElementById('login-password').value.trim();

  // Search by preferred ID (uniqueCode) or username
  const userExists = janitorsDB.find(j => j.uniqueCode.toLowerCase() === inputID.toLowerCase() || j.username.toLowerCase() === inputID.toLowerCase());

  if (!userExists) {
    alert("Unable to log in: Account not found. Please register your account first.");
    return;
  }

  if (userExists.password !== p) {
    alert("Unable to log in: Incorrect password. Please try again.");
    return;
  }

  currentUser = { ...userExists, role: 'janitor' };
  markAttendance(userExists);
  loadDashboard();
}

// ADMIN LOGIN
function handleAdminLogin(e) {
  e.preventDefault();
  const u = document.getElementById('admin-username').value.trim();
  const p = document.getElementById('admin-password').value.trim();

  if (u === "admin" && p === "admin123") {
    currentUser = { uniqueCode: "admin-01", fullname: "Leader Admin", username: "admin", role: "admin" };
    loadDashboard();
  } else {
    alert("Unable to log in: Invalid Admin Credentials.");
  }
}

// ATTENDANCE LOGGING
function markAttendance(user) {
  const today = new Date().toISOString().split('T')[0];
  const time = new Date().toLocaleTimeString();

  const exists = attendanceDB.find(a => a.uniqueCode === user.uniqueCode && a.date === today);
  if (!exists) {
    attendanceDB.push({ name: user.fullname, uniqueCode: user.uniqueCode, date: today, time: time, status: "Present" });
  }
}

// DASHBOARD INITIALIZATION
function loadDashboard() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');

  document.getElementById('display-name').textContent = `Welcome, ${currentUser.fullname}!`;
  document.getElementById('welcome-username').textContent = currentUser.fullname;
  
  const uniqueCodeElem = document.getElementById('display-unique-code');
  if (uniqueCodeElem) uniqueCodeElem.textContent = currentUser.uniqueCode;

  if (currentUser.role === 'admin') {
    document.getElementById('user-role-badge').textContent = "Admin Leader Portal";
    document.getElementById('janitor-menu').classList.add('hidden');
    document.getElementById('admin-menu').classList.remove('hidden');
    showSection('sec-admin-dash');
    renderAdminView();
  } else {
    document.getElementById('user-role-badge').textContent = "Janitor Portal";
    document.getElementById('admin-menu').classList.add('hidden');
    document.getElementById('janitor-menu').classList.remove('hidden');
    showSection('sec-home');
    renderJanitorView();
  }

  renderCalendar();
}

// SECTION SWITCHER
function showSection(secId, elem) {
  document.querySelectorAll('.app-section').forEach(s => s.classList.add('hidden'));
  document.getElementById(secId).classList.remove('hidden');

  if (elem) {
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    elem.classList.add('active');
  }

  if (secId === 'sec-performance') renderChart();
}

// JANITOR VIEW RENDERER
function renderJanitorView() {
  const myAssignments = assignmentsDB.filter(a => a.uniqueCode === currentUser.uniqueCode);
  
  document.getElementById('stat-total').textContent = myAssignments.length;
  document.getElementById('stat-cleaned').textContent = myAssignments.filter(a => a.cleaned).length;
  document.getElementById('stat-pending').textContent = myAssignments.filter(a => !a.cleaned).length;

  const box = document.getElementById('checklist-box');
  const bldgList = document.getElementById('assigned-bldg-list');
  box.innerHTML = '';
  bldgList.innerHTML = '';

  if (myAssignments.length === 0) {
    box.innerHTML = '<p style="color:#64748b">No rooms assigned yet by Admin.</p>';
  } else {
    myAssignments.forEach((a, idx) => {
      box.innerHTML += `
        <div class="checklist-item">
          <div>
            <strong>${a.bldg} - ${a.room}</strong><br>
            <small>Time: ${a.time}</small>
          </div>
          <button class="btn-sm" style="background:${a.cleaned ? '#047857' : '#d97706'}" onclick="toggleClean(${idx})">
            ${a.cleaned ? 'Cleaned ✓' : 'Mark Clean'}
          </button>
        </div>
      `;
      bldgList.innerHTML += `<li>🏢 ${a.bldg} (${a.room})</li>`;
    });
  }

  // Attendance Table
  const attBody = document.getElementById('attendance-table-body');
  attBody.innerHTML = '';
  attendanceDB.filter(a => a.uniqueCode === currentUser.uniqueCode).forEach(a => {
    attBody.innerHTML += `<tr><td>${a.date}</td><td>${a.time}</td><td><span class="status-badge">${a.status}</span></td></tr>`;
  });

  // Profile
  document.getElementById('prof-fullname').value = currentUser.fullname;
  document.getElementById('prof-unique-code').value = currentUser.uniqueCode;
}

function toggleClean(idx) {
  const myAssignments = assignmentsDB.filter(a => a.uniqueCode === currentUser.uniqueCode);
  myAssignments[idx].cleaned = !myAssignments[idx].cleaned;
  renderJanitorView();
}

// ADMIN ASSIGNMENT
function assignRoom(e) {
  e.preventDefault();
  const uniqueCode = document.getElementById('admin-select-janitor').value;
  const bldg = document.getElementById('assign-bldg').value.trim();
  const room = document.getElementById('assign-room').value.trim();
  const time = document.getElementById('assign-time').value.trim();

  assignmentsDB.push({ uniqueCode, bldg, room, time, cleaned: false });
  alert("Room assigned successfully!");
  document.getElementById('assign-bldg').value = '';
  document.getElementById('assign-room').value = '';
  document.getElementById('assign-time').value = '';
  renderAdminView();
}

function renderAdminView() {
  const select = document.getElementById('admin-select-janitor');
  const list = document.getElementById('janitor-list-view');
  select.innerHTML = '';
  list.innerHTML = '';

  janitorsDB.forEach(j => {
    select.innerHTML += `<option value="${j.uniqueCode}">${j.fullname} (${j.uniqueCode})</option>`;
    list.innerHTML += `<li>👤 <strong>${j.fullname}</strong> <small>(${j.uniqueCode})</small> - ${assignmentsDB.filter(a => a.uniqueCode === j.uniqueCode).length} Rooms Assigned</li>`;
  });

  const attBody = document.getElementById('admin-attendance-body');
  attBody.innerHTML = '';
  attendanceDB.forEach(a => {
    attBody.innerHTML += `<tr><td>${a.name} (${a.uniqueCode})</td><td>${a.date}</td><td>${a.time}</td><td>${a.status}</td></tr>`;
  });
}

// LOGOUT
function handleLogout() {
  currentUser = null;
  document.getElementById('main-app').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('form-login').reset();
  document.getElementById('form-admin').reset();
}

// PROFILE SAVE & PHOTO PREVIEW
function saveProfile(e) {
  e.preventDefault();
  const newName = document.getElementById('prof-fullname').value.trim();
  if (!newName) return;
  currentUser.fullname = newName;
  const userInDb = janitorsDB.find(j => j.uniqueCode === currentUser.uniqueCode);
  if (userInDb) userInDb.fullname = newName;
  alert("Profile updated successfully!");
  loadDashboard();
}

function previewImage(event) {
  const reader = new FileReader();
  reader.onload = function() {
    document.getElementById('profile-preview').src = reader.result;
  };
  reader.readAsDataURL(event.target.files[0]);
}

// LIVE CLOCK & CALENDAR
setInterval(() => {
  const clockElem = document.getElementById('live-clock');
  if (clockElem) clockElem.textContent = new Date().toLocaleTimeString();
}, 1000);

function renderCalendar() {
  const now = new Date();
  document.getElementById('calendar-month-year').textContent = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const grid = document.getElementById('calendar-days');
  grid.innerHTML = '';

  for (let i = 1; i <= 30; i++) {
    grid.innerHTML += `<div class="calendar-day ${i === now.getDate() ? 'today' : ''}">${i}</div>`;
  }
}

// CHART.JS
function renderChart() {
  const ctx = document.getElementById('perfChart').getContext('2d');
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      datasets: [{
        label: 'Rooms Cleaned',
        data: [4, 5, 3, 6, 4],
        backgroundColor: '#047857'
      }]
    }
  });
}