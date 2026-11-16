<?php
session_start();
require_once 'db.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SLSU Lucena - Admin Portal</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
</head>
<body class="portal-body">

  <!-- ADMIN WELCOME SCREEN HERO LAYOUT -->
  <div id="admin-auth-screen" class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo-circle">
          <img src="slsu.logo.jpg" alt="SLSU Lucena Logo" class="brand-logo" onerror="handleLogoFallback(this)">
        </div>
        <h2>SLSU LUCENA CAMPUS</h2>
        <p>Janitor Attendance & Monitoring System (Admin Portal)</p>
      </div>

      <div class="auth-tabs">
        <button type="button" class="tab-btn active" onclick="switchAdminTab('login')">Admin Login</button>
        <button type="button" class="tab-btn" onclick="switchAdminTab('register')">Create Admin</button>
      </div>

      <!-- Admin Login Form -->
      <form id="form-admin-login" class="auth-form active" onsubmit="handleAdminPortalLogin(event)">
        <h3>Admin Secure Login</h3>
        <div class="input-group">
          <label>Admin Username</label>
          <input type="text" id="admin-login-username" placeholder="Enter admin username" autocomplete="off" required>
        </div>
        <div class="input-group">
          <label>Password</label>
          <div class="password-box">
            <input type="password" id="admin-login-password" placeholder="Enter admin password" autocomplete="new-password" required>
            <span class="eye-btn" onclick="togglePass('admin-login-password', this)">👁️</span>
          </div>
        </div>
        <button type="submit" class="btn btn-purple">LOGIN TO ADMIN DASHBOARD ➔</button>
      </form>

      <!-- Admin Registration Form -->
      <form id="form-admin-register" class="auth-form" onsubmit="handleAdminPortalRegister(event)">
        <h3>Register New Admin / Leader</h3>
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
            <span class="eye-btn" onclick="togglePass('admin-reg-password', this)">👁️</span>
          </div>
        </div>
        <button type="submit" class="btn btn-primary">REGISTER NEW ADMIN ➔</button>
      </form>

      <div class="auth-footer">
        <a href="index.php" style="color:var(--primary-green); text-decoration:none; font-weight:600;">← Back to Janitor Portal</a>
      </div>
    </div>
  </div>

  <!-- ADMIN MAIN DASHBOARD SCREEN -->
  <div id="admin-main-app" class="app-layout hidden">
    <aside class="sidebar" id="app-sidebar">
      <div class="sidebar-brand">
        <div class="logo-circle-sm">
          <img src="slsu.logo.jpg" alt="SLSU Logo" class="mini-logo" onerror="handleLogoFallback(this)">
        </div>
        <div>
          <h4>SLSU LUCENA</h4>
          <small>Admin Leader Portal</small>
        </div>
      </div>

      <nav class="sidebar-menu">
        <a href="#" class="menu-item active" onclick="showAdminSection('sec-admin-dash', this)"><span>⚙️</span> Dashboard & Assign</a>
        <a href="#" class="menu-item" onclick="showAdminSection('sec-admin-reports', this)"><span>📈</span> Performance Reports</a>
        <a href="#" class="menu-item" onclick="showAdminSection('sec-admin-logs', this)"><span>📑</span> Attendance Logs</a>
      </nav>

      <div class="sidebar-bottom">
        <button type="button" class="logout-btn" onclick="handleAdminLogout()"><span>🚪</span> Log Out</button>
      </div>
    </aside>

    <main class="content-area">
      <header class="topbar">
        <div class="topbar-left">
          <button type="button" class="mobile-menu-btn" onclick="toggleSidebar()">☰</button>
          <div class="logo-circle-sm topbar-logo">
            <img src="slsu.logo.jpg" alt="SLSU Logo" class="mini-logo" onerror="handleLogoFallback(this)">
          </div>
          <div class="user-greeting">
            <h3 id="admin-display-name">Admin Welcome!</h3>
            <span class="status-badge">System Administrator</span>
          </div>
        </div>
        <div class="live-clock" id="live-clock">00:00:00 AM</div>
      </header>

      <div class="dashboard-body">
        <div class="main-column">
          <section id="sec-admin-dash" class="app-section">
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
                  <tr><th>Staff Name (Code)</th><th>Date</th><th>Time In</th><th>Status</th></tr>
                </thead>
                <tbody id="admin-attendance-body"></tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>

  <script src="script.js"></script>
</body>
</html>