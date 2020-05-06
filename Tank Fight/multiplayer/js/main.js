// Developer : Raja Naseer Ahmed Khan
// Applied Project Module.
// Babylon Shooting Car Game


// generic methods from babylonjs website //
var canvas;
var engine;
var scene;

// keys are set to false once not pressed down //
var wForForward = false; // forward 
var sForBackward = false; // back
var aForLeft = false;  // left
var dforRight = false;  // right
var bForBall = false; // b for shooting

// event listner from html
document.addEventListener("DOMContentLoaded", connectToServer);

var socket; // socket reference to connect multiple clients to server

// MVCs for game modeling //
var Game = {}; // storing client game detailsin object
var enemies = {}; // storing the enemies details to render
var sid;

// generic socket io method from socket.io to create the sockets connection
function connectToServer() {
    
	// ports can be set here //
	socket = io.connect("http://localhost:3000", { transports: ['websocket'], upgrade:false });
    
	// incoming //
	socket.on("connect", function () {
		
		// if reply is success from server //
        console.log("connction estaplished successfully");
        
		// incoming // server sends id
        socket.on("uniqueSocketId", function (data) { 
            
			// id stored in game object for modeling details
			Game.id = data.id;
			sid = data.id;
			// new details assigned to player and game starts //
            newGame(); //startGame
			
			// outgoing // handshake with confirmation
            socket.emit("Appreciated", {}); 
        });

// incoming // making the car by server assigned location
        socket.on("enemiesCar", function (data) { 
            makeCar(scene, data);
        });
		
// incoming // getting all the details of position of other player connected
        socket.on("enemiesPosition", function (data) { 
			// storing enemies details in array, as can be many players need their own details saved
            var car = enemies[data.id];
			
			// model view model to get the details for the enemies rendered
            car.setState(data); // tank.setState
        
        });

// incoming // getting details of x and y position of car to fire the ball
        socket.on("details to fire ball", function (data) { 
            console.log(data); // log for debug
			
			// method that creates balls shooting
            fireCannonBalls(this.scene, data);
        
        });

		// when windows is closed this method triggers and sends details to server to remove game instance
        window.onbeforeunload = function () {
				// outgoing //
            socket.emit("Left", Game.id);  // sending id to delete from server
            socket.disconnect();// generic socket disconnect method
        }

// incoming // delete all enemies which are leaving game, as they needed to deleted from rendering and array
        socket.on("enemiesLeft", function (data) { 
            
            var car = enemies[data.id];
            car.dispose();
            delete enemies[data.id];
        
        });
		
			// outgoing // this tells the server that client trying to connect
		socket.emit('join', 'Client Joined');
	});

// incoming // this is used to communicate in chat messages
	socket.on('broad', function(data) {
		
		//jquery getting the details from element id in html
		$('#future').append("<b style='color:green;'>" + data + "</b><br/>");
	});

	// when user hits send this fuction triggers and send the elements from id as text to server
	$('form').submit(function(e){
		e.preventDefault();		
		var message = $('#chat_input').val();
		var name = $('#name').val();
			// outgoing // this is to send message to server for displaying to other clients
		socket.emit('messages', "<font style='color:red;'>" + name +  "</font> <b>:</b> " + message);

		});
				

	}



// function to start new game //
function newGame() {
	
	// html element id to display canvas
    canvas = document.getElementById("renderCanvas");
	
	// creating babylon eninge on canvas
    engine = new BABYLON.Engine(canvas, true);
    
	// creating the graphics or scene //
	scene = makeGUI();
	
	// mouse settings on canvas 
    modifySettings();
	
	// getting the mesh with id name 
    var car = scene.getMeshByName("Herocar");
	
	// rendering function to render car and assign moves
    var toRender = function () {
        car.move();
        scene.render();
    }
    engine.runRenderLoop(toRender);
}

// function to render scene
var makeGUI = function () { 
    
    var scene = new BABYLON.Scene(engine);
    var ground = makeTerrain(scene); // making ground with heightmap
    var freeCamera = cameraWithThePlayer(scene); // assign cammera
    var car = makeCar(scene); // make the car
    var followCamera = stalkingCamera(scene, car); // creaete camera which will follow car
    scene.activeCamera = followCamera; // setting which camera is active
    setLightning(scene); // lights
    scene.enablePhysics(); // enable the real life physics to make ground like earth

    return scene;
};

// making ground
function makeTerrain(scene) { 

	// size of ground and image file
    var ground = new BABYLON.Mesh.CreateGroundFromHeightMap("ground", "images/hmap1.png", 2000, 2000, 20, 0, 1000, scene, false, OnGroundCreated);
    
	// once ground is made this function will assign materials and texture, also enables physics
    function OnGroundCreated() {
        var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("images/grass.jpg", scene);
        ground.material = groundMaterial;
        ground.checkCollisions = true;
    }
    return ground;
}


// setting lightining to the scene
function setLightning(scene) { //createLights
    var light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-.1, -1, 0), scene);
    var light1 = new BABYLON.DirectionalLight("dir1", new BABYLON.Vector3(-1, -1, 0), scene);

}

// function which will move camera according to keys pressed hence car and camera position move together
function cameraWithThePlayer(scene) { //createFreeCamera
    var camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas);
    camera.position.y = 50;
    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.keysUp.push('w'.charCodeAt(0));
    camera.keysUp.push('W'.charCodeAt(0));
    camera.keysDown.push('s'.charCodeAt(0));
    camera.keysDown.push('S'.charCodeAt(0));
    camera.keysRight.push('d'.charCodeAt(0));
    camera.keysRight.push('D'.charCodeAt(0));
    camera.keysLeft.push('a'.charCodeAt(0));
    camera.keysLeft.push('A'.charCodeAt(0));
    
    return camera;
}

function stalkingCamera(scene, target) { //createFollowCamera
    var camera = new BABYLON.FollowCamera("tankFollowCamera", target.position, scene, target);
    camera.radius = 20; // how far from the object to follow
    camera.heightOffset = 4; // how high above the object to place the camera
    camera.rotationOffset = 180; // the viewing angle
    camera.cameraAcceleration = .1; // how fast to move
    camera.maxCameraSpeed = 5; // speed limit
    return camera;
}


// function which will make car
function makeCar(scene, data) { //createTank

    /////////////////////////////////////////
    	//Array of paths to construct extrusion
	var myShape = [
        new BABYLON.Vector3(0, 5, 0),
       new BABYLON.Vector3(1, 1, 0),
       new BABYLON.Vector3(5, 0, 0),
       new BABYLON.Vector3(1, -1, 0),
       new BABYLON.Vector3(0, -5, 0),
       new BABYLON.Vector3(-1, -1, 0),
       new BABYLON.Vector3(-5, 0, 0),
       new BABYLON.Vector3(-1, 1, 0)
];

// all the above meshed pushed into 1 
myShape.push(myShape[0]);

var myPath = [
       new BABYLON.Vector3(0, 0, 0),
       new BABYLON.Vector3(0, 0, 2),
       new BABYLON.Vector3(0, 0, 4),
       new BABYLON.Vector3(0, 0, 6),
       new BABYLON.Vector3(0, 0, 8),
       new BABYLON.Vector3(0, 0, 10)
];

var scaling = function(i, distance) {
   return 1/(i+1);
};

//Create custom extrusion with updatable parameter set to true for later changes
var car = BABYLON.MeshBuilder.ExtrudeShapeCustom("Herocar", {shape: myShape, path: myPath, scaleFunction: scaling, sideOrientation: BABYLON.Mesh.DOUBLESIDE, updatable: true}, scene);

var scaling2 = function(i, distance) {
   return 1 + 0.2*distance;
};

var rotation = function(i, distance) {
   return distance * Math.PI / 108;
};	
    //////////////////////////////////////////////
    //var car = new BABYLON.MeshBuilder.CreateBox("Herocar", { height: 1, depth: 6, width: 6 }, scene);
    var carMaterial = new BABYLON.StandardMaterial("carMaterial", scene);
    carMaterial.diffuseColor = new BABYLON.Color3.Red;
    carMaterial.emissiveColor = new BABYLON.Color3.Blue;
    car.material = carMaterial;
    car.position.y += 2;
    car.speed = 1;
    car.frontVector = new BABYLON.Vector3(0, 0, 1);
    
	
	// we will use this for communicating the object with details to server
    car.state = {
        id: Game.id,
    x: car.position.x,
    y: car.position.y,
    z: car.position.z,
    rX: car.rotation.x,
    rY: car.rotation.y,
    rZ: car.rotation.z,
    f: car.frontVector,
    c: car.checkCollisions = true
}

// we will use this mvx to get details of enemy and render
car.setState = function(data)
{
    car.position.x = data.x;
    car.position.y = data.y;
    car.position.z = data.z;
    car.rotation.x = data.rX;
    car.rotation.y = data.rY;
    car.rotation.z = data.rZ;
    car.frontVector = data.f;
    car.checkCollisions = true;
}


// this will pass data when we have enemies data available
if (data) {
    carMaterial.diffuseColor = new BABYLON.Color3.Yellow;
    carMaterial.emissiveColor = new BABYLON.Color3.Yellow;
    enemies[data.id] = car;
    car.setState(data);
}

// else it will send only our own client data
else {
    socket.emit("developed", car.state);
}

// function to move car
car.move = function () {
	
	// this variable is used to inform server when key is pressed, to save traffic
    var notifyServer = false;
        
		
		var yMovement = 0;
        
		if (car.position.y > 2) {
			car.moveWithCollisions(new BABYLON.Vector3(0, -2, 0));
			notifyServer = true;
        }
        
		// moving forward
		if (wForForward) {
			
			// enabling the collision and moving with the speed provided
			car.moveWithCollisions(car.frontVector.multiplyByFloats(car.speed, car.speed, car.speed));
			notifyServer = true;
        }
        if (sForBackward) {
            car.moveWithCollisions(car.frontVector.multiplyByFloats(-1 * car.speed, -1 * car.speed, -1 * car.speed));
			notifyServer = true;    
		}
		
		// left and right turn with cos and sin calcuation to move cars front point vector just like car is steering in left and right moving front vector along the keys pressed
        if (aForLeft) {
            car.rotation.y -= .1;
            car.frontVector = new BABYLON.Vector3(Math.sin(car.rotation.y), 0, Math.cos(car.rotation.y))
        notifyServer = true;
		}
        if (dforRight) {
            car.rotation.y += .1;
            car.frontVector = new BABYLON.Vector3(Math.sin(car.rotation.y), 0, Math.cos(car.rotation.y))
        notifyServer = true;
        }
    
	// if keys pressed this details will be sent to server
    if (notifyServer) {
        car.state.x = car.position.x;
        car.state.y = car.position.y;
        car.state.z = car.position.z;
        car.state.rX = car.rotation.x;
        car.state.rY = car.rotation.y;
        car.state.rZ = car.rotation.z;
        car.state.f = car.frontVector;
		
		// if b pressed shooting ball details sent to server with car details to render ball
        if(bForBall) socket.emit("anotherbpressed", car.state);
        socket.emit("pos", car.state);
		}
    }

    return car;
}


// function to fire balls
function fireCannonBalls (scene, data) {
    
    var cannonBall = new BABYLON.Mesh.CreateSphere("cannonBall", 32, 2, scene);
    cannonBall.material = new BABYLON.StandardMaterial("Fire", scene);
    cannonBall.material.diffuseTexture = new BABYLON.Texture("images/Fire.jpg", scene);
    
    var pos = data; // x and y from where to shoot //

    cannonBall.position = new BABYLON.Vector3(pos.x, pos.y + 1, pos.z); // still x and y position

    data.f = new BABYLON.Vector3(data.f.x,data.f.y,data.f.z);
    console.log(data.f);
   

    
    cannonBall.physicsImpostor = new BABYLON.PhysicsImpostor(cannonBall,
        BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1 }, scene);
        var fVector = data.f;
        cannonBall.position.addInPlace(data.f.multiplyByFloats(5, 5, 5));
        var force = new BABYLON.Vector3(fVector.x * 100, (fVector.y + .1) * 100, fVector.z * 100);
        
        cannonBall.physicsImpostor.applyImpulse(force, cannonBall.getAbsolutePosition());

        setTimeout(function () {

            cannonBall.dispose();
        }, 3000);
        
    return cannonBall;
} 


// listening to resize of the screen
window.addEventListener("resize", function () {
    engine.resize();
});


// getting the mouse to be clicked on screen
function modifySettings() {
    scene.onPointerDown = function () {
        if (!scene.alreadyLocked) {
            console.log("Requesting pointer lock");
            canvas.requestPointerLock = canvas.requestPointerLock ||
					canvas.msRequestPointerLock || canvas.mozRequestPointerLock ||
					canvas.webkitRequestPointerLock;
            canvas.requestPointerLock();
        }
        else {
            console.log("Not requesting because we are already locked");
        }
    }
    
    document.addEventListener("pointerlockchange", pointerLockListener);
    document.addEventListener("mspointerlockchange", pointerLockListener);
    document.addEventListener("mozpointerlockchange", pointerLockListener);
    document.addEventListener("webkitpointerlockchange", pointerLockListener);
    
    function pointerLockListener() {
        var element = document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement || document.pointerLockElement || null;
        
        if (element) {
            scene.alreadyLocked = true;
        }
        else {
            scene.alreadyLocked = false;
        }
    }

}



// event listners when keys are  pressed and set to true //

document.addEventListener("keydown", function (event) {
    if (event.key == 'w' || event.key == 'W') {
        wForForward = true;
    }
    if (event.key == 's' || event.key == 'S') {
        sForBackward = true;
    }
    if (event.key == 'a' || event.key == 'A') {
        aForLeft = true;
    }
    if (event.key == 'd' || event.key == 'D') {
        dforRight = true;
    }
    if (event.key == 'b' || event.key == 'B') {
        bForBall = true;
		
			// outgoing // checking if pressing the b sending signal to server
        socket.emit("bpressed", "b is pressed");
    }

});


// event listners when keys are not pressed and set to false //
document.addEventListener("keyup", function (event) {
    if (event.key == 'w' || event.key == 'W') {
        wForForward = false;
    }
    if (event.key == 's' || event.key == 'S') {
        sForBackward = false;
    }
    if (event.key == 'a' || event.key == 'A') {
        aForLeft = false;
    }
    if (event.key == 'd' || event.key == 'D') {
        dforRight = false;
    }
    if (event.key == 'b' || event.key == 'B') {
        bForBall = false;
    }
});

