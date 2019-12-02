/// <reference path="babylon.max.js" /> 
// above helps autocomplete //

var canvas;
var engine;
var scene; // contains all object on screen //

// variables to check what key is pressed //
var isWPressed = false;
var isDPressed = false;
var isSPressed = false;
var isAPressed = false;
document.addEventListener("DOMContentLoaded", startGame); // when html page loaded start function //


// start game function //
function startGame() {
    canvas = document.getElementById("renderCanvas"); // getting the index file element by id //
    engine = new BABYLON.Engine(canvas, true); // draw on canvas //

    scene = createScene();

    modifySettings();

    var tank = scene.getMeshByName("HeroTank");

    var toRender = function () { // draw the scene //

        tank.move(); // tank movement function
        var heroDude = scene.getMeshByName("heroDude");
        if (heroDude)
            heroDude.move();
        scene.render();
    }

    engine.runRenderLoop(toRender); //call back funtion 1 animation per frame //
}


// majority of work here creating all objects //
var createScene = function () {
    var scene = new BABYLON.Scene(engine); // draw this scene ///

    var ground = CreateGround(scene);

    var freeCamera = createFreeCamera(scene);

    var tank = createTank(scene); //tank created and added to scene

    var followCamera = createFollowCamera(scene, tank); // needs scene and object target to follow //
    scene.activeCamera = followCamera; // active following camera

    createLights(scene);
    createHeroDude(scene);

    return scene;
};


// to crate complete ground //
function CreateGround(scene) {

    var ground = new BABYLON.Mesh.CreateGroundFromHeightMap("ground", "images/hmap1.png", 2000, 2000, 20, 0, 300, scene, false, OnGroundCreated); // ground obj //

    // function to add material to HeightMap Ground //
    function OnGroundCreated() {
        var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("images/grass.jpg", scene);
        ground.material = groundMaterial;
        ground.checkCollisions = true; // check collision happening //
    }
    return ground;
}


// function light //
function createLights(scene) {
    var light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-.1, -1, 0), scene); // throw light on object //
    var light1 = new BABYLON.DirectionalLight("dir1", new BABYLON.Vector3(-.1, -1, 0), scene); // throw light on object //

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

// when resize your browser resize the engne //
window.addEventListener("resize", function () {
    engine.resize();
});


// following object camera //
function createFollowCamera(scene, target) {

    var camera = new BABYLON.FollowCamera("tankFollowCamera", target.position, scene, target);
    camera.radius = 20; // how far from object follow//
    camera.heightOffset = 4; // how high above the object to place camera //
    camera.rotationOffset = 180; // the viewing angle //
    camera.cameraAccelration = 0.5; // fast to move //
    camera.maxCameraSpeed = 50; // speed limit //
    return camera;        
}


// tank creating function //
function createTank(scene) {

    var tank = new BABYLON.MeshBuilder.CreateBox("HeroTank", { height: 1, depth: 6, width: 6 }, scene);
    var tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
    tankMaterial.diffuseColor = new BABYLON.Color3.Red;
    tankMaterial.emissiveColor = new BABYLON.Color3.Blue;
    tank.material = tankMaterial;

    // tank not tounching ground //
    tank.position.y += 2; // height of tank//



    // tank move sub function //
    tank.speed = 1;

    tank.frontVector = new BABYLON.Vector3(0, 0, 1); // direction of front vector


    tank.move = function () {
        var yMovement = 0;
        if (tank.position.y > 2) {
            yMovement = -2;
        }

        // movement on keypress with boolean sender //
        if (isWPressed) {
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(tank.speed, tank.speed, tank.speed)); // moving fordward with speed of tank
        }
        if (isSPressed) {
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(-1*tank.speed, -1*tank.speed, -1*tank.speed)); // moving back
        }
        if (isAPressed) {
            tank.rotation.y -= .1; // moving left//
            tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y));
        }
        if (isDPressed) {
            tank.rotation.y += .1; // moving right //
            tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y));
        }
    }
    return tank;
}

function createHeroDude(scene)
{

    ///////////importing dude//////

    BABYLON.SceneLoader.ImportMesh("him", "Dude/", "dude.babylon", scene, onDudeImported);

    function onDudeImported(newMeshes, particleSystems, skeletons) {
        newMeshes[0].position = new BABYLON.Vector3(0, 0, 5);  // The original dude
        newMeshes[0].name = "heroDude";
        var heroDude = newMeshes[0];
        heroDude.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
        scene.beginAnimation(skeletons[0], 0, 120, true, 1.0);
        heroDude.move = function () {
            var tank = scene.getMeshByName("HeroTank");
            var direction = tank.position.subtract(this.position);
            var dir = direction.normalize();
            var alpha = Math.atan2(-1 * dir.x, -1 * dir.z);
            this.rotation.y = alpha;
        }
    }
    ///////////////////
}

/// mouse click move arround full screen and escape button//
function modifySettings() {
    scene.onPointerDown = function () {
        if (!scene.alreadyLocked) {
            canvas.requestPointerLock = canvas.requestPointerLock ||
                canvas.msRequestPointerLock || canvas.mozRequestPointerLock ||
                canvas.webkitRequestPonterLock;
            canvas.requestPointerLock();
        }
        else {


        }
        
    }

    document.addEventListener("pointerlockchange", pointLockListner);
    document.addEventListener("mspointerlockchange", pointLockListner);
    document.addEventListener("mozpointerlockchange", pointLockListner);
    document.addEventListener("webkitpointerlockchange", pointLockListner);

    function pointLockListner() {
        var element = document.pointerLockElement || null;

        if (element) {
            scene.alreadyLocked = true;
        }
        else {
            scene.alreadyLocked = false;
        }
    }
}

//event listners for keys pressed for tank movement also boolean variables true or false //

// if keys is pressed //
document.addEventListener("keydown", function (event) {
    if (event.key == 'w' || event.key == 'W') {
        isWPressed = true;
    }
    if (event.key == 'd' || event.key == 'D') {
        isDPressed = true;
    }
    if (event.key == 's' || event.key == 'S') {
        isSPressed = true;
    }
    if (event.key == 'a' || event.key == 'A') {
        isAPressed = true;
    }
});

// if key is released //
document.addEventListener("keyup", function (event) {
    if (event.key == 'w' || event.key == 'W') {
        isWPressed = false;
    }
    if (event.key == 'd' || event.key == 'D') {
        isDPressed = false;
    }
    if (event.key == 's' || event.key == 'S') {
        isSPressed = false;
    }
    if (event.key == 'a' || event.key == 'A') {
        isAPressed = false;
    }
});