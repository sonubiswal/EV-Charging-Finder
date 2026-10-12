<?php

include 'conect.php'; // Ensure the file path is correct

if (isset($_POST['signup'])) {
    $firstName = $_POST['fName'];
    $lastName = $_POST['lName'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $password = md5($password);

    // Check if the email already exists
    $checkEmail = "SELECT * FROM login WHERE email='$email'";
    $result = $conn->query($checkEmail);

    if ($result->num_rows > 0) {
        echo "Email Address Already Exists!";
    } else {
        // Insert new user into the database
        $insertQuery = "INSERT INTO login (firstName, lastName, email, password) 
                        VALUES ('$firstName', '$lastName', '$email', '$password')";

        if ($conn->query($insertQuery) === TRUE) {
            header("Location: index.php");
            exit();
        } else {
            echo "Error: " . $conn->error;
        }
    }
}

if (isset($_POST['signin'])) {
    $email = $_POST['email'];
    $password = $_POST['password'];
    $password = md5($password);

    // Check credentials
    $sql = "SELECT * FROM login WHERE email='$email' AND password='$password'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        session_start();
        $row = $result->fetch_assoc();
        $_SESSION['email'] = $row['email'];
        header("Location: homepage.php");
        exit();
    } else {
        echo "Incorrect Email or Password.";
    }
}

?>
