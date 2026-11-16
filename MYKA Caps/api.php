<?php
header("Content-Type: application/json");
require_once 'db.php';

$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? ($input['action'] ?? '');

// GET ALL DATA FOR FRONTEND SYNC
if ($action === 'get_all_data') {
    try {
        $janitors = $pdo->query("SELECT id, fullname, username, unique_code FROM janitors ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);
        $assignments = $pdo->query("SELECT * FROM assignments ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);
        $attendance = $pdo->query("SELECT * FROM attendance ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "janitors" => $janitors,
            "assignments" => $assignments,
            "attendance" => $attendance
        ]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

// JANITOR LOGIN
if ($action === 'login') {
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');

    $stmt = $pdo->prepare("SELECT * FROM janitors WHERE username = ? OR unique_code = ?");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        echo json_encode(["success" => true, "user" => $user]);
    } else {
        echo json_encode(["success" => false, "message" => "Maling username o password."]);
    }
    exit;
}

// JANITOR REGISTER
if ($action === 'register') {
    $fullname = trim($input['fullname'] ?? '');
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');

    if (!$fullname || !$username || !$password) {
        echo json_encode(["success" => false, "message" => "Lahat ng fields ay kinakailangan."]);
        exit;
    }

    $chk = $pdo->prepare("SELECT id FROM janitors WHERE username = ?");
    $chk->execute([$username]);
    if ($chk->fetch()) {
        echo json_encode(["success" => false, "message" => "Ang username o ID na ito ay nagagamit na."]);
        exit;
    }

    $uniqueCode = 'JMS-' . strtoupper(substr(md5(uniqid()), 0, 6));
    $hashed = password_hash($password, PASSWORD_DEFAULT);

    $ins = $pdo->prepare("INSERT INTO janitors (fullname, username, password, unique_code) VALUES (?, ?, ?, ?)");
    if ($ins->execute([$fullname, $username, $hashed, $uniqueCode])) {
        echo json_encode(["success" => true, "uniqueCode" => $uniqueCode]);
    } else {
        echo json_encode(["success" => false, "message" => "Nabigo ang pag-rehistro."]);
    }
    exit;
}

// MANUAL SIGN IN (TIME IN)
if ($action === 'sign_in') {
    $uniqueCode = trim($input['uniqueCode'] ?? '');
    $fullname = trim($input['fullname'] ?? '');
    $today = date("Y-m-d");

    if (!$uniqueCode) {
        echo json_encode(["success" => false, "message" => "Missing staff details."]);
        exit;
    }

    $chk = $pdo->prepare("SELECT * FROM attendance WHERE unique_code = ? AND att_date = ?");
    $chk->execute([$uniqueCode, $today]);
    $existing = $chk->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        if (empty($existing['time_out']) || $existing['time_out'] === '0000-00-00 00:00:00') {
            echo json_encode(["success" => false, "message" => "Nakapag-Sign In ka na at aktibo pa ang iyong duty."]);
            exit;
        } else {
            echo json_encode(["success" => false, "message" => "Tapos ka na mag-duty ngayong araw."]);
            exit;
        }
    }

    $ins = $pdo->prepare("INSERT INTO attendance (unique_code, fullname, att_date, time_in, logs, status) VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'SIGN IN', 'Present')");
    if ($ins->execute([$uniqueCode, $fullname, $today])) {
        echo json_encode(["success" => true, "message" => "Signed In successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Nabigo ang pag-sign in."]);
    }
    exit;
}

// MANUAL SIGN OUT (TIME OUT)
if ($action === 'sign_out') {
    $uniqueCode = trim($input['uniqueCode'] ?? '');
    $today = date("Y-m-d");

    if (!$uniqueCode) {
        echo json_encode(["success" => false, "message" => "Missing staff details."]);
        exit;
    }

    $chk = $pdo->prepare("SELECT * FROM attendance WHERE unique_code = ? AND att_date = ?");
    $chk->execute([$uniqueCode, $today]);
    $att = $chk->fetch(PDO::FETCH_ASSOC);

    if (!$att) {
        echo json_encode(["success" => false, "message" => "Mag-Sign In ka muna bago mag-Sign Out."]);
        exit;
    }

    if (!empty($att['time_out']) && $att['time_out'] !== '0000-00-00 00:00:00') {
        echo json_encode(["success" => false, "message" => "Nakapag-Sign Out ka na ngayong araw."]);
        exit;
    }

    $upd = $pdo->prepare("UPDATE attendance SET time_out = CURRENT_TIMESTAMP, status = 'Signed Out' WHERE unique_code = ? AND att_date = ?");
    if ($upd->execute([$uniqueCode, $today])) {
        echo json_encode(["success" => true, "message" => "Signed Out successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Nabigo ang pag-sign out."]);
    }
    exit;
}

// TOGGLE CLEAN TASK
if ($action === 'toggle_clean') {
    $id = intval($input['id'] ?? 0);
    $chk = $pdo->prepare("SELECT cleaned FROM assignments WHERE id = ?");
    $chk->execute([$id]);
    $row = $chk->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        $newVal = $row['cleaned'] == 1 ? 0 : 1;
        $upd = $pdo->prepare("UPDATE assignments SET cleaned = ? WHERE id = ?");
        $upd->execute([$newVal, $id]);
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Task not found."]);
    }
    exit;
}

// ASSIGN ROOM
if ($action === 'assign_room') {
    $uniqueCode = trim($input['uniqueCode'] ?? '');
    $bldg = trim($input['bldg'] ?? '');
    $room = trim($input['room'] ?? '');
    $time = trim($input['time'] ?? '');
    $today = date("Y-m-d");

    if (!$uniqueCode || !$bldg || !$room) {
        echo json_encode(["success" => false, "message" => "Lagyan ang lahat ng kinakailangang fields."]);
        exit;
    }

    $ins = $pdo->prepare("INSERT INTO assignments (unique_code, bldg, room, schedule_time, assigned_date, cleaned) VALUES (?, ?, ?, ?, ?, 0)");
    if ($ins->execute([$uniqueCode, $bldg, $room, $time, $today])) {
        echo json_encode(["success" => true, "message" => "Room assigned successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Nabigo ang pag-assign."]);
    }
    exit;
}

// UPDATE PROFILE (FIXED NA PARA GUMANA SA UNIQUE CODE AT PASSWORD)
if ($action === 'update_profile') {
    $uniqueCode = trim($input['uniqueCode'] ?? '');
    $fullname = trim($input['fullname'] ?? '');
    $password = trim($input['password'] ?? '');

    if (!$uniqueCode || !$fullname) {
        echo json_encode(["success" => false, "message" => "Kailangan ang pangalan at ID."]);
        exit;
    }

    try {
        if (!empty($password)) {
            $hashed = password_hash($password, PASSWORD_DEFAULT);
            $upd = $pdo->prepare("UPDATE janitors SET fullname = ?, password = ? WHERE unique_code = ? OR username = ?");
            $upd->execute([$fullname, $hashed, $uniqueCode, $uniqueCode]);
        } else {
            $upd = $pdo->prepare("UPDATE janitors SET fullname = ? WHERE unique_code = ? OR username = ?");
            $upd->execute([$fullname, $uniqueCode, $uniqueCode]);
        }
        echo json_encode(["success" => true, "message" => "Profile updated successfully!"]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
    exit;
}

// ADMIN LOGIN
if ($action === 'admin_login') {
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');

    $stmt = $pdo->prepare("SELECT * FROM admins WHERE username = ?");
    $stmt->execute([$username]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($admin && password_verify($password, $admin['password'])) {
        echo json_encode(["success" => true, "user" => $admin]);
    } else {
        echo json_encode(["success" => false, "message" => "Maling admin username o password."]);
    }
    exit;
}

// ADMIN REGISTER
if ($action === 'admin_register') {
    $fullname = trim($input['fullname'] ?? '');
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');

    if (!$fullname || !$username || !$password) {
        echo json_encode(["success" => false, "message" => "Lahat ng fields ay kinakailangan."]);
        exit;
    }

    $chk = $pdo->prepare("SELECT id FROM admins WHERE username = ?");
    $chk->execute([$username]);
    if ($chk->fetch()) {
        echo json_encode(["success" => false, "message" => "Ang admin username na ito ay nagagamit na."]);
        exit;
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $ins = $pdo->prepare("INSERT INTO admins (fullname, username, password) VALUES (?, ?, ?)");
    if ($ins->execute([$fullname, $username, $hashed])) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Nabigo ang pag-rehistro ng admin."]);
    }
    exit;
}

// UPDATE ADMIN PROFILE
if ($action === 'update_admin_profile') {
    $id = intval($input['id'] ?? 0);
    $fullname = trim($input['fullname'] ?? '');
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');

    if (!$fullname || !$username) {
        echo json_encode(["success" => false, "message" => "Lahat ng fields maliban sa password ay kinakailangan."]);
        exit;
    }

    if (!empty($password)) {
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $upd = $pdo->prepare("UPDATE admins SET fullname = ?, username = ?, password = ? WHERE id = ? OR username = ?");
        $upd->execute([$fullname, $username, $hashed, $id, $username]);
    } else {
        $upd = $pdo->prepare("UPDATE admins SET fullname = ?, username = ? WHERE id = ? OR username = ?");
        $upd->execute([$fullname, $username, $id, $username]);
    }

    $stmt = $pdo->prepare("SELECT * FROM admins WHERE username = ?");
    $stmt->execute([$username]);
    $updatedAdmin = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "message" => "Admin profile updated successfully!", "user" => $updatedAdmin]);
    exit;
}