<?php
session_start();
require 'db.php';

$email = $_POST['email'];
$password = $_POST['password'];

$sql = "SELECT * FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    if (password_verify($password, $row['password'])) {
        $username = $row['username']; // Fetch from DB
        $_SESSION['username'] = $username;

        // Redirect with embedded localStorage setting
        echo "
        <script>
            localStorage.setItem('currentUser', " . json_encode($username) . ");
            window.location.href = '../maincat.html'; // Go to your category or dashboard page
        </script>";
    } else {
        echo "Invalid password.";
    }
} else {
    echo "User not found.";
}

$stmt->close();
$conn->close();
?>
