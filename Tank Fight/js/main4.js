﻿/// <reference path="babylon.max.js" />
/// <reference path="cannon.js" />

// Raja Naseer Ahmed Khan
var canvas; // canvas to draw game
var engine; // Babylon engine
var scene; // scene to be visible 

// checking if key is pressed or not
var isWPressed = false;
var isSPressed = false;
var isAPressed = false;
var isDPressed = false;
var isBPressed = false;
var isRPressed = false;

// score variable global
var score = 0;

// seperate canvas 2d for showing score canvas
var context;


document.addEventListener("DOMContentLoaded", startGame);

// Dude is the enemey character and this is his class to make object
class Dude {
	
	// constructor taking following parameters
    constructor(dudeMesh, speed, id, scene, scaling) {
        this.dudeMesh = dudeMesh;
        this.id = id;
        this.scene = scene;
        this.health = 3;
        dudeMesh.Dude = this;

		
        if (speed)
            this.speed = speed;
        else
            this.speed = 1;

        if (scaling) {
            this.scaling = scaling;
            this.dudeMesh.scaling = new BABYLON.Vector3(this.scaling, this.scaling, this.scaling);
        }
        else
            this.scaling = 1;

        if (Dude.boundingBoxParameters == undefined) {
            Dude.boundingBoxParameters = this.CalculateBoundingBoxParameters();
        }
        if (Dude.particleSystem == undefined) {
            Dude.particleSystem = this.createDudeParticleSystem();
        }

        this.bounder = this.createBoundingBox();
        this.bounder.dudeMesh = this.dudeMesh;
    }

	// function to move the enemey dude //
    move() {

        if (!this.bounder) return;
        this.dudeMesh.position = new BABYLON.Vector3(this.bounder.position.x,
            this.bounder.position.y - this.scaling * Dude.boundingBoxParameters.lengthY / 2.0, this.bounder.position.z);
        var tank = scene.getMeshByName("heroTank");
        var direction = tank.position.subtract(this.dudeMesh.position);
        var distance = direction.length();
        var dir = direction.normalize();
        var alpha = Math.atan2(-1 * dir.x, -1 * dir.z);
        this.dudeMesh.rotation.y = alpha;
        if (distance > 30)
            this.bounder.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
    }
	
	// imaginary box around the dudes to make them collision visible
    createBoundingBox() {
        var lengthX = Dude.boundingBoxParameters.lengthX;
        var lengthY = Dude.boundingBoxParameters.lengthY;
        var lengthZ = Dude.boundingBoxParameters.lengthZ;
        new BABYLON.Quaternion
        var bounder = new BABYLON.Mesh.CreateBox("bounder" + (this.id).toString(), 1, this.scene);

        bounder.scaling.x = lengthX * this.scaling;
        bounder.scaling.y = lengthY * this.scaling;
        bounder.scaling.z = lengthZ * this.scaling * 2;

		//box around dude is not visible only himself
        bounder.isVisible = false;

		// material for box around dude
        var bounderMaterial = new BABYLON.StandardMaterial("bounderMaterial", this.scene);
        bounderMaterial.alpha = .5;
        bounder.material = bounderMaterial;
        bounder.checkCollisions = true;


		// bounding box is traveling with the dude x and y direction
        bounder.position = new BABYLON.Vector3(this.dudeMesh.position.x, this.dudeMesh.position.y
             + this.scaling * lengthY / 2, this.dudeMesh.position.z);


        return bounder;
    }
	
	// calculating the value of bounding box as it will be needed for collision detection
    CalculateBoundingBoxParameters() {
        var minX = 999999; var minY = 99999; var minZ = 999999;
        var maxX = -99999; var maxY = -999999; var maxZ = -99999;

        var children = this.dudeMesh.getChildren();

        for (var i = 0 ; i < children.length ; i++) {
            var positions = new BABYLON.VertexData.ExtractFromGeometry(children[i]).positions;
            if (!positions) continue;

            var index = 0;
            for (var j = index ; j < positions.length ; j += 3) {
                if (positions[j] < minX)
                    minX = positions[j];
                if (positions[j] > maxX)
                    maxX = positions[j];
            }
            index = 1;
            for (var j = index ; j < positions.length ; j += 3) {
                if (positions[j] < minY)
                    minY = positions[j];
                if (positions[j] > maxY)
                    maxY = positions[j];
            }
            index = 2;
            for (var j = index ; j < positions.length ; j += 3) {
                if (positions[j] < minZ)
                    minZ = positions[j];
                if (positions[j] > maxZ)
                    maxZ = positions[j];
            }

            var _lengthX = maxX - minX;
            var _lengthY = maxY - minY;
            var _lengthZ = maxZ - minZ;

        }


        return { lengthX: _lengthX, lengthY: _lengthY, lengthZ: _lengthZ };
    }

	//particles released when dude is getting hit by anything
    createDudeParticleSystem() {

        // Create a particle system
        var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);

        //Texture of each particle
        particleSystem.particleTexture = new BABYLON.Texture("images/flare.png", scene);

        // Where the particles come from
        particleSystem.emitter = new BABYLON.Vector3(0, 0, 0); // the starting object, the emitter


        // Colors of all particles
        particleSystem.color1 = new BABYLON.Color4(1, 0, 0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(1, 0, 0, 1.0);
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);

        particleSystem.emitRate = 100;


        // Set the gravity of all particles
        particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);

        // Direction of each particle after it has been emitted
        particleSystem.direction1 = new BABYLON.Vector3(0, -1, 0);
        particleSystem.direction2 = new BABYLON.Vector3(0, -1, 0);

        particleSystem.minEmitPower = 6;
        particleSystem.maxEmitPower = 10;
        return particleSystem;
    }

	// dudes health is decreasing slowly by 1 not straight away object is destroyed
    decreaseHealth(hitPoint) {
        Dude.particleSystem.emitter = hitPoint;
        this.health--;
        Dude.particleSystem.start();
        setTimeout(function () {
            Dude.particleSystem.stop();
        }, 300);
        if (this.health <= 0) {
            this.gotKilled();
        }

    }

	// to check wether dude is killed or not
    gotKilled() {
        scene.assets["dieSound"].play();
        Dude.particleSystem.emitter = this.bounder.position;
        console.log(this.bounder);
        Dude.particleSystem.emitRate = 2000;
		console.log("hitting dude");
		
		//scoring function taking in the score variable and incrementing it by 1 every time duded gets killed
		text('Score: ' + Math.floor(score++), '30px Exo', 10, 30, "#FF0000");
	
        Dude.particleSystem.minEmitBox = new BABYLON.Vector3(-1, 0, -1);
        Dude.particleSystem.maxEmitBox = new BABYLON.Vector3(1, 0, 1);

        // Direction of each particle after it has been emitted
        Dude.particleSystem.direction1 = new BABYLON.Vector3(0, 1, 0);
        Dude.particleSystem.direction2 = new BABYLON.Vector3(0, -1, 0);

        Dude.particleSystem.start();
		
        setTimeout(function () {
            Dude.particleSystem.stop();
        }, 300);

        this.bounder.dispose();
        this.dudeMesh.dispose();
    }

}


// function how to start game //
function startGame() {
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();
    modifySettings();
	
    var tank = scene.getMeshByName("heroTank");
    scene.toRender = function () {
        tank.move(); // moving tank
        tank.fireCannonBalls(); // fire canFireCannonBalls
        tank.fireLaserBeams(); // fireLaserBeams
        moveHeroDude(); // move the enemies
        moveOtherDudes(); // move the clone of main enemy
        scene.render(); // rendering scene on canvas
    }
// loading the asset manager
    scene.assetsManager.load();
}

// following is generic in all canvas hence don't need explaination
var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    scene.assetsManager = configureAssetsManager(scene);
    scene.enablePhysics();
    var ground = CreateGround(scene);
    var freeCamera = createFreeCamera(scene);
    var tank = createTank(scene);
    var followCamera = createFollowCamera(scene, tank);
    scene.activeCamera = followCamera;
    createLights(scene);
    createHeroDude(scene);
    loadSounds(scene);
    return scene;
};

// creating ground from the height map provided //
function CreateGround(scene) {
	var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "images/hmap2.jpg", 200, 200, 250, 0, 10, scene, false, OnGroundCreated);
    console.log(ground);
    function OnGroundCreated() {
        var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("images/grass.jpg", scene);
        ground.material = groundMaterial;
        ground.checkCollisions = true;
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground,
            BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0 }, scene);
    }
    return ground;
}

function createLights(scene) {
    var light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-.1, -1, 0), scene);
    var light1 = new BABYLON.DirectionalLight("dir1", new BABYLON.Vector3(-1, -1, 0), scene);

}
//==================================================================/
/////Load sound ///
function loadSounds(scene)
{
    var assetsManager = scene.assetsManager;
    //sound file in babylon //
	var binaryTask = assetsManager.addBinaryFileTask("laserSound", "/sounds/laser.wav");
    binaryTask.onSuccess = function (task) {
        scene.assets["laserSound"] = new BABYLON.Sound("laser", task.data, scene, null, { loop: false });
    }

    binaryTask = assetsManager.addBinaryFileTask("cannonSound", "/sounds/cannon.wav");
    binaryTask.onSuccess = function (task) {
        scene.assets["cannonSound"] = new BABYLON.Sound("cannon", task.data, scene, null, { loop: false });
    }

    binaryTask = assetsManager.addBinaryFileTask("dieSound", "/sounds/die.wav");
    binaryTask.onSuccess = function (task) {
        scene.assets["dieSound"] = new BABYLON.Sound("die", task.data, scene, null, { loop: false });
    }
}
//=============================================================//
function configureAssetsManager(scene)
{
    scene.assets = {};
    var assetsManager = new BABYLON.AssetsManager(scene);
    assetsManager.onProgress = function (remainingCount, totalCount, lastFinishedTask) {
        engine.loadingUIText = 'We are loading the scene. ' + remainingCount + ' out of ' + totalCount + ' items still need to be loaded.';
    };

    assetsManager.onFinish = function (tasks) {
        engine.runRenderLoop(function () {
            scene.toRender();
        });
    };

    return assetsManager;
}

// creating camera which will rotate around
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

// camera following the tank
function createFollowCamera(scene, target) {
    var camera = new BABYLON.FollowCamera("tankFollowCamera", target.position, scene, target);
    camera.radius = 20; // how far from the object to follow
    camera.heightOffset = 4; // how high above the object to place the camera
    camera.rotationOffset = 180; // the viewing angle
    camera.cameraAcceleration = .1; // how fast to move
    camera.maxCameraSpeed = 5; // speed limit
    return camera;
}

// creating the tank
function createTank(scene) {
    var tank = new BABYLON.MeshBuilder.CreateBox("heroTank", { height: 3, depth: 5, width: 6 }, scene);
    var tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
    tankMaterial.diffuseColor = new BABYLON.Color3.Red;
    tankMaterial.emissiveColor = new BABYLON.Color3.Blue;
    tank.material = tankMaterial;
    tank.position.y += 2;
    tank.speed = 1;
    tank.frontVector = new BABYLON.Vector3(0, 0, 1);
    tank.canFireCannonBalls = true;
    tank.canFireLaser = true;
    //tank.isPickable = false;

	// tank move function
    tank.move = function () {
        var yMovement = 0;
        if (tank.position.y > 2) {
            tank.moveWithCollisions(new BABYLON.Vector3(0, -2, 0));
        }

        if (isWPressed) {
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(tank.speed, tank.speed, tank.speed));
        }
        if (isSPressed) {
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(-1 * tank.speed, -1 * tank.speed, -1 * tank.speed));
        }
        if (isAPressed) {
            tank.rotation.y -= .1;
            tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y))
        }
        if (isDPressed) {
            tank.rotation.y += .1;
            tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y))

        }


    }


	// cannon ball fire function
    tank.fireCannonBalls = function () {

        var tank = this;
        if (!isBPressed) return;
        if (!tank.canFireCannonBalls) return;
        tank.canFireCannonBalls = false;

		// cannon ball disappear after while
        setTimeout(function () {
            tank.canFireCannonBalls = true;
        }, 500);

        scene.assets["cannonSound"].play();

        var cannonBall = new BABYLON.Mesh.CreateSphere("cannonBall", 32, 2, scene);
        cannonBall.material = new BABYLON.StandardMaterial("Fire", scene);
        cannonBall.material.diffuseTexture = new BABYLON.Texture("images/Fire.jpg", scene);


        var pos = tank.position;

        cannonBall.position = new BABYLON.Vector3(pos.x, pos.y + 1, pos.z);
        cannonBall.position.addInPlace(tank.frontVector.multiplyByFloats(5, 5, 5));

        cannonBall.physicsImpostor = new BABYLON.PhysicsImpostor(cannonBall,
        BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1 }, scene);
        var fVector = tank.frontVector;
        var force = new BABYLON.Vector3(fVector.x * 100, (fVector.y + .1) * 100, fVector.z * 100);
        cannonBall.physicsImpostor.applyImpulse(force, cannonBall.getAbsolutePosition());

        cannonBall.actionManager = new BABYLON.ActionManager(scene);

        scene.dudes.forEach(function (dude) {
            cannonBall.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
        {
            trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
            parameter: dude.Dude.bounder
        },
        function () {

            if (dude.Dude.bounder._isDisposed) return;
            dude.Dude.gotKilled();

        }
        ));

        });

        setTimeout(function () {

            cannonBall.dispose();
        }, 3000);
    }

	// laser beam fire function
    tank.fireLaserBeams = function () {
        var tank = this;
        if (!isRPressed) return;
        if (!tank.canFireLaser) return;
        tank.canFireLaser = false;

		// laser disappear after shooting
        setTimeout(function () {
            tank.canFireLaser = true;
        }, 500);

        scene.assets["laserSound"].play();
        var origin = tank.position;
        var direction = new BABYLON.Vector3(tank.frontVector.x, tank.frontVector.y + .1, tank.frontVector.z);

        var ray = new BABYLON.Ray(origin, direction, 1000);
        var rayHelper = new BABYLON.RayHelper(ray);
        rayHelper.show(scene, new BABYLON.Color3.Red);

        setTimeout(function () {
            rayHelper.hide(ray)
        }, 200);

        var pickInfos = scene.multiPickWithRay(ray, function (mesh) {
            if (mesh.name == "heroTank") return false;
            return true;
        }
        );




        for (var i = 0 ; i < pickInfos.length ; i++) {
            var pickInfo = pickInfos[i];
            if (pickInfo.pickedMesh) {
                if (pickInfo.pickedMesh.name.startsWith("bounder")) {

                    pickInfo.pickedMesh.dudeMesh.Dude.decreaseHealth(pickInfo.pickedPoint);
                }

                else if (pickInfo.pickedMesh.name.startsWith("clone")) {
                    pickInfo.pickedMesh.parent.Dude.decreaseHealth(pickInfo.pickedPoint);

                }
            }
        }
    }
    return tank;
}

// main enemey created
function createHeroDude(scene) {

    var meshTask = scene.assetsManager.addMeshTask("DudeTask", "him", "Dude/", "Dude.babylon");
    meshTask.onSuccess = function (task) {
        onDudeImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons);
        function onDudeImported(newMeshes, particleSystems, skeletons) {
            newMeshes[0].position = new BABYLON.Vector3(0, 0, 5);  // The original dude
            newMeshes[0].name = "heroDude";
            var heroDude = newMeshes[0];

            for (var i = 1 ; i < heroDude.getChildren().length ; i++) {
                console.log(heroDude.getChildren()[i].name);
                heroDude.getChildren()[i].name = "clone_".concat(heroDude.getChildren()[i].name);
                console.log(heroDude.getChildren()[i].name);
            }
            scene.beginAnimation(skeletons[0], 0, 120, true, 1.0);
            var hero = new Dude(heroDude, 2, -1, scene, .2);

            scene.dudes = [];
            scene.dudes[0] = heroDude;
            for (var q = 1 ; q <= 10 ; q++) {
                scene.dudes[q] = DoClone(heroDude, skeletons, q);
                scene.beginAnimation(scene.dudes[q].skeleton, 0, 120, true, 1.0);
                var temp = new Dude(scene.dudes[q], 2, q, scene, .2);

            }

        }
    }


    function onDudeImported(newMeshes, particleSystems, skeletons) {
        newMeshes[0].position = new BABYLON.Vector3(0, 0, 5);  // The original dude
        newMeshes[0].name = "heroDude";
        var heroDude = newMeshes[0];

        for (var i = 1 ; i < heroDude.getChildren().length ; i++) {
            console.log(heroDude.getChildren()[i].name);
            heroDude.getChildren()[i].name = "clone_".concat(heroDude.getChildren()[i].name);
            console.log(heroDude.getChildren()[i].name);
        }
        scene.beginAnimation(skeletons[0], 0, 120, true, 1.0);
        var hero = new Dude(heroDude, 2, -1, scene, .2);

        scene.dudes = [];
        scene.dudes[0] = heroDude;
        for (var q = 1 ; q <= 10 ; q++) {
            scene.dudes[q] = DoClone(heroDude, skeletons, q);
            scene.beginAnimation(scene.dudes[q].skeleton, 0, 120, true, 1.0);
            var temp = new Dude(scene.dudes[q], 2, q, scene, .2);

        }

    }
}


//cloning of enemy from main enemy
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
            if (skeletons.length == 1)// this means one skeleton controlling/animating all the children
            {
                var clonedSkeleton = skeletons[0].clone("clone_" + id + "_skeleton");
                myClone.skeleton = clonedSkeleton;
                var numChildren = myClone.getChildren().length;
                for (var i = 0 ; i < numChildren ; i++) {
                    myClone.getChildren()[i].skeleton = clonedSkeleton;
                }
                return myClone;
            }
            else if (skeletons.length == original.getChildren().length) { // Most probably each child has its own skeleton
                for (var i = 0 ; i < myClone.getChildren().length; i++) {
                    myClone.getChildren()[i].skeleton = skeletons[i].clone("clone_" + id + "_skeleton_" + i);
                }
                return myClone;
            }
        }
    }

    return myClone;
}

// moving main enemy
function moveHeroDude() {
    var heroDude = scene.getMeshByName("heroDude");
    if (heroDude)
        heroDude.Dude.move();
}

// moving clone enemies
function moveOtherDudes() {
    if (scene.dudes) {
        for (var q = 0 ; q < scene.dudes.length ; q++) {
            scene.dudes[q].Dude.move();
        }
    }
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

// function for score canvas
function text(txt, fnt, x, y, c) {
	canvas = document.getElementById("renderCanvas2");
	context = canvas.getContext('2d')
	context.fillStyle = c;
	context.font = fnt;
	context.clearRect(50,0,80,100);
	context.fillText(txt, x, y);
}


// checking key presses on keyboard
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
    }
    if (event.key == 'r' || event.key == 'R') {
        isRPressed = true;
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
    if (event.key == 'r' || event.key == 'R') {
        isRPressed = false;
    }

});
