﻿/// <reference path="js/babylon.max.js" />
/// <reference path="js/socket.js" />
var canvas;
var engine;
var scene;
var isWPressed = false;
var isSPressed = false;
var isAPressed = false;
var isDPressed = false;

var isBPressed = false;

document.addEventListener("DOMContentLoaded", connectToServer);

var socket;
var Game = {};
var enemies = {};

function connectToServer() {
    socket = io.connect("http://localhost:3000", { transports: ['websocket'], upgrade:false });
    socket.on("connect", function () {
        console.log("connction estaplished successfully");
        
        socket.on("GetYourID", function (data) {
            Game.id = data.id;
            startGame();

            socket.emit("ThankYou", {});
        });

        socket.on("AnotherTankCreated", function (data) {
            createTank(scene, data);
        });

        socket.on("AnotherTankMoved", function (data) {
            var tank = enemies[data.id];
            tank.setState(data);
        
        });

        socket.on("data to fire ball", function (data) {
            console.log(data);
            fireCannonBalls(this.scene, data);
        
        });


        window.onbeforeunload = function () {
            socket.emit("IGoAway", Game.id);
            socket.disconnect();
        }

        socket.on("AnotherWentAway", function (data) {
            
            var tank = enemies[data.id];
            tank.dispose();
            delete enemies[data.id];
        
        });
		socket.emit('join', 'Hello World from client');
});
socket.on('broad', function(data) {
    $('#future').append(data+ "<br/>");
});

$('form').submit(function(e){
e.preventDefault();
var message = $('#chat_input').val();
socket.emit('messages', message);
    });
}




function startGame() {
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();
    modifySettings();
    var tank = scene.getMeshByName("HeroTank");
    var toRender = function () {
        tank.move();
        scene.render();
    }
    engine.runRenderLoop(toRender);
}

var createScene = function () {
    
    var scene = new BABYLON.Scene(engine);
    var ground = CreateGround(scene);
    var freeCamera = createFreeCamera(scene);
    var tank = createTank(scene);
    var followCamera = createFollowCamera(scene, tank);
    scene.activeCamera = followCamera;
    createLights(scene);
    scene.enablePhysics();

    
    return scene;
};

function CreateGround(scene) {
    var ground = new BABYLON.Mesh.CreateGroundFromHeightMap("ground", "images/hmap1.png", 2000, 2000, 20, 0, 1000, scene, false, OnGroundCreated);
    console.log(ground);
    function OnGroundCreated() {
        var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("images/grass.jpg", scene);
        ground.material = groundMaterial;
        ground.checkCollisions = true;
        console.log(ground);
    }
    return ground;
}

function createLights(scene) {
    var light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-.1, -1, 0), scene);
    var light1 = new BABYLON.DirectionalLight("dir1", new BABYLON.Vector3(-1, -1, 0), scene);

}
function createFreeCamera(scene) {
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

function createFollowCamera(scene, target) {
    var camera = new BABYLON.FollowCamera("tankFollowCamera", target.position, scene, target);
    camera.radius = 20; // how far from the object to follow
    camera.heightOffset = 4; // how high above the object to place the camera
    camera.rotationOffset = 180; // the viewing angle
    camera.cameraAcceleration = .1; // how fast to move
    camera.maxCameraSpeed = 5; // speed limit
    return camera;
}
function createTank(scene, data) {

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
var tank = BABYLON.MeshBuilder.ExtrudeShapeCustom("HeroTank", {shape: myShape, path: myPath, scaleFunction: scaling, sideOrientation: BABYLON.Mesh.DOUBLESIDE, updatable: true}, scene);

var scaling2 = function(i, distance) {
   return 1 + 0.2*distance;
};

var rotation = function(i, distance) {
   return distance * Math.PI / 108;
};	
    //////////////////////////////////////////////
    //var tank = new BABYLON.MeshBuilder.CreateBox("HeroTank", { height: 1, depth: 6, width: 6 }, scene);
    var tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
    tankMaterial.diffuseColor = new BABYLON.Color3.Red;
    tankMaterial.emissiveColor = new BABYLON.Color3.Blue;
    tank.material = tankMaterial;
    tank.position.y += 2;
    tank.speed = 1;
    tank.frontVector = new BABYLON.Vector3(0, 0, 1);
    
    tank.state = {
        id: Game.id,
    x: tank.position.x,
    y: tank.position.y,
    z: tank.position.z,
    rX: tank.rotation.x,
    rY: tank.rotation.y,
    rZ: tank.rotation.z,
    f: tank.frontVector,
    c: tank.checkCollisions = true
}
tank.setState = function(data)
{
    tank.position.x = data.x;
    tank.position.y = data.y;
    tank.position.z = data.z;
    tank.rotation.x = data.rX;
    tank.rotation.y = data.rY;
    tank.rotation.z = data.rZ;
    tank.frontVector = data.f;
    tank.checkCollisions = true;
}

if (data) {
    tankMaterial.diffuseColor = new BABYLON.Color3.Yellow;
    tankMaterial.emissiveColor = new BABYLON.Color3.Yellow;
    enemies[data.id] = tank;
    tank.setState(data);
}
else {
    socket.emit("IWasCreated", tank.state);
}
tank.move = function () {
    var notifyServer = false;
        var yMovement = 0;
        if (tank.position.y > 2) {
        tank.moveWithCollisions(new BABYLON.Vector3(0, -2, 0));
        notifyServer = true;
        }
        
        if (isWPressed) {
        tank.moveWithCollisions(tank.frontVector.multiplyByFloats(tank.speed, tank.speed, tank.speed));
        notifyServer = true;
        }
        if (isSPressed) {
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(-1 * tank.speed, -1 * tank.speed, -1 * tank.speed));
        notifyServer = true;    
    }
        if (isAPressed) {
            tank.rotation.y -= .1;
            tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y))
        notifyServer = true;
    }
        if (isDPressed) {
            tank.rotation.y += .1;
            tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y))
        notifyServer = true;
        }
    
    if (notifyServer) {
        tank.state.x = tank.position.x;
        tank.state.y = tank.position.y;
        tank.state.z = tank.position.z;
        tank.state.rX = tank.rotation.x;
        tank.state.rY = tank.rotation.y;
        tank.state.rZ = tank.rotation.z;
        tank.state.f = tank.frontVector;
        if(isBPressed) socket.emit("anotherbpressed", tank.state);
        socket.emit("IMoved", tank.state);
    }

    }

    return tank;
}

function fireCannonBalls (scene, data) {
    
    var cannonBall = new BABYLON.Mesh.CreateSphere("cannonBall", 32, 2, scene);
    cannonBall.material = new BABYLON.StandardMaterial("Fire", scene);
    cannonBall.material.diffuseTexture = new BABYLON.Texture("images/Fire.jpg", scene);
    
    var pos = data; // x and y from where to shoot //

    cannonBall.position = new BABYLON.Vector3(pos.x, pos.y + 1, pos.z); // still x and y position

    data.f = new BABYLON.Vector3(0, 0, 1);
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



window.addEventListener("resize", function () {
    engine.resize();
});

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




document.addEventListener("keydown", function (event) {
    if (event.key == 'w' || event.key == 'W') {
        isWPressed = true;
    }
    if (event.key == 's' || event.key == 'S') {
        isSPressed = true;
    }
    if (event.key == 'a' || event.key == 'A') {
        isAPressed = true;
    }
    if (event.key == 'd' || event.key == 'D') {
        isDPressed = true;
    }
    if (event.key == 'b' || event.key == 'B') {
        isBPressed = true;
        socket.emit("bpressed", "b is pressed");
    }

});

document.addEventListener("keyup", function (event) {
    if (event.key == 'w' || event.key == 'W') {
        isWPressed = false;
    }
    if (event.key == 's' || event.key == 'S') {
        isSPressed = false;
    }
    if (event.key == 'a' || event.key == 'A') {
        isAPressed = false;
    }
    if (event.key == 'd' || event.key == 'D') {
        isDPressed = false;
    }
    if (event.key == 'b' || event.key == 'B') {
        isBPressed = false;
    }
});

