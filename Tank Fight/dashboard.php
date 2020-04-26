<?php
//include auth_session.php file on all user panel pages
include("auth_session.php");

?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Dashboard - Client area</title>
    <link rel="stylesheet" href="style.css" />
</head>
<body>
    <div class="form">
        <p>Hey, <?php echo $_SESSION['username']; ?>!</p>
        <p>You are in user dashboard page.</p>
		<nav>
  <a href="Tank Fight/index2.php">Single Player</a> |
  <a href="multiplayer/index.html">Multi Player</a> |

</nav>
        <p><a href="logout.php">Logout</a></p>
    </div>

</body>
</html>