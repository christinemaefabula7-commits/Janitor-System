<?php
session_start();
require_once 'db.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SLSU Lucena Campus - JAMS</title>
  <link rel="stylesheet" href="style.css?v=24">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
</head>
<body>

  <!-- AUTH PORTAL -->
  <div id="auth-screen" class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo-circle">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 120 120" class="brand-logo">
            <circle cx="60" cy="60" r="58" fill="#064e3b" stroke="#facc15" stroke-width="4"/>
            <circle cx="60" cy="60" r="46" fill="#047857"/>
            <text x="60" y="53" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">SLSU</text>
            <text x="60" y="73" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#fde047" text-anchor="middle">LUCENA</text>
          </svg>
        </div>
        <h2>SLSU LUCENA CAMPUS</h2>
        <p>Janitor Attendance & Performance Management System (JAMS)</p>
      </div>

      <div class="auth-tabs">
        <button type="button" id="tab-btn-login" class="tab-btn active" onclick="switchTab('login')">Staff Login</button>
        <button type="button" id="tab-btn-register" class="tab-btn" onclick="switchTab('register')">Register Staff</button>
        <button type="button" id="tab-btn-admin" class="tab-btn" onclick="switchTab('admin')">Admin Login</button>
      </div>

      <!-- Staff Login -->
      <form id="form-login" class="auth-form active" style="display: block;" onsubmit="handleStaffLogin(event)">
        <h3>Janitor Portal Login</h3>
        <div class="input-group">
          <label>Username / Preferred ID (e.g. janitor-edna01)</label>
          <input type="text" id="login-username" placeholder="e.g. janitor-edna01" autocomplete="off" required>
        </div>
        <div class="input-group">
          <label>Password</label>
          <div class="password-box">
            <input type="password" id="login-password" placeholder="Enter your password" autocomplete="new-password" required>
            <span class="eye-btn" onclick="togglePass('login-password', this)">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </span>
          </div>
        </div>
        <button type="submit" class="btn btn-primary">SIGN IN TO PORTAL ➔</button>
      </form>

      <!-- Staff Registration -->
      <form id="form-register" class="auth-form" style="display: none;" onsubmit="handleStaffRegister(event)">
        <h3>Janitor Account Registration</h3>
        <div class="input-group">
          <label>Full Name</label>
          <input type="text" id="reg-fullname" placeholder="e.g. Edna Cruz" autocomplete="off" required>
        </div>
        <div class="input-group">
          <label>Preferred ID / Username</label>
          <input type="text" id="reg-username" placeholder="e.g. janitor-edna01" autocomplete="off" required>
        </div>
        <div class="input-group">
          <label>Password</label>
          <div class="password-box">
            <input type="password" id="reg-password" placeholder="Create a password" autocomplete="new-password" required>
            <span class="eye-btn" onclick="togglePass('reg-password', this)">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </span>
          </div>
        </div>
        <button type="submit" class="btn btn-primary">REGISTER ACCOUNT ➔</button>
      </form>

      <!-- Leader/Admin Login -->
      <form id="form-admin" class="auth-form" style="display: none;" onsubmit="handleAdminLogin(event)">
        <h3>Leader / Admin Access</h3>
        <div class="input-group">
          <label>Admin Username</label>
          <input type="text" id="admin-username" placeholder="e.g. admin" autocomplete="off" required>
        </div>
        <div class="input-group">
          <label>Admin Password</label>
          <div class="password-box">
            <input type="password" id="admin-password" placeholder="Enter admin password" autocomplete="new-password" required>
            <span class="eye-btn" onclick="togglePass('admin-password', this)">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </span>
          </div>
        </div>
        <button type="submit" class="btn btn-purple">ACCESS ADMIN DASHBOARD ➔</button>

        <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="font-size: 13px; color: #64748b; margin-bottom: 8px;">Wala pang Administrator account?</p>
          <button type="button" onclick="switchTab('admin-register')" style="width: 100%; padding: 10px; background: #f3e8ff; color: #581c87; border: 1px solid #d8b4fe; border-radius: 8px; font-weight: bold; cursor: pointer;">
            + Create Administrator Form
          </button>
        </div>
      </form>

      <!-- Create Administrator Form -->
      <form id="form-admin-register" class="auth-form" style="display: none;" onsubmit="handleAdminPortalRegister(event)">
        <h3>Create Administrator Account</h3>
        <div class="input-group">
          <label>Full Name</label>
          <input type="text" id="admin-reg-fullname" placeholder="e.g. Juan Dela Cruz" autocomplete="off" required>
        </div>
        <div class="input-group">
          <label>Admin Username</label>
          <input type="text" id="admin-reg-username" placeholder="Choose admin username" autocomplete="off" required>
        </div>
        <div class="input-group">
          <label>Password</label>
          <div class="password-box">
            <input type="password" id="admin-reg-password" placeholder="Create strong password" autocomplete="new-password" required>
            <span class="eye-btn" onclick="togglePass('admin-reg-password', this)">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </span>
          </div>
        </div>
        <button type="submit" class="btn btn-primary">REGISTER NEW ADMIN ➔</button>
        <div style="text-align: center; margin-top: 14px;">
          <a href="#" onclick="switchTab('admin'); return false;" style="color: var(--accent-purple); text-decoration: none; font-size: 13px; font-weight: 600;">
            ← Back to Admin Login
          </a>
        </div>
      </form>

      <div class="auth-footer">
        SLSU Lucena Campus © JAMS Security
      </div>
    </div>
  </div>

  <!-- MAIN APP SCREEN -->
  <div id="main-app" class="app-layout hidden">
    <aside class="sidebar" id="app-sidebar">
      <div class="sidebar-brand">
        <div class="logo-circle-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 120 120" class="mini-logo">
            <circle cx="60" cy="60" r="58" fill="#064e3b" stroke="#facc15" stroke-width="4"/>
            <circle cx="60" cy="60" r="46" fill="#047857"/>
            <text x="60" y="53" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">SLSU</text>
            <text x="60" y="73" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#fde047" text-anchor="middle">LUCENA</text>
          </svg>
        </div>
        <div>
          <h4>SLSU LUCENA</h4>
          <small id="user-role-badge">Janitor Portal</small>
        </div>
      </div>

      <nav class="sidebar-menu" id="janitor-menu">
        <a href="#" class="menu-item active" onclick="showSection('sec-home', this)"><span>🏠</span> Home</a>
        <a href="#" class="menu-item" onclick="showSection('sec-checklist', this)"><span>📋</span> Room Checklist</a>
        <a href="#" class="menu-item" onclick="showSection('sec-attendance', this)"><span>📅</span> My Attendance</a>
        <a href="#" class="menu-item" onclick="showSection('sec-performance', this)"><span>📊</span> My Performance</a>
        <a href="#" class="menu-item" onclick="showSection('sec-profile', this)"><span>👤</span> My Profile</a>
      </nav>

      <nav class="sidebar-menu hidden" id="admin-menu">
        <a href="#" class="menu-item active" onclick="showSection('sec-admin-dash', this)"><span>⚙️</span> Dashboard & Assign</a>
        <a href="#" class="menu-item" onclick="showSection('sec-admin-reports', this)"><span>📈</span> Performance Reports</a>
        <a href="#" class="menu-item" onclick="showSection('sec-admin-logs', this)"><span>📑</span> Attendance Logs</a>
        <a href="#" class="menu-item" onclick="showSection('sec-admin-profile', this)"><span>👤</span> Admin Profile</a>
      </nav>

      <div class="sidebar-bottom">
        <button type="button" class="logout-btn" onclick="handleLogout()"><span>🚪</span> Log Out</button>
      </div>
    </aside>

    <main class="content-area">
      <header class="topbar">
        <div class="topbar-left" style="display: flex; align-items: center; gap: 12px;">
          <button type="button" class="sidebar-toggle-btn" onclick="toggleSidebar()" title="Toggle Sidebar">☰</button>
          <div class="logo-circle-sm topbar-logo" id="topbar-avatar-container">
            <!-- Kapag may custom avatar ang janitor, yun ang ipapakita; kung wala, SVG fallback ang gagamitin -->
            <img id="topbar-janitor-avatar" src="slsu.logo.jpg" alt="Avatar" class="mini-logo" onerror="handleLogoFallback(this)">
          </div>
          <div class="user-greeting">
            <h3 id="display-name" style="margin: 0;">Welcome!</h3>
            <span class="status-badge" id="attendance-status-badge">SLSU Lucena Active</span>
          </div>
        </div>
        <div class="live-clock" id="live-clock">00:00:00 AM</div>
      </header>

      <div class="dashboard-body">
        <div class="main-column">
          <!-- HOME SECTION -->
          <section id="sec-home" class="app-section">
            <div class="welcome-card">
              <h2>Good day, <span id="welcome-username">Staff</span>! 👋</h2>
              <p>SLSU Lucena Staff ID: <strong id="display-unique-code" style="color:var(--primary-green)">---</strong></p>
            </div>
            <div class="stats-grid">
              <div class="stat-card">
                <h4>Assigned Rooms (Today)</h4>
                <div class="stat-num" id="stat-total">0</div>
              </div>
              <div class="stat-card">
                <h4>Cleaned Rooms</h4>
                <div class="stat-num green-text" id="stat-cleaned">0</div>
              </div>
              <div class="stat-card">
                <h4>Pending Rooms</h4>
                <div class="stat-num orange-text" id="stat-pending">0</div>
              </div>
            </div>
          </section>

          <!-- CHECKLIST SECTION -->
          <section id="sec-checklist" class="app-section hidden">
            <div class="section-header-flex">
              <h3>My Room Assignments & Checklist</h3>
              <span class="date-pill" id="today-date-label"></span>
            </div>
            <div class="checklist-container" id="checklist-box"></div>
          </section>

          <!-- ATTENDANCE SECTION -->
          <section id="sec-attendance" class="app-section hidden">
            <div class="section-header-flex">
              <h3>My Attendance Log</h3>
              <div style="display: flex; gap: 10px;">
                <button type="button" id="btn-signin" class="btn-sm" style="background: var(--primary-green); padding: 8px 16px; font-weight: bold;" onclick="handleJanitorSignIn()">
                  ✅ Sign In (Time In)
                </button>
                <button type="button" id="btn-signout" class="btn-sm" style="background: #dc2626; padding: 8px 16px; font-weight: bold;" onclick="handleJanitorSignOut()">
                  🚪 Sign Out (Time Out)
                </button>
              </div>
            </div>
            <div class="table-card">
              <table>
                <thead>
                  <tr><th>Date</th><th>Log</th><th>Time In</th><th>Time Out</th><th>Status</th></tr>
                </thead>
                <tbody id="attendance-table-body"></tbody>
              </table>
            </div>
          </section>

          <!-- PERFORMANCE REPORT SECTION -->
          <section id="sec-performance" class="app-section hidden">
            <h3>My Weekly Cleaning Performance</h3>
            <div class="chart-card">
              <canvas id="perfChart"></canvas>
            </div>
          </section>

          <!-- PROFILE SECTION -->
          <section id="sec-profile" class="app-section hidden">
            <h3>My Profile</h3>
            <div class="profile-card">
              <div class="profile-img-container">
                <img id="profile-preview" src="slsu.logo.jpg" alt="Profile" onerror="handleLogoFallback(this)">
                <input type="file" id="profile-upload" accept="image/*" onchange="previewImage(event)" style="display:none">
                <button type="button" class="btn-sm" onclick="document.getElementById('profile-upload').click()">Change Photo</button>
              </div>
              <form class="profile-form" onsubmit="saveProfile(event)">
                <div class="input-group">
                  <label>Full Name</label>
                  <input type="text" id="prof-fullname" required>
                </div>
                <div class="input-group">
                  <label>Preferred ID / Unique Code</label>
                  <input type="text" id="prof-unique-code" readonly style="background:#f1f5f9;">
                </div>
                <div class="input-group">
                  <label>New Password <small style="color:#64748b; font-weight:normal;">(I-leave blank kung hindi mo papalitan)</small></label>
                  <div class="password-box">
                    <input type="password" id="prof-password" placeholder="Ilagay ang bagong password" autocomplete="new-password">
                    <span class="eye-btn" onclick="togglePass('prof-password', this)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </span>
                  </div>
                </div>
                <button type="submit" class="btn btn-primary">Save Profile</button>
              </form>
            </div>
          </section>

          <!-- ADMIN DASHBOARD SECTIONS -->
          <section id="sec-admin-dash" class="app-section hidden">
            <div class="stats-grid">
              <div class="stat-card">
                <h4>Registered Janitors</h4>
                <div class="stat-num" id="admin-stat-janitors">0</div>
              </div>
              <div class="stat-card">
                <h4>Present Today</h4>
                <div class="stat-num green-text" id="admin-stat-present">0</div>
              </div>
              <div class="stat-card">
                <h4>Tasks Completed Today</h4>
                <div class="stat-num purple-text" id="admin-stat-tasks">0 / 0</div>
              </div>
            </div>

            <div class="admin-grid">
              <div class="card">
                <h4>Assign Room to Janitor</h4>
                <form onsubmit="assignRoom(event)">
                  <div class="input-group">
                    <label>Select Registered Staff</label>
                    <select id="admin-select-janitor" required></select>
                  </div>
                  <div class="input-group">
                    <label>Building Name</label>
                    <input type="text" id="assign-bldg" placeholder="e.g. Administration Building" required>
                  </div>
                  <div class="input-group">
                    <label>Room Name / No.</label>
                    <input type="text" id="assign-room" placeholder="e.g. Room 101" required>
                  </div>
                  <div class="input-group">
                    <label>Schedule Time</label>
                    <input type="text" id="assign-time" placeholder="e.g. 8:00 AM - 10:00 AM" required>
                  </div>
                  <button type="submit" class="btn btn-purple">Assign Task</button>
                </form>
              </div>

              <div class="card">
                <h4>Registered Janitors & Today's Status</h4>
                <ul id="janitor-list-view" class="janitor-list"></ul>
              </div>
            </div>
          </section>

          <section id="sec-admin-reports" class="app-section hidden">
            <div class="section-header-flex">
              <h3>Janitor Performance Monitoring Report</h3>
              <div class="filter-controls">
                <select id="report-period" onchange="renderAdminReports()">
                  <option value="daily">Daily Report (Today)</option>
                  <option value="weekly">Weekly Report (Last 7 Days)</option>
                </select>
                <button type="button" class="btn-sm btn-purple" onclick="window.print()">🖨️ Print Report</button>
              </div>
            </div>

            <div class="chart-card">
              <h4 id="admin-chart-title" style="margin-bottom:12px;">Daily Task Completion Overview</h4>
              <canvas id="adminPerfChart" height="100"></canvas>
            </div>

            <div class="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Janitor Name (ID)</th>
                    <th>Days Present</th>
                    <th>Assigned Rooms</th>
                    <th>Cleaned Rooms</th>
                    <th>Completion Rate</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody id="admin-report-table-body"></tbody>
              </table>
            </div>
          </section>

          <section id="sec-admin-logs" class="app-section hidden">
            <h3>Staff Attendance Records</h3>
            <div class="table-card">
              <table>
                <thead>
                  <tr><th>Staff Name (Code)</th><th>Date</th><th>Log</th><th>Time In</th><th>Time Out</th><th>Status</th></tr>
                </thead>
                <tbody id="admin-attendance-body"></tbody>
              </table>
            </div>
          </section>

          <!-- ADMIN PROFILE SECTION -->
          <section id="sec-admin-profile" class="app-section hidden">
            <div class="section-header-flex">
              <h3>Administrator Account Settings</h3>
            </div>
            <div class="card" style="max-width: 600px; margin: 0 auto;">
              <h4 style="margin-bottom: 16px;">Edit Admin Information</h4>
              <form class="profile-form" onsubmit="saveAdminProfile(event)">
                <div class="input-group">
                  <label>Administrator Full Name</label>
                  <input type="text" id="admin-prof-fullname" placeholder="Enter your full name" required>
                </div>
                <div class="input-group">
                  <label>Admin Username</label>
                  <input type="text" id="admin-prof-username" placeholder="Enter username" required>
                </div>
                <div class="input-group">
                  <label>New Password <small style="color:#64748b; font-weight:normal;">(Leave blank if you don't want to change)</small></label>
                  <div class="password-box">
                    <input type="password" id="admin-prof-password" placeholder="Enter new password" autocomplete="new-password">
                    <span class="eye-btn" onclick="togglePass('admin-prof-password', this)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </span>
                  </div>
                </div>
                <button type="submit" class="btn btn-purple" style="margin-top: 10px;">Save Admin Changes ✓</button>
              </form>
            </div>
          </section>

        </div>

        <aside class="right-sidebar">
          <div class="mini-calendar-card">
            <h4 id="calendar-month-year">Month Year</h4>
            <div class="calendar-grid" id="calendar-days"></div>
          </div>
          <div class="quick-assigned-card">
            <h4 id="right-panel-title">Assigned Buildings</h4>
            <ul id="assigned-bldg-list" class="clean-list"></ul>
          </div>
        </aside>
      </div>
    </main>
  </div>

  <script src="script.js?v=24"></script>
</body>
</html>