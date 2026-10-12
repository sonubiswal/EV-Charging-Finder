<?php
session_start();
include("conect.php");
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Homepage</title>
</head>
<body>
    <div style="text-align: center; padding: 15%;">
        <p style="font-size: 50px; font-weight: bold;">
            Hello 
            <?php
            if (isset($_SESSION['email'])) {
                $email = $_SESSION['email'];
                $query = mysqli_query($conn, "SELECT * FROM `login` WHERE email='$email'");
                if ($query) {
                    while ($row = mysqli_fetch_array($query)) {
                        echo $row['firstName'] . ' ' . $row['lastName'];
                    }
                } else {
                    echo "Error retrieving user information.";
                }
            } else {
                echo "Guest";
            }
            ?>
            :)
        </p>
        <a href="logout.php">Logout</a>
    </div>
</body>
</html>
