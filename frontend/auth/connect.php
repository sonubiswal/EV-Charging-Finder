<?php

$host = "localhost";
$user = "root";
$pass = "";
$db = "login";

// Create connection
$conn = new mysqli($host, $user, $pass, $db);

// Check connection
if ($conn->connect_error) {
    echo "Failed to connect to the database: " . $conn->connect_error;
    exit();
} else {
    echo "Connection successful!";
}

?>
