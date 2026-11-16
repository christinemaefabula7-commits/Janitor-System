<?php
$host = 'localhost';
$dbname = 'slsu_jams';
$username = 'root';
$password = ''; // I-adjust kung may password ang MySQL mo sa XAMPP

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Kung sakaling mag-fail ang connection
    $pdo = null;
}
?>