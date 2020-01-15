/// <reference path="babylon.max.js"/> 
/// <reference path="cannon.js"/>
// above helps autocomplete //
//start python http server = python -m http.server//
var canvas;
var engine;
var scene; // contains all object on screen //

// variables to check what key is pressed //
var isWPressed = false;
var isDPressed = false;
var isSPressed = false;
var isAPressed = false;
var isBPressed = false; //fire//

document.addEventListener("DOMContentLoaded", startGame); // when html page loaded start function //

//class to make dude objects//
class Dude {
    //default constructor for dude//
    constructor(dudeMesh, speed) {
        this.dudeMesh = dudeMesh;
        dudeMesh.Dude = this;
        if (speed) {
            this.speed = speed;
        }
        else {
            this.speed = 1;
        }
    }
    // end default constructor//

    //function to move dude//
    move() {
        var tank = scene.getMeshByName("HeroTank");
        var direction = tank.position.subtract(this.dudeMesh.position);
        var distance = direction.length(); // distance between dude and tank //
        var dir = direction.normalize();
        var alpha = Math.atan2(-1 * dir.x, -1 * dir.z);
        this.dudeMesh.rotation.y = alpha;
        if (distance > 30) {
            this.dudeMesh.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));

        }
    }
    //end move function//
}
// ends dude class//

// start game function //
function startGame() {
    canvas = document.getElementById("renderCanvas"); // getting the index file element by id //
    engine = new BABYLON.Engine(canvas, true); // draw on canvas //

    scene = createScene();

    modifySettings();

    var tank = scene.getMeshByName("HeroTank");

    var toRender = function () { // draw the scene //

        tank.move(); // tank movement function
        tank.fire();
        moveHeroDude();
        moveOtherDudes();
        scene.render();
    }

    engine.runRenderLoop(toRender); //call back funtion 1 animation per frame //
}


// majority of work here creating all objects //
var createScene = function () {
    var scene = new BABYLON.Scene(engine); // draw this scene ///
    scene.enablePhysics(); // enabling physics from cannon.js
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
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground,
            BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0 }, scene);
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
    camera.position.y = 150;
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



// following object camera //
function createFollowCamera(scene, target) {

    var camera = new BABYLON.FollowCamera("tankFollowCamera", target.position, scene, target);
    camera.radius = 60; // how far from object follow//
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
    tank.fire = function () {
        if (!isBPressed) return;

        var cannonBall = new BABYLON.Mesh.CreateSphere("cannonBall", 32, 2, scene);
        cannonBall.material = new BABYLON.StandardMaterial("Fire", scene);
        cannonBall.material.diffuseTexture = new BABYLON.Texture("images/Fire.jpg", scene);

        var tank = this;

        var pos = tank.position;

        cannonBall.position = new BABYLON.Vector3(pos.x, pos.y + 1, pos.z);
        cannonBall.position.addInPlace(tank.frontVector.multiplyByFloats(5,5,5));

        cannonBall.physicsImpostor = new BABYLON.PhysicsImpostor(cannonBall, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1.5 }, scene);

        var fVector = tank.frontVector;

        var force = new BABYLON.Vector3(fVector.x * 100, (fVector.y+0.01) * 100, fVector.z*100);

        cannonBall.physicsImpostor.applyImpulse(force,cannonBall.getAbsolutePosition());
    }
    return tank;
}

function createHeroDude(scene) {

    ///////////importing dude//////

    BABYLON.SceneLoader.ImportMesh("him", "Dude/", "dude.babylon", scene, onDudeImported);

    function onDudeImported(newMeshes, particleSystems, skeletons) {
        newMeshes[0].position = new BABYLON.Vector3(0, 0, 5);  // The original dude
        newMeshes[0].name = "heroDude";
        var heroDude = newMeshes[0];
        heroDude.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
        heroDude.speed = 2;
        scene.beginAnimation(skeletons[0], 0, 120, true, 1.0);

        var hero = new Dude(heroDude, 2);

        scene.dudes = [];

        for (var q=0; q<10; q++) {
            scene.dudes[q] = DoClone(heroDude, skeletons, q);
            scene.beginAnimation(scene.dudes[q].skeleton, 0, 120, true, 1.0);
            var temp = new Dude(scene.dudes[q], 2);
            console.log(scene.dudes[q].skeleton); 
        }
    }
    ///////////////////
}

function DoClone(original, skeletons, id) {
    var myClone;
    var xrand = Math.floor(Math.random() * 501) - 250;
    var zrand = Math.floor(Math.random() * 501) - 250;

    myClone = original.clone("clone_" + id);
    myClone.position = new BABYLON.Vector3(xrand, 0, zrand);

    if (!skeletons) {
        return myClone;
    }
    else {
        if (!original.getChildren()) {
            myClone.skeleton = skeletons[0].clone("clone_" + id + "_skeleton");
            return myClone;
        }
        else {
            if (skeletons.length == 1)// this means one skeleton controlling animating all the children
            {
                var clonedSkeleton = skeletons[0].clone("clone_" + id + "_skeleton");
                myClone.skeleton = clonedSkeleton;
                var numChildren = myClone.getChildren().length;
                for (var i = 0; i < numChildren; i++) {
                    myClone.getChildren()[i].skeleton = clonedSkeleton;
                }
                return myClone;
            }

            //most probably each child has its own skeleton
            else if (skeletons.length == original.getChildren().length) {
                for (var i = 0; i < myClone.getChildren().length; i++) {
                    myclone.getChildren()[i].skeleton = skeletons[i].clone("clone_" + id + "_skeleton_"+i);
                }
                return myClone;
            }
        }
    }

    return myClone;
}

function moveHeroDude() {
    var heroDude = scene.getMeshByName("heroDude");
    if (heroDude)
        heroDude.Dude.move();
}
function moveOtherDudes() {
    if (scene.dudes) {
        for (var q = 0; q < scene.dudes.length; q++) {
            scene.dudes[q].Dude.move();
        }
    }
}

// when resize your browser resize the engne //
window.addEventListener("resize", function () {
    engine.resize();
});


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
    if (event.key == 'b' || event.key == 'B') {
        isBPressed = true; // fire //
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
    if (event.key == 'b' || event.key == 'B') {
        isBPressed = false; // fire //
    }
});