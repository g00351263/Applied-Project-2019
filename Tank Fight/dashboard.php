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
	
	<style>
	@import url(https://fonts.googleapis.com/css?family=Shadows+Into+Light);

body {
  background:orange;
  
}






#allthethings {
  width:0px;
  height:0px;
  
  border-left: 300px solid transparent;
  border-right:300px solid transparent;
  border-top: 300px solid transparent;
  border-radius: px;
  position:relative;
  margin:auto;
  top:5px;
  left:2px;
  
  
  
  
  
  
}

#single {
  
  position:relative;
  bottom:330px;
  right:300px;
  height:50px;
  width:600px;
  background:#006680;
  text-align:center;
  font-size:30px;
 background-size: 1px 300%;
 -webkit-transition:0.5s;
  transition:0.5s;
  color:orange;
  font-family:shadows into light;
  
  cursor:pointer;
  
  
  
}

#single:hover {
  background:#7A0000;
  color:white;
-webkit-transform:rotate(-1deg);
  transform:rotate(-2deg);
  
  
}

#multiplayer:hover {
  background:#7A0000;
  color:white;
   
  -webkit-transform:rotate(-2deg);
  transform:rotate(-2deg);
  
  
}



#left {
  height:100px;
    width:600px;
  background:orange;
  position:absolute;
  z-index:6;
  -webkit-transform:rotate(45deg);
  transform:rotate(45deg);
  top:-175px;
  right:-104px;
  border-top:1px solid white;
  
}
#right {
  height:100px;
  width:600px;
  background:orange;
  position:absolute;
  top:-229px;
  -webkit-transform:rotate(-45deg);
  transform:rotate(-45deg);
  z-index:7;
  left:-56px;
  border-top:1px solid white;
  
  
}



#single p {
  position:relative;
  top:2px;
  right:4px;
  
  
}

#multiplayer {
  height:50px;
  width:500px;
  background:#006680;
  position:relative;
  bottom:345px;
  right:240px;
  text-align:center;
  font-size:30px;
  font-family:shadows into light;
  color:orange;
   -webkit-transition:0.5s;
  transition:0.5s;
  cursor:pointer;
  
   
  
}
#multiplayer p {
  position:relative;
  top:0px;
  right:9px;
  
}

	
	</style>
</head>
<body>
    <div class="form">
        <p>Hey, <?php echo $_SESSION['username']; ?>!</p>
        <p>You are in user dashboard page.</p>
		<nav>
<div id="allthethings">
  <div id="left"></div>
  <a href="Tank Fight/index2.php"><div id="single"><p>SINGLE PLAYER</p></div></a> 
  <a href="multiplayer/index.html"><div id="multiplayer"><p>MULTIPLAYER</p></div></a> 
    <div id="right"></div>
</div>
</nav>
        <p><a href="logout.php">Logout</a></p>
    </div>

</body>
</html>

  
