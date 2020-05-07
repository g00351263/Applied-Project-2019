## <center>Project Name</center>
## <center>Babylon.js Multiplayer 3D Game Development</center>

<p align="center">
  <img src = "https://github.com/g00351263/Applied-Project-2019/blob/master/database%20creators/screen.jpg" height="1000" width="1000">
</p>

# 
# Table of contents

1.  [Project Details](#details)

2.  [Introduction To Project](#introduction)

3.  [Technologies Used](#techused)

4.  [Build Requirements](#requirements)
   
    4.1 [Hardware](#hard)
    
    4.2 [Software](#soft)

5. [Tutorial for Installing WAMP/NPM](#wamp/npm)

6. [Single Player Mode](#sp)

   6.1 [How To Run Single Player Code](#cs)

7. [Multi Player Mode](#m)

   6.1 [How To Run Multi Player Code](#cm)

6. [Project Github Repository Details](#repo)

#
# Project Details <a name="details"></a> 

| Project Details   |    |
| --- | --- |
| **Course** | BSc (Hons) in Software Development  |
| **Module** |  Applied Project and Minor Dissertation |
| **College** | [GMIT](http://www.gmit.ie/) Galway |
| **Student** | [Raja Naseer Ahmed Khan](https://github.com/g00351263)|
| **Project Supervisors** | Dr Brian McGinley|
| **Project Title** | Babylon.js Multiplayer 3D Game Development
| **Project Video** | https://youtu.be/_oOI20k4gz8 |

#   
### Project Introduction <a name="introduction"></a>
In this project we will use the said Babylon JavaScript engine and we will make a 3D game which can be run on any browser(multi-platform). This game will be using mouse and keyboard keys to move characters around the ground and shoot cannon, laser, and bullets projectile to destroy other meshes(players,enemies). We will also use the socket.io and node express server to run and create multiplayer mode to instantiate multiple player objects. Also, this project will be stored on Heroku.com for hosting online and we will get an online link of cloud storage at Heroku. The main purpose and our goal in this project will be to enhance our understanding to develop complete system to production by using any suitable methodology of system development life cycle (SDLC) i.e. agile, waterfall models.

# 
### Technologies Used <a name="techused"></a>
# 

- Babylon.js
- PHP
- WAMP
- NODE Express
- MySQL
- HTML
- JAVASCRIPT

#
### Build Requirements <a name="requirements"></a>
#
#### Software <a name="soft"></a>
- Used Windows 10.
- NPM
- Node.
- Wamp Server.
- PHP.
- Visual Studio Code.
- Google Chrome Browser.
# 
#### Hardware <a name="hard"></a>
- Laptop i7, 16gb, 256sd and NVIDIA card.
- Internet.
- Mouse.

# 
<span style="color:red;">Note: Make sure that you have installed npm, wamp.</span><a name="wamp/npm"></a>

- [Tutorial for Installing Node/NPM](https://phoenixnap.com/kb/install-node-js-npm-on-windows)

- [Tutorial for Installing WAMP](https://blog.templatetoaster.com/how-to-install-wamp/)
# 
#### For Single Player: <a name="sp"></a>
# 
<div style="text-align: justify">In Single Player mode you have a scene with 2 scenes can be scene within. First Scene is wheer you can play game, Second scene is you can only see random point of game moving objects.
In the game if you press t/T you will have control of car, you can press b to shoot ball and hit other animated character and can see the score on screen increasing, r to shoot raycast, press f to fly and it decreses the speed of car little bit as it is not in contact with ground collision and gravity. move the car around with w,a,s,d keys. There is a huge cylinder shaped object in middle of game, if you go into it, scene will change and i called it teleportal to another world. 

Also you can press y to get control of animated character. That animated character can be move forward and backward with keys w,s but turning is by using mouse to provide the experienc of firt shooter game. it can shoot bullet to other animated characters to.

Check the sky made it using the skybox and diffusing the photo of sky.

Ground is made of Heightmap, which decides the low and high of the ground by the grey and black color intensity, mor the black is the higher the ground area.</span>
# 
### How to Run Single Player Game With Code Provided:<a name="cs"></a>

1)  Please Copy paste the single player Tank Fight folder into www directory of wamp server. Link to single player -> [Single Player](https://github.com/g00351263/Applied-Project-2019/tree/master/Tank%20Fight/Single%20Player)

2) create database with the provided file of mysql in database folder(login and chat both have seperate database). Link to Database files ->
[Database Creator Files](https://github.com/g00351263/Applied-Project-2019/tree/master/database%20creators)

2)  Go onto localhost/login

3)  Type in details or register for details to login.

4)  Once logged in can see the menu (please select single player)

# 

#### For Multiplayer: <a name="m"></a>
# 
<div style="text-align: justify">Live demo of multiplayer game running at link below but to be <span style="color: red">noted that multiplayer game is the simple version of single player</span> where you instantiate the new players with every new browser but don't have full functionality like single player mode. you can chat, shoot and move around the car on the ground and can see other players movement and shooting, can't hit each other, nor have animated character or teleportal, as it requires lots of time to figure out calcuation of each object to be appeared to other players, Hence, this feature will be enhanced in 2nd release at some future point. As we Ran out of time due to present situation of Covid-19.</div> http://carmultiplayer.herokuapp.com/

### How to Run Multiplayer Game With Code Provided: <a name="cm"></a>
# 

1) Download the multiplayer folder and can place anywhere in hard drive. Click Link to multi player -> [Multi Player](https://github.com/g00351263/Applied-Project-2019/tree/master/Tank%20Fight/multiplayer)

1)  Please run <span style="color:red">npm install</span> on the multiplayer folder to install all required dependencies.

2)  after that you can type <span style="color:red">node server.js</span> to run the server.

3)  go onto any browser(chrome prefered) and type <span style="color:red">localhost:3000</span> you will see the game running.

4)  if you open multiple browsers, multiple instances can be seen on the browser and can be controlled indivdually.

# 
### Project Repository Includes: <a name="repo"></a>

1)  Project Dissertation File : RajaNaseerAhmedKhan_3D game development using JavaScript.pdf. Link here -> [Dissertation](https://github.com/g00351263/Applied-Project-2019/blob/master/RajaNaseerAhmedKhan_3D%20game%20development%20using%20JavaScript.pdf)

2)  Folder for Single Player Tank Fight. Link here -> [Single Player](https://github.com/g00351263/Applied-Project-2019/tree/master/Tank%20Fight/Single%20Player)
3)  Folder for Multi Player multiplayer. Link here -> [Multi Player](https://github.com/g00351263/Applied-Project-2019/tree/master/Tank%20Fight/multiplayer)
4)  Database creation folder. Link here -> [Database Creator Files](https://github.com/g00351263/Applied-Project-2019/tree/master/database%20creators)

5)  Video for screencast available at -> [Video For Project](https://youtu.be/_oOI20k4gz8)