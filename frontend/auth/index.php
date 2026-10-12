<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="contaner" id="SignUp" style="display: none;">
        <h1 class="from-title">Register</h1>
        <form method="post"action="register.php">
            <div class="input-group">
                <i class="fas fa-user"></i>
                <input type="text" name="fname" id="fname" placeholder="First Name" required>
                <label for="fname">First Name</label>
            </div>
            <div class="input-group">
                <i class="fas fa-user"></i>
                <input type="text"name="lName"id="lName"placeholder="Last Name" required>
                <label for="lname">Last Name</label>
            </div>
            <div class="input-group">
                <i class="fas fa-envelope"></i>
                <input type="email"name="email" id="email" placeholder="Email" required>
                <label for="Email">Email</label>
            </div>
            <div class="input-group">
                <i class="fas fa-lock"></i>
                <input type="password"name="password" id="password" placeholder="Password" required>
                <label for="password">Password</label>
            </div>
            <input type="submit" class="btn" value="Sign Up" name="signup">
        </form>    
        <p class="or">
            ----------or----------
        </p>
        <div class="icons">
            <i class="fab fa-google"></i>
            <i class="fab fa-facebook"></i>
        </div>
        <div class="links">
            <p>Already Have Account</p>
            <button id="signinbutton">Sign In</button>
        </div>
    </div>



    <div class="contaner" id="SignIn">
        <h1 class="from-title">SignIn</h1>
        <form method="post"action="register.php">
            <div class="input-group">
                <i class="fas fa-envelope"></i>
                <input type="email"name="email" id="email" placeholder="Email" required>
                <label for="Email">Email</label>
            </div>
            <div class="input-group">
                <i class="fas fa-lock"></i>
                <input type="password"name="password" id="password" placeholder="Password" required>
                <label for="password">Password</label>
            </div>
            <p class="recover">
                <a href="#">recover password</a>
            </p>
            <input type="submit" class="btn" value="Sign In" name="signin">
        </form>    
        <p class="or">
            ----------or----------
        </p>
        <div class="icons">
            <i class="fab fa-google"></i>
            <i class="fab fa-facebook"></i>
        </div>
        <div class="links">
            <p>don't Have Account</p>
            <button id="signupbutton">Sign Up</button>
        </div>
        <script src="script.js"></script>
</body>
</html>