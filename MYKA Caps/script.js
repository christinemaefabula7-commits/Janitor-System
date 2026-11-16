let currentUser = null;
let currentAdmin = null;
let janitorChartInstance = null;
let adminChartInstance = null;

let janitorsDB = [];
let assignmentsDB = [];
let attendanceDB = [];

function getTodayStr() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now - offset).toISOString().split('T')[0];
}

async function callAPI(action, payload = {}) {
  try {
    const res = await fetch(`api.php?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload })
    });
    return await res.json();
  } catch (err) {
    console.error("API Error:", err);
    alert("Server connection error. Siguraduhing naka-start ang Apache at MySQL sa XAMPP.");
    return { success: false };
  }
}

async function syncDatabase() {
  const data = await callAPI('get_all_data');
  if (data.success) {
    janitorsDB = data.janitors;
    assignmentsDB = data.assignments;
    attendanceDB = data.attendance;
  }
}

function toggleSidebar() {
  const mainApp = document.getElementById('main-app') || document.getElementById('admin-main-app');
  if (mainApp) {
    mainApp.classList.toggle('sidebar-collapsed');
  }
}

function togglePass(id, btn) {
  const input = document.getElementById(id);
  if (!input) return;
  const isPass = input.type === "password";
  input.type = isPass ? "text" : "password";
  
  btn.innerHTML = "";
  
  if (isPass) {
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
  } else {
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  }
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  
  const allForms = ['form-login', 'form-register', 'form-admin', 'form-admin-register'];
  allForms.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('active');
      el.style.display = 'none';
    }
  });

  if (tab === 'login') {
    document.getElementById('tab-btn-login')?.classList.add('active');
    const f = document.getElementById('form-login');
    if (f) { f.classList.add('active'); f.style.display = 'block'; }
  } else if (tab === 'register') {
    document.getElementById('tab-btn-register')?.classList.add('active');
    const f = document.getElementById('form-register');
    if (f) { f.classList.add('active'); f.style.display = 'block'; }
  } else if (tab === 'admin') {
    document.getElementById('tab-btn-admin')?.classList.add('active');
    const f = document.getElementById('form-admin');
    if (f) { f.classList.add('active'); f.style.display = 'block'; }
  } else if (tab === 'admin-register') {
    document.getElementById('tab-btn-admin')?.classList.add('active');
    const f = document.getElementById('form-admin-register');
    if (f) { f.classList.add('active'); f.style.display = 'block'; }
  }
}

async function handleStaffRegister(e) {
  e.preventDefault();
  const fullname = document.getElementById('reg-fullname').value.trim();
  const preferredID = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value.trim();

  const res = await callAPI('register', { fullname, username: preferredID, password });
  if (!res.success) {
    alert(res.message);
    return;
  }

  alert(`Registration Successful!\nYour Registered ID is: ${res.uniqueCode}`);
  switchTab('login');
  document.getElementById('form-register').reset();
}

async function handleStaffLogin(e) {
  e.preventDefault();
  const inputID = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  const res = await callAPI('login', { username: inputID, password });
  if (!res.success) {
    alert(res.message);
    return;
  }

  const localPic = localStorage.getItem('jams_avatar_' + res.user.unique_code) || 'slsu.logo.jpg';

  currentUser = {
    uniqueCode: res.user.unique_code,
    fullname: res.user.fullname,
    username: res.user.username,
    profile_pic: localPic,
    role: 'janitor'
  };
  await loadJanitorDashboard();
}

async function loadJanitorDashboard() {
  await syncDatabase();
  document.getElementById('auth-screen')?.classList.add('hidden');
  document.getElementById('main-app')?.classList.remove('hidden');

  const avatarContainer = document.getElementById('topbar-avatar-container');
  if (avatarContainer) avatarContainer.style.display = 'flex';

  document.getElementById('display-name').textContent = `Welcome, ${currentUser.fullname}!`;
  document.getElementById('welcome-username').textContent = currentUser.fullname;
  
  const uniqueCodeElem = document.getElementById('display-unique-code');
  if (uniqueCodeElem) uniqueCodeElem.textContent = currentUser.uniqueCode;

  const localPic = localStorage.getItem('jams_avatar_' + currentUser.uniqueCode);
  const validAvatar = (localPic && localPic.length > 50) ? localPic : 'slsu.logo.jpg';
  
  currentUser.profile_pic = validAvatar;

  const topAvatar = document.getElementById('topbar-janitor-avatar');
  const profPreview = document.getElementById('profile-preview');
  if (topAvatar) topAvatar.src = validAvatar;
  if (profPreview) profPreview.src = validAvatar;

  showSection('sec-home', document.querySelector('#janitor-menu .menu-item'));
  renderCalendar();
}

async function showSection(secId, elem) {
  await syncDatabase();
  document.querySelectorAll('.app-section').forEach(s => s.classList.add('hidden'));
  document.getElementById(secId)?.classList.remove('hidden');

  if (elem) {
    document.querySelectorAll('.sidebar-menu .menu-item, .menu-item').forEach(m => m.classList.remove('active'));
    elem.classList.add('active');
  }

  if (secId === 'sec-home' || secId === 'sec-checklist' || secId === 'sec-attendance' || secId === 'sec-profile') {
    renderJanitorView();
  }
  if (secId === 'sec-performance') {
    renderJanitorChart();
  }
  if (secId === 'sec-admin-dash') {
    renderAdminView();
  }
  if (secId === 'sec-admin-reports') {
    renderAdminReports();
  }
  if (secId === 'sec-admin-profile') {
    loadAdminProfileForm();
  }
}

// MANUAL SIGN IN
async function handleJanitorSignIn() {
  if (!currentUser) return;
  const confirmIn = confirm("Mag-Sign In (Time In) ka na ba para sa iyong duty ngayon?");
  if (!confirmIn) return;

  const res = await callAPI('sign_in', {
    uniqueCode: currentUser.uniqueCode,
    fullname: currentUser.fullname
  });

  if (res.success) {
    alert("Matagumpay kang nakapag-Sign In!");
    await syncDatabase();
    renderJanitorView();
  } else {
    alert(res.message);
  }
}

// MANUAL SIGN OUT
async function handleJanitorSignOut() {
  if (!currentUser) return;
  const confirmOut = confirm("Gusto mo na bang mag-Sign Out (Time Out) para umuwi?");
  if (!confirmOut) return;

  const res = await callAPI('sign_out', {
    uniqueCode: currentUser.uniqueCode
  });

  if (res.success) {
    alert("Matagumpay kang nakapag-Sign Out!");
    await syncDatabase();
    renderJanitorView();
  } else {
    alert(res.message);
  }
}

function renderJanitorView() {
  if (!currentUser) return;
  
  const localPic = localStorage.getItem('jams_avatar_' + currentUser.uniqueCode);
  const validAvatar = (localPic && localPic.length > 50) ? localPic : 'slsu.logo.jpg';

  const topAvatar = document.getElementById('topbar-janitor-avatar');
  const preview = document.getElementById('profile-preview');
  if (topAvatar) topAvatar.src = validAvatar;
  if (preview) preview.src = validAvatar;

  const today = getTodayStr();
  const dateLabel = document.getElementById('today-date-label');
  if (dateLabel) dateLabel.textContent = `Date: ${today}`;
  
  const panelTitle = document.getElementById('right-panel-title');
  if (panelTitle) panelTitle.textContent = "My Assigned Buildings";

  const myTodayTasks = assignmentsDB.filter(a => a.unique_code === currentUser.uniqueCode && a.assigned_date === today);
  
  const statTotal = document.getElementById('stat-total');
  const statCleaned = document.getElementById('stat-cleaned');
  const statPending = document.getElementById('stat-pending');

  if (statTotal) statTotal.textContent = myTodayTasks.length;
  if (statCleaned) statCleaned.textContent = myTodayTasks.filter(a => Number(a.cleaned) === 1).length;
  if (statPending) statPending.textContent = myTodayTasks.filter(a => Number(a.cleaned) === 0).length;

  const box = document.getElementById('checklist-box');
  const bldgList = document.getElementById('assigned-bldg-list');
  if (box) box.innerHTML = '';
  if (bldgList) bldgList.innerHTML = '';

  if (myTodayTasks.length === 0) {
    if (box) box.innerHTML = '<div class="card"><p style="color:#64748b">No rooms assigned for today yet.</p></div>';
    if (bldgList) bldgList.innerHTML = '<li style="color:#64748b">No active assignments</li>';
  } else {
    myTodayTasks.forEach(a => {
      const isDone = Number(a.cleaned) === 1;
      if (box) {
        box.innerHTML += `
          <div class="checklist-item">
            <div>
              <strong>${a.bldg} - ${a.room}</strong><br>
              <small style="color:#64748b">Schedule: ${a.schedule_time}</small>
            </div>
            <button type="button" class="btn-sm" style="background:${isDone ? '#047857' : '#d97706'}" onclick="toggleClean(${a.id})">
              ${isDone ? 'Cleaned ✓' : 'Mark Clean'}
            </button>
          </div>
        `;
      }
      if (bldgList) {
        bldgList.innerHTML += `<li>🏢 <strong>${a.bldg}</strong> (${a.room}) - ${isDone ? '✅' : '⏳'}</li>`;
      }
    });
  }

  // BUTTON STATES & STATUS BADGE
  const todayAtt = attendanceDB.find(a => a.unique_code === currentUser.uniqueCode && a.att_date === today);
  const btnSignIn = document.getElementById('btn-manual-signin');
  const btnSignOut = document.getElementById('btn-manual-signout');
  const topStatusBadge = document.getElementById('attendance-status-badge');

  if (btnSignIn && btnSignOut) {
    if (!todayAtt) {
      btnSignIn.disabled = false;
      btnSignIn.style.opacity = '1';
      btnSignIn.style.cursor = 'pointer';
      btnSignOut.disabled = true;
      btnSignOut.style.opacity = '0.5';
      btnSignOut.style.cursor = 'not-allowed';
      if (topStatusBadge) {
        topStatusBadge.textContent = 'Not Signed In Today';
        topStatusBadge.classList.add('badge-warn');
      }
    } else if (todayAtt && (!todayAtt.time_out || todayAtt.time_out === '0000-00-00 00:00:00')) {
      btnSignIn.disabled = true;
      btnSignIn.style.opacity = '0.5';
      btnSignIn.style.cursor = 'not-allowed';
      btnSignOut.disabled = false;
      btnSignOut.style.opacity = '1';
      btnSignOut.style.cursor = 'pointer';
      if (topStatusBadge) {
        topStatusBadge.textContent = 'Present (Signed In)';
        topStatusBadge.classList.remove('badge-warn');
      }
    } else {
      btnSignIn.disabled = true;
      btnSignIn.style.opacity = '0.5';
      btnSignIn.style.cursor = 'not-allowed';
      btnSignOut.disabled = true;
      btnSignOut.style.opacity = '0.5';
      btnSignOut.style.cursor = 'not-allowed';
      if (topStatusBadge) {
        topStatusBadge.textContent = 'Signed Out (Done for Today)';
        topStatusBadge.classList.add('badge-warn');
      }
    }
  }

  // ATTENDANCE TABLE
  const attBody = document.getElementById('attendance-table-body');
  if (attBody) {
    attBody.innerHTML = '';
    const myRecords = attendanceDB.filter(a => a.unique_code === currentUser.uniqueCode);
    if (myRecords.length === 0) {
      attBody.innerHTML = '<tr><td colspan="5" style="color:#64748b; text-align:center;">Wala pang attendance record. Pindutin ang "Sign In (Time In)" sa itaas.</td></tr>';
    } else {
      myRecords.forEach(a => {
        const timeoutDisplay = (a.time_out && a.time_out !== '0000-00-00 00:00:00') ? a.time_out : '<span style="color:#d97706; font-weight:600;">Active / Not Signed Out</span>';
        const logBadge = a.logs ? a.logs : 'SIGN IN';
        attBody.innerHTML += `
          <tr>
            <td>${a.att_date}</td>
            <td><span class="status-badge" style="background:#e0f2fe; color:#0369a1;">${logBadge}</span></td>
            <td>${a.time_in}</td>
            <td>${timeoutDisplay}</td>
            <td><span class="status-badge ${a.status === 'Signed Out' ? 'badge-warn' : ''}">${a.status}</span></td>
          </tr>
        `;
      });
    }
  }

  const profName = document.getElementById('prof-fullname');
  const profCode = document.getElementById('prof-unique-code');
  if (profName) profName.value = currentUser.fullname;
  if (profCode) profCode.value = currentUser.uniqueCode;
}

let tempJanitorAvatarBase64 = null;

function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    tempJanitorAvatarBase64 = e.target.result;
    const preview = document.getElementById('profile-preview');
    if (preview) preview.src = tempJanitorAvatarBase64;
  };
  reader.readAsDataURL(file);
}

async function toggleClean(taskId) {
  const res = await callAPI('toggle_clean', { id: taskId });
  if (res.success) {
    await syncDatabase();
    renderJanitorView();
  }
}

function renderJanitorChart() {
  if (!currentUser) return;
  const days = [];
  const counts = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const offset = d.getTimezoneOffset() * 60000;
    const dStr = new Date(d - offset).toISOString().split('T')[0];
    days.push(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    const cleanedCount = assignmentsDB.filter(a => a.unique_code === currentUser.uniqueCode && a.assigned_date === dStr && Number(a.cleaned) === 1).length;
    counts.push(cleanedCount);
  }

  const ctx = document.getElementById('perfChart')?.getContext('2d');
  if (!ctx) return;
  if (janitorChartInstance) janitorChartInstance.destroy();
  janitorChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [{
        label: 'Rooms Cleaned (Last 7 Days)',
        data: counts,
        backgroundColor: '#047857'
      }]
    },
    options: { scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
  });
}

async function saveProfile(e) {
  e.preventDefault();
  const newName = document.getElementById('prof-fullname').value.trim();
  const newPassword = document.getElementById('prof-password').value.trim();
  if (!newName) return;

  if (tempJanitorAvatarBase64) {
    localStorage.setItem('jams_avatar_' + currentUser.uniqueCode, tempJanitorAvatarBase64);
    currentUser.profile_pic = tempJanitorAvatarBase64;
    
    const topAvatar = document.getElementById('topbar-janitor-avatar');
    if (topAvatar) topAvatar.src = tempJanitorAvatarBase64;
  }

  const res = await callAPI('update_profile', { 
    uniqueCode: currentUser.uniqueCode, 
    fullname: newName,
    password: newPassword
  });

  if (res.success) {
    currentUser.fullname = newName;
    tempJanitorAvatarBase64 = null;
    
    const passInput = document.getElementById('prof-password');
    if (passInput) passInput.value = '';

    alert(res.message);
    await loadJanitorDashboard();
  } else {
    alert(res.message);
  }
}

function handleLogout() {
  currentUser = null;
  currentAdmin = null;
  document.getElementById('main-app')?.classList.add('hidden');
  document.getElementById('auth-screen')?.classList.remove('hidden');
  document.getElementById('janitor-menu')?.classList.remove('hidden');
  document.getElementById('admin-menu')?.classList.add('hidden');
  document.getElementById('form-login')?.reset();
}

async function handleAdminPortalRegister(e) {
  e.preventDefault();
  const fullname = document.getElementById('admin-reg-fullname').value.trim();
  const username = document.getElementById('admin-reg-username').value.trim();
  const password = document.getElementById('admin-reg-password').value.trim();

  const res = await callAPI('admin_register', { fullname, username, password });
  if (!res.success) {
    alert(res.message);
    return;
  }

  alert("Admin Account Created Successfully! You can now log in.");
  switchTab('admin');
  document.getElementById('form-admin-register').reset();
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const username = document.getElementById('admin-username').value.trim();
  const password = document.getElementById('admin-password').value.trim();

  const res = await callAPI('admin_login', { username, password });
  if (!res.success) {
    alert(res.message);
    return;
  }

  currentAdmin = res.user;
  document.getElementById('auth-screen')?.classList.add('hidden');
  document.getElementById('main-app')?.classList.remove('hidden');
  
  const avatarContainer = document.getElementById('topbar-avatar-container');
  if (avatarContainer) avatarContainer.style.display = 'none';

  document.getElementById('janitor-menu')?.classList.add('hidden');
  document.getElementById('admin-menu')?.classList.remove('hidden');
  document.getElementById('user-role-badge').textContent = "Admin Leader Portal";

  const adminNameElem = document.getElementById('display-name');
  if (adminNameElem) adminNameElem.textContent = `Welcome, ${currentAdmin.fullname}!`;

  showSection('sec-admin-dash', document.querySelector('#admin-menu .menu-item'));
  await loadAdminDashboard();
}

function loadAdminProfileForm() {
  if (!currentAdmin) return;
  
  const nameInput = document.getElementById('admin-prof-fullname');
  const userInput = document.getElementById('admin-prof-username');
  const passInput = document.getElementById('admin-prof-password');
  
  if (nameInput) nameInput.value = currentAdmin.fullname || '';
  if (userInput) userInput.value = currentAdmin.username || '';
  if (passInput) passInput.value = '';
}

async function saveAdminProfile(e) {
  e.preventDefault();
  if (!currentAdmin) return;

  const fullname = document.getElementById('admin-prof-fullname').value.trim();
  const username = document.getElementById('admin-prof-username').value.trim();
  const password = document.getElementById('admin-prof-password').value.trim();

  const res = await callAPI('update_admin_profile', {
    id: currentAdmin.id !== undefined ? currentAdmin.id : 0,
    fullname,
    username,
    password
  });

  if (res.success) {
    currentAdmin = { ...currentAdmin, ...res.user };
    
    const displayName = document.getElementById('display-name');
    if (displayName) displayName.textContent = `Welcome, ${currentAdmin.fullname}!`;

    loadAdminProfileForm();
    alert(res.message);
  } else {
    alert(res.message);
  }
}

async function loadAdminDashboard() {
  await syncDatabase();
  renderAdminView();
  renderAdminReports();
}

async function assignRoom(e) {
  e.preventDefault();
  const selectElem = document.getElementById('admin-select-janitor');
  const uniqueCode = selectElem ? selectElem.value : '';
  
  if (!uniqueCode) {
    alert("Mangyaring pumili ng nakarehistrong staff.");
    return;
  }

  const bldg = document.getElementById('assign-bldg').value.trim();
  const room = document.getElementById('assign-room').value.trim();
  const time = document.getElementById('assign-time').value.trim();

  const res = await callAPI('assign_room', { uniqueCode, bldg, room, time });
  if (res.success) {
    alert(res.message);
    document.getElementById('assign-bldg').value = '';
    document.getElementById('assign-room').value = '';
    document.getElementById('assign-time').value = '';
    await syncDatabase();
    renderAdminView();
  } else {
    alert(res.message);
  }
}

function renderAdminView() {
  const today = getTodayStr();
  const presentToday = attendanceDB.filter(a => a.att_date === today);
  const todayTasks = assignmentsDB.filter(a => a.assigned_date === today);
  const completedToday = todayTasks.filter(a => Number(a.cleaned) === 1);

  const statJanitors = document.getElementById('admin-stat-janitors');
  const statPresent = document.getElementById('admin-stat-present');
  const statTasks = document.getElementById('admin-stat-tasks');

  if (statJanitors) statJanitors.textContent = janitorsDB.length;
  if (statPresent) statPresent.textContent = presentToday.length;
  if (statTasks) statTasks.textContent = `${completedToday.length} / ${todayTasks.length}`;

  const select = document.getElementById('admin-select-janitor');
  const list = document.getElementById('janitor-list-view');
  const previousSelected = select ? select.value : '';

  if (select) select.innerHTML = '';
  if (list) list.innerHTML = '';

  if (janitorsDB.length === 0) {
    if (select) select.innerHTML = '<option value="">-- No Registered Janitors --</option>';
    if (list) list.innerHTML = '<li style="color:#64748b">No janitors registered yet.</li>';
  } else {
    janitorsDB.forEach(j => {
      if (select) {
        const opt = document.createElement('option');
        opt.value = j.unique_code;
        opt.textContent = `${j.fullname} (${j.unique_code})`;
        select.appendChild(opt);
      }
      const todayAtt = presentToday.find(a => a.unique_code === j.unique_code);
      const jTasks = todayTasks.filter(a => a.unique_code === j.unique_code);
      const jDone = jTasks.filter(a => Number(a.cleaned) === 1).length;

      let statusLabel = 'Not Signed In';
      let badgeClass = 'badge-warn';
      if (todayAtt) {
        if (todayAtt.time_out && todayAtt.time_out !== '0000-00-00 00:00:00') {
          statusLabel = 'Signed Out';
          badgeClass = 'badge-warn';
        } else {
          statusLabel = 'Present';
          badgeClass = '';
        }
      }

      if (list) {
        list.innerHTML += `
          <li>
            <div>
              <strong>${j.fullname}</strong> <small style="color:#64748b">(${j.unique_code})</small><br>
              <small>Progress: <strong>${jDone}/${jTasks.length}</strong> rooms</small>
            </div>
            <span class="status-badge ${badgeClass}">${statusLabel}</span>
          </li>
        `;
      }
    });

    if (previousSelected && select) {
      select.value = previousSelected;
    }
  }

  // ADMIN ATTENDANCE LOG TABLE
  const attBody = document.getElementById('admin-attendance-body');
  if (attBody) {
    attBody.innerHTML = '';
    attendanceDB.forEach(a => {
      const timeoutDisplay = (a.time_out && a.time_out !== '0000-00-00 00:00:00') ? a.time_out : '<span style="color:#d97706; font-weight:600;">Active / Not Signed Out</span>';
      const logBadge = a.logs ? a.logs : 'SIGN IN';
      attBody.innerHTML += `
        <tr>
          <td>${a.fullname} (${a.unique_code})</td>
          <td>${a.att_date}</td>
          <td><span class="status-badge" style="background:#e0f2fe; color:#0369a1;">${logBadge}</span></td>
          <td>${a.time_in}</td>
          <td>${timeoutDisplay}</td>
          <td><span class="status-badge ${a.status === 'Signed Out' ? 'badge-warn' : ''}">${a.status}</span></td>
        </tr>
      `;
    });
  }
}

function renderAdminReports() {
  const periodElem = document.getElementById('report-period');
  if (!periodElem) return;
  const period = periodElem.value;
  const today = new Date();
  const todayStr = getTodayStr();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);
  const weekStartStr = sevenDaysAgo.toISOString().split('T')[0];

  const chartTitle = document.getElementById('admin-chart-title');
  if (chartTitle) {
    chartTitle.textContent = period === 'daily' ? `Daily Performance Report (${todayStr})` : `Weekly Report (${weekStartStr} to ${todayStr})`;
  }

  const tbody = document.getElementById('admin-report-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const labels = [];
  const assignedData = [];
  const cleanedData = [];

  janitorsDB.forEach(j => {
    const filteredTasks = assignmentsDB.filter(a => {
      if (a.unique_code !== j.unique_code) return false;
      return period === 'daily' ? a.assigned_date === todayStr : (a.assigned_date >= weekStartStr && a.assigned_date <= todayStr);
    });

    const filteredAttendance = attendanceDB.filter(a => {
      if (a.unique_code !== j.unique_code) return false;
      return period === 'daily' ? a.att_date === todayStr : (a.att_date >= weekStartStr && a.att_date <= todayStr);
    });

    const total = filteredTasks.length;
    const cleaned = filteredTasks.filter(a => Number(a.cleaned) === 1).length;
    const rate = total > 0 ? Math.round((cleaned / total) * 100) : 0;

    let rating = 'No Tasks';
    if (total > 0) {
      if (rate === 100) rating = '⭐ Excellent';
      else if (rate >= 75) rating = '✅ Good';
      else rating = '⚠️ Needs Follow-up';
    }

    labels.push(j.fullname);
    assignedData.push(total);
    cleanedData.push(cleaned);

    tbody.innerHTML += `
      <tr>
        <td><strong>${j.fullname}</strong><br><small style="color:#64748b">${j.unique_code}</small></td>
        <td>${filteredAttendance.length} day(s)</td>
        <td>${total}</td>
        <td>${cleaned}</td>
        <td>
          <strong>${rate}%</strong>
          <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${rate}%"></div></div>
        </td>
        <td>${rating}</td>
      </tr>
    `;
  });

  const ctx = document.getElementById('adminPerfChart')?.getContext('2d');
  if (!ctx) return;
  if (adminChartInstance) adminChartInstance.destroy();
  adminChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.length ? labels : ['No Staff'],
      datasets: [
        { label: 'Assigned Rooms', data: assignedData, backgroundColor: '#94a3b8' },
        { label: 'Cleaned Rooms', data: cleanedData, backgroundColor: '#047857' }
      ]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
  });
}

setInterval(() => {
  const clockElem = document.getElementById('live-clock');
  if (clockElem) clockElem.textContent = new Date().toLocaleTimeString();
}, 1000);

function renderCalendar() {
  const calendarYear = document.getElementById('calendar-month-year');
  if (!calendarYear) return;
  const now = new Date();
  calendarYear.textContent = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const grid = document.getElementById('calendar-days');
  if (!grid) return;
  grid.innerHTML = '';

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    grid.innerHTML += `<div class="calendar-day ${i === now.getDate() ? 'today' : ''}">${i}</div>`;
  }
}

function handleLogoFallback(img) {
  img.onerror = null;
  const svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="58" fill="#064e3b" stroke="#facc15" stroke-width="4"/>
    <circle cx="60" cy="60" r="46" fill="#047857"/>
    <text x="60" y="55" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#ffffff" text-anchor="middle">SLSU</text>
    <text x="60" y="75" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#fde047" text-anchor="middle">LUCENA</text>
  </svg>`;
  img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgLogo);
}

setInterval(async () => {
  if (currentUser) {
    await syncDatabase();
    renderJanitorView();
  }
  if (currentAdmin) {
    await syncDatabase();
    renderAdminView();
    if (!document.getElementById('sec-admin-reports')?.classList.contains('hidden')) {
      renderAdminReports();
    }
  }
}, 5000);