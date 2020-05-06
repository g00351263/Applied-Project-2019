//Authour: Raja Naseer Ahmed Khan
//Applied Project 2020

var htmlDrawBox;
var engine;

// game object to store multiple games
var Game = {};
var enemies = {};

//variables to store which key is pressed or not //
var moveForwardW = false;
var moveBackwardS = false;
var moveLeftA = false;
var moveRightD = false;
var fireBallB = false;
var fireRayR = false;
var fPressed = false;
var xPressed = false;
// score variable global
var score = 0;

// seperate canvas 2d for showing score canvas
var context;
document.addEventListener("DOMContentLoaded", startGame);


// game which will store multiple scenes
Game.scenes = {};

// setting the active scene to 0
Game.activeScene = 0;

//this is the class to create the object of animated character
class AnimatedPlayer {
    constructor(animatedPlayerMesh, movement, id, scene, scaling) {
        this.animatedPlayerMesh = animatedPlayerMesh;
        this.id = id;
        this.scene = scene;
        this.health = 3; // assigning the 3 hit to destroy health
        this.frontVector = new BABYLON.Vector3(0, 0, -1);
        animatedPlayerMesh.AnimatedPlayer = this;

        if (movement)
            this.movement = movement;
        else
            this.movement = 1;

        if (scaling) {
            this.scaling = scaling;
            this.animatedPlayerMesh.scaling = new BABYLON.Vector3(this.scaling, this.scaling, this.scaling);
        }
        else
            this.scaling = 1; // size of the animated character

        if (AnimatedPlayer.boundingBoxParameters == undefined) { // box around the animated character
            AnimatedPlayer.boundingBoxParameters = this.collisionBoxDimension();
        }
		
				// if each AnimatedPlayer shows undefined error this will load the particle system to avoid the error//
        if (AnimatedPlayer.particleSystem == undefined) {
            AnimatedPlayer.particleSystem = this.characterHitAnimation();
        }

        this.imaginaryBox = this.collisionBox();
        this.imaginaryBox.animatedPlayerMesh = this.animatedPlayerMesh;
    }

    // a camera following the the tank
    enenmyChasing() {
        var scene = this.scene;
        if (!this.imaginaryBox) return;
        this.animatedPlayerMesh.position = new BABYLON.Vector3(this.imaginaryBox.position.x,
            this.imaginaryBox.position.y - this.scaling * AnimatedPlayer.boundingBoxParameters.lengthY / 2.0, this.imaginaryBox.position.z);
        var tank = scene.getMeshByName("heroTank");
        var direction = tank.position.subtract(this.animatedPlayerMesh.position);
        var distance = direction.length();
        var dir = direction.normalize();
        var alpha = Math.atan2(-1 * dir.x, -1 * dir.z);
        this.animatedPlayerMesh.rotation.y = alpha;
        this.animatedPlayerMesh.enablePhysics = true;
        if (distance > 30)
            this.imaginaryBox.moveWithCollisions(dir.multiplyByFloats(this.movement, this.movement, this.movement));
    }

    // a camerafollowing the animated character as visible in firs person shooter game
    animatedPlayerShoot() {
        var scene = this.scene;
        scene.activeCamera = scene.activeCameras[0];
        if (scene.activeCamera != scene.followCameraDude && scene.activeCamera != scene.freeCameraDude) {
            this.animatedPlayerMesh.animatableObject.pause();
            return;
        }
        if (moveForwardW || moveBackwardS) {
            this.animatedPlayerMesh.animatableObject.restart();
        }
        else {
            this.animatedPlayerMesh.animatableObject.pause();
        }

        if (scene.activeCamera == scene.followCameraDude) {
            if (!this.imaginaryBox) return;
            this.adjustYPosition();
            this.adjustXZPosition();

            var direction = this.frontVector;
            var dir = direction.normalize();
            var alpha = Math.atan2(-1 * dir.x, -1 * dir.z);
            this.animatedPlayerMesh.rotation.y = alpha;
            if (moveForwardW) {
                this.imaginaryBox.moveWithCollisions(this.frontVector.multiplyByFloats(this.movement, this.movement, this.movement));
            }

            if (moveBackwardS) {
                this.imaginaryBox.moveWithCollisions(this.frontVector.multiplyByFloats(-1 * this.movement, -1 * this.movement, -1 * this.movement));
            }
            if (moveRightD) {
                var alpha = this.animatedPlayerMesh.rotation.y;
                alpha += .1;
                this.frontVector = new BABYLON.Vector3(-1 * Math.sin(alpha), 0, -1 * Math.cos(alpha));
            }

            if (moveLeftA) {
                var alpha = this.animatedPlayerMesh.rotation.y;
                alpha -= .1;
                this.frontVector = new BABYLON.Vector3(-1 * Math.sin(alpha), 0, -1 * Math.cos(alpha));
            }

            scene.freeCameraDude.position.x = this.imaginaryBox.position.x;
            scene.freeCameraDude.position.z = this.imaginaryBox.position.z;
            scene.freeCameraDude.position.y = groundHeight + this.scaling * AnimatedPlayer.boundingBoxParameters.lengthY + .2;
            scene.freeCameraDude.setTarget(scene.freeCameraDude.position.add(this.frontVector));
        }
        else if (scene.activeCamera == scene.freeCameraDude) {
            var groundHeight = this.adjustYPosition();
            this.adjustXZPosition();
            scene.freeCameraDude.position.y = groundHeight + this.scaling * AnimatedPlayer.boundingBoxParameters.lengthY + .2;
            var cameraFront = scene.freeCameraDude.getTarget().subtract(scene.freeCameraDude.position).normalize();
            this.frontVector = cameraFront;
            var dir = this.frontVector;
            var alpha = Math.atan2(-1 * dir.x, -1 * dir.z);
            this.animatedPlayerMesh.rotation.y = alpha;

            this.imaginaryBox.position.x = scene.freeCameraDude.position.x - this.frontVector.x * 1.9;
            this.imaginaryBox.position.z = scene.freeCameraDude.position.z - this.frontVector.z * 1.9;
        }

    }
	
	// gun fire for animated character
    fireGun() {
        var scene = this.scene;
        scene.assets["gunSound"].play(); // assent manager playing shooting 
        var width = scene.getEngine().getRenderWidth();
        var height = scene.getEngine().getRenderHeight();
        var pickInfo = scene.pick(width / 4, height / 2, null, false, scene.activeCameras[0]);

        if (pickInfo.pickedMesh) {
            if (pickInfo.pickedMesh.name.startsWith("imaginaryBox")) {

                pickInfo.pickedMesh.animatedPlayerMesh.AnimatedPlayer.decreaseHealth(pickInfo.pickedPoint);
            }

            else if (pickInfo.pickedMesh.name.startsWith("clone")) {
                //console.log("cloone");
                pickInfo.pickedMesh.parent.AnimatedPlayer.decreaseHealth(pickInfo.pickedPoint);

            }
        }
    }
    adjustYPosition() {
        var scene = this.scene;
        var origin = new BABYLON.Vector3(this.animatedPlayerMesh.position.x, 1000, this.animatedPlayerMesh.position.z);
        var direction = new BABYLON.Vector3(0, -1, 0);
        var ray = new BABYLON.Ray(origin, direction, 10000);
        var pickInfo = scene.pickWithRay(ray, function (mesh) {
            if (mesh.name == "ground") return true;
            return false;
        });
        if (!pickInfo.pickedPoint) return 0;
        var groundHeight = pickInfo.pickedPoint.y;
        this.animatedPlayerMesh.position.y = groundHeight;
        this.imaginaryBox.position.y = groundHeight + this.scaling * AnimatedPlayer.boundingBoxParameters.lengthY / 2.0;

        return groundHeight;
    }

    adjustXZPosition() {
        this.animatedPlayerMesh.position.x = this.imaginaryBox.position.x;
        this.animatedPlayerMesh.position.z = this.imaginaryBox.position.z;
    }

			//creating the transparent box around the character to detect collision and stop them from striking each others//
    collisionBox() {
        var scene = this.scene;
        var lengthX = AnimatedPlayer.boundingBoxParameters.lengthX;
        var lengthY = AnimatedPlayer.boundingBoxParameters.lengthY;
        var lengthZ = AnimatedPlayer.boundingBoxParameters.lengthZ;
        new BABYLON.Quaternion
        var imaginaryBox = new BABYLON.Mesh.CreateBox("imaginaryBox" + (this.id).toString(), 1, this.scene);

        imaginaryBox.scaling.x = lengthX * this.scaling;
        imaginaryBox.scaling.y = lengthY * this.scaling;
        imaginaryBox.scaling.z = lengthZ * this.scaling * 2;

        imaginaryBox.isVisible = false;

        var bounderMaterial = new BABYLON.StandardMaterial("bounderMaterial", this.scene);
        bounderMaterial.alpha = .5;
        imaginaryBox.material = bounderMaterial;
        imaginaryBox.checkCollisions = true;


        imaginaryBox.position = new BABYLON.Vector3(this.animatedPlayerMesh.position.x, this.animatedPlayerMesh.position.y
             + this.scaling * lengthY / 2, this.animatedPlayerMesh.position.z);


        return imaginaryBox;
    }
	
	// counting the imaginary box dimensiona round the animated playr
    collisionBoxDimension() {
        var minX = 999999; var minY = 99999; var minZ = 999999;
        var maxX = -99999; var maxY = -999999; var maxZ = -99999;

        var children = this.animatedPlayerMesh.getChildren();

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
	
	// creating the particle system, means animation to show when hit i.e blood and flare //
    characterHitAnimation() {
        var scene = this.scene;
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
	// this functions decreases by 1 each time hit by ball or cannon, which stops system to destroy on 1 hit//
    decreaseHealth(hitPoint) {
        AnimatedPlayer.particleSystem.emitter = hitPoint;
        this.health--;// each time its getting hit reducing the health by 1, which is set to 3
        AnimatedPlayer.particleSystem.start();
        setTimeout(function () {
            AnimatedPlayer.particleSystem.stop();// setting the timeout for particles to disappear, otherwise blood/flare will stay toget the object//
        }, 300);
        if (this.health <= 0) {
            this.hit();// this will kill the object once health is 0
        }

    }
	// function to destroy object once health is 0//
	// https://docs.babylonjs.com/babylon101/particles or search babylon js particles system //
    hit() {
        var scene = this.scene;
        scene.assets["dieSound"].play();

        AnimatedPlayer.particleSystem.emitter = this.imaginaryBox.position;// getting hit and showing particles
        //console.log(this.imaginaryBox);
        AnimatedPlayer.particleSystem.emitRate = 2000; // setting the particle quantity to show on screen

				//scoring function taking in the score variable and incrementing it by 1 every time duded gets killed
		scoreCar(Game.activeScene,'Score: ' + Math.floor(score++), '30px Exo', 10, 30, "#FF0000");
		        // Direction of each particle after it has been emitted
        AnimatedPlayer.particleSystem.minEmitBox = new BABYLON.Vector3(-1, 0, -1);
        AnimatedPlayer.particleSystem.maxEmitBox = new BABYLON.Vector3(1, 0, 1);

        // Direction of each particle after it has been emitted
        AnimatedPlayer.particleSystem.direction1 = new BABYLON.Vector3(0, 1, 0);
        AnimatedPlayer.particleSystem.direction2 = new BABYLON.Vector3(0, -1, 0);

        AnimatedPlayer.particleSystem.start();
        setTimeout(function () {
            AnimatedPlayer.particleSystem.stop();
        }, 300);

        this.imaginaryBox.dispose();
        this.animatedPlayerMesh.dispose();
    }

}
//////////////////////////////////////
///////////////////////////////////
// this starts game and render the all the elements in game //
function startGame() {
    htmlDrawBox = document.getElementById("renderCanvas");
    htmlDrawBox.style.width = "1200px";
    htmlDrawBox.style.height = "800px";
    engine = new BABYLON.Engine(htmlDrawBox, true);
    //htmlDrawBox.style.width = '100%';
    //htmlDrawBox.style.height = '100%';
    theScene1();
}

// this is the first scene to be loaded as level 1
var theScene1 = function()
{
	
	// pushing the first scene into array and create scene there
    Game.scenes[Game.activeScene] = buildSceneOne();
	
	// this scene will be active scene
    var scene = Game.scenes[Game.activeScene];
    modifySettings(scene);
    var tank = scene.getMeshByName("heroTank");
    var cr = scene.getMeshByName("cross");
	scene.toRender = function () {
        tank.move();
		cr.move(scene);
        tank.fireCannonBalls(scene);
        tank.fireLaserBeams(scene);
        moveHeroDude(scene);
        animateEnemy(scene);
        scene.render();
    }

    scene.assetsManager.load();
}

// this will create the scene
var buildSceneOne = function () {

    var scene = new BABYLON.Scene(engine);
    scene.assetsManager = configureAssetsManager(scene);
    scene.enablePhysics();
    var ground = CreateGround(scene);
    var tank = createTank(scene);
	 var cr = scene.getMeshByName("cross");
    var portal = changeWorldScene(scene, tank);
    scene.followCameraTank = createFollowCamera(scene, tank);
    scene.followCameraTank.viewport = new BABYLON.Viewport(0, 0, .5, 1);
    createLights(scene);
    buildAnimatedPlayer(scene);
    loadSounds(scene);

		    BABYLON.SceneLoader.ImportMesh("Rabbit", "Dude/", "Rabbit.babylon", scene, function (meshes) {  
   			
        scene.createDefaultCameraOrLight(true, true, true);
        scene.createDefaultEnvironment();

		
    });
	


QuickTreeGenerator = function(sizeBranch, sizeTrunk, radius, trunkMaterial, leafMaterial, scene) {

    var tree = new BABYLON.Mesh("tree", scene);
    tree.isVisible = false;
    
    var leaves = new BABYLON.Mesh("leaves", scene);
    
    //var vertexData = BABYLON.VertexData.CreateSphere(2,sizeBranch); //this line for BABYLONJS2.2 or earlier
    var vertexData = BABYLON.VertexData.CreateSphere({segments:2, diameter:sizeBranch}); //this line for BABYLONJS2.3 or later
    
    vertexData.applyToMesh(leaves, false);

    var positions = leaves.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    var indices = leaves.getIndices();
    var numberOfPoints = positions.length/3;

    var map = [];

    // The higher point in the sphere
    var v3 = BABYLON.Vector3;
    var max = [];

    for (var i=0; i<numberOfPoints; i++) {
        var p = new v3(positions[i*3], positions[i*3+1], positions[i*3+2]);

        if (p.y >= sizeBranch/2) {
            max.push(p);
        }

        var found = false;
        for (var index=0; index<map.length&&!found; index++) {
            var array = map[index];
            var p0 = array[0];
            if (p0.equals (p) || (p0.subtract(p)).lengthSquared() < 0.01){
                array.push(i*3);
                found = true;
            }
        }
        if (!found) {
            var array = [];
            array.push(p, i*3);
            map.push(array);
        }

    }
    var randomNumber = function (min, max) {
        if (min == max) {
            return (min);
        }
        var random = Math.random();
        return ((random * (max - min)) + min);
    };

    map.forEach(function(array) {
        var index, min = -sizeBranch/10, max = sizeBranch/10;
        var rx = randomNumber(min,max);
        var ry = randomNumber(min,max);
        var rz = randomNumber(min,max);

        for (index = 1; index<array.length; index++) {
            var i = array[index];
            positions[i] += rx;
            positions[i+1] += ry;
            positions[i+2] += rz;
        }
    });

    leaves.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
    var normals = [];
    BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    leaves.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
    leaves.convertToFlatShadedMesh();
    
    leaves.material = leafMaterial;
    leaves.position.y = sizeTrunk+sizeBranch/2-2;
    

    var trunk = BABYLON.Mesh.CreateCylinder("trunk", sizeTrunk, radius-2<1?1:radius-2, radius, 10, 2, scene );
    
    trunk.position.y = (sizeBranch/2+2)-sizeTrunk/2;

    trunk.material = trunkMaterial;
    trunk.convertToFlatShadedMesh();
    
    leaves.parent = tree;
    trunk.parent = tree;
    return tree;

};
    var treeMaterial = new BABYLON.StandardMaterial("grass", scene);
       treeMaterial.diffuseTexture = new BABYLON.Texture("images/grass.jpg", scene);


	var tree = QuickTreeGenerator(20, 15, 5, treeMaterial, treeMaterial, scene);

	tree.position.z = 100;
	tree.position.x = 30;
	
	    // Skybox
    // Skybox
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("images/TropicalSunnyDay", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
	
	

	

    return scene;
};

var theSceneTwo = function () {
    //console.log("ActiveScene is : " + Game.activeScene);
    Game.scenes[Game.activeScene] = createSecondScene();
    var scene = Game.scenes[Game.activeScene];
    modifySettings(scene);
    var tank = scene.getMeshByName("heroTank");
	 var cr = scene.getMeshByName("cross");
    scene.toRender = function () {
        tank.move();
        tank.fireCannonBalls(scene);
        tank.fireLaserBeams(scene);
        moveHeroDude(scene);
        animateEnemy(scene);
        scene.render();
    }

    scene.assetsManager.load();
}

var createSecondScene = function () {

    var scene = new BABYLON.Scene(engine);
    scene.assetsManager = configureAssetsManager(scene);
    scene.enablePhysics();
    var ground = CreateGround(scene);
    var tank = createTank(scene);
    var portal = changeWorldScene(scene, tank);
    scene.followCameraTank = createFollowCamera(scene, tank);
    scene.followCameraTank.viewport = new BABYLON.Viewport(0, 0, .5, 1);
    createLights(scene);
    buildAnimatedPlayer(scene);
    loadSounds(scene);
	
	
	    // Skybox
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("images/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    return scene;
};

// this is creating the ground //
function CreateGround(scene) {
    //var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    ///////////
	    // Ground
    var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture("images/dry.jpg", scene);

    var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "images/map2.jpg", 500, 500, 64, 0,25, scene, false);
    ground.material = groundMaterial;
	        ground.checkCollisions = true;

//////////////
    //var ground = new BABYLON.Mesh.CreateGroundFromHeightMap("ground", "images/hmap2.jpg", 2000, 2000, 60, 0, 10, scene, false, OnGroundCreated);
    //console.log(ground);
    ground.material = groundMaterial;
    function OnGroundCreated() {
        
        if(Game.activeScene%3 == 0)
            groundMaterial.diffuseTexture = new BABYLON.Texture("images/grass2.jpg", scene);
        else if(Game.activeScene%3 == 1)
            groundMaterial.diffuseTexture = new BABYLON.Texture("images/dry.jpg", scene);
        else if(Game.activeScene %3 == 2)
            groundMaterial.diffuseTexture = new BABYLON.Texture("images/grass.jpg", scene);

        ground.material = groundMaterial;
        ground.checkCollisions = true;
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground,
            BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0 }, scene);
    }
    return ground;
}

// creating lights to make things visible//
function createLights(scene) {
    var light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-.1, -1, 0), scene);
    var light1 = new BABYLON.DirectionalLight("dir1", new BABYLON.Vector3(-1, -1, 0), scene);

}

function loadSounds(scene) {
    var assetsManager = scene.assetsManager;
    var binaryTask = assetsManager.addBinaryFileTask("laserSound", "sounds/laser.wav");
    binaryTask.onSuccess = function (task) {
        scene.assets["laserSound"] = new BABYLON.Sound("laser", task.data, scene, null, { loop: false });
    }

    binaryTask = assetsManager.addBinaryFileTask("cannonSound", "sounds/cannon.wav");
    binaryTask.onSuccess = function (task) {
        scene.assets["cannonSound"] = new BABYLON.Sound("cannon", task.data, scene, null, { loop: false });
    }

    binaryTask = assetsManager.addBinaryFileTask("dieSound", "sounds/die.wav");
    binaryTask.onSuccess = function (task) {
        scene.assets["dieSound"] = new BABYLON.Sound("die", task.data, scene, null, { loop: false });
    }
    binaryTask = assetsManager.addBinaryFileTask("shotSound", "sounds/shot.wav");
    binaryTask.onSuccess = function (task) {
        scene.assets["gunSound"] = new BABYLON.Sound("gun", task.data, scene, null, { loop: false });
    }

}

function loadCrossHair(scene) {
    var impact = BABYLON.Mesh.CreateBox("box", .01, scene);

    var freeCamera = scene.freeCameraDude;
    freeCamera.minZ = .1;
    impact.parent = freeCamera;
    impact.position.z += .2;
    impact.isPickable = false;
    impact.material = new BABYLON.StandardMaterial("target", scene);
    impact.material.diffuseTexture = new BABYLON.Texture("images/gunaims.png", scene);
    impact.material.diffuseTexture.hasAlpha = true;
}
function configureAssetsManager(scene) {
    scene.assets = {};
    var assetsManager = new BABYLON.AssetsManager(scene);
    scene.assetsManager = assetsManager;
    assetsManager.onProgress = function (remainingCount, totalCount, lastFinishedTask) {
        engine.loadingUIText = 'We are loading the scene. ' + remainingCount + ' out of ' + totalCount + ' items still need to be loaded.';
    };

    assetsManager.onFinish = function (tasks) {
        if (Game.activeScene > 0) {
            Game.scenes[Game.activeScene - 1].dispose();
        }
        engine.runRenderLoop(function () {
            Game.scenes[Game.activeScene].toRender();
        });
    };

    return assetsManager;
}

//camera to view camera the games/scene//
function createFreeCamera(scene, initialPosition) {
    var camera = new BABYLON.FreeCamera("freeCamera", initialPosition, scene);
    camera.attachControl(htmlDrawBox);
    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(.1, .1, .1);
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

//camera following the player //
function createFollowCamera(scene, target) {

    var camera = new BABYLON.FollowCamera(target.name + "FollowCamera", target.position, scene, target);
    if (target.name == "heroTank") {

        camera.radius = 20; // how far from the object to follow
        camera.heightOffset = 4; // how high above the object to place the camera
        camera.rotationOffset = 180; // the viewing angle

    }
    else {
        camera.radius = 40;
        camera.heightOffset = 10; // how high above the object to place the camera
        camera.rotationOffset = 0; // the viewing angle
    }


    camera.cameraAcceleration = .1; // how fast to move
    camera.maxCameraSpeed = 5; // movement limit
    return camera;
}
function createArcRotateCamera(scene,target)
{
    var camera = new BABYLON.ArcRotateCamera("arc", 0, 1, 50, target, scene);
    return camera;
}
function animateArcRotateCamera(camera)
{
    var animationRotateAlpha = new BABYLON.Animation("myAnimation", "alpha", 10, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var animationRotateBeta = new BABYLON.Animation("myAnimation", "beta", 10, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var animationElongateRadius = new BABYLON.Animation("myAnimation", "radius", 10, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    var alphaKeys = [];
    alphaKeys.push({ frame: 0, value: 0 });
    alphaKeys.push({ frame: 50, value: Math.PI });
    alphaKeys.push({ frame: 100, value: 2 * Math.PI });
    animationRotateAlpha.setKeys(alphaKeys);

    var betaKeys = [];
    betaKeys.push({ frame: 0, value: Math.PI / 4 });
    betaKeys.push({ frame: 50, value: Math.PI / 2 });
    betaKeys.push({ frame: 100, value: Math.PI / 4 });
    animationRotateBeta.setKeys(betaKeys);

    var radiusKeys = [];
    radiusKeys.push({ frame: 0, value: 40 });
    radiusKeys.push({ frame: 50, value: 80 });
    radiusKeys.push({ frame: 100, value: 40 });
    animationElongateRadius.setKeys(radiusKeys);

    camera.animations = [];
    camera.animations.push(animationRotateAlpha);
    camera.animations.push(animationRotateBeta);
    camera.animations.push(animationElongateRadius);

    scene.beginAnimation(camera, 0, 100, true);

}

// creating the tank //
function createTank(scene, data) {
    
	var mat = new BABYLON.StandardMaterial("mat", scene);
    var texture = new BABYLON.Texture("http://jerome.bousquie.fr/BJS/images/spriteAtlas.png", scene);
    mat.diffuseTexture = texture;
	
	
    var columns = 6;  // 6 columns
    var rows = 4;  // 4 rows

    var faceUV = new Array(6);

    faceUV[1] = new BABYLON.Vector4(3 / columns, 0, (3 + 1) / columns, 1 / rows);

    var options = {
        width: 6,
        height: 1,
        depth: 6,
        faceUV: faceUV
    };
///////////////////////
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
    var tank = BABYLON.MeshBuilder.ExtrudeShapeCustom("heroTank", {shape: myShape, path: myPath, scaleFunction: scaling, sideOrientation: BABYLON.Mesh.DOUBLESIDE, updatable: true}, scene);
    
    var scaling2 = function(i, distance) {
       return 1 + 0.2*distance;
    };
    
    var rotation = function(i, distance) {
       return distance * Math.PI / 108;
    };	

///////////////
	//var tank = new BABYLON.MeshBuilder.CreateBox("heroTank", options, scene);
    
	var cros = new BABYLON.MeshBuilder.CreateBox("cross",  {height: 0, width: .1, depth: .1}, scene);
	cros.isPickable = false;
	cros.material = new BABYLON.StandardMaterial("dd", scene);	    
	cros.material.diffuseTexture = new BABYLON.Texture("images/gunaims.png", scene);
    cros.material.diffuseTexture.hasAlpha = true;
	
	tank.position.z = 10;
	tank.position.x = 20;
	cros.position.z = +15;
	cros.position.x = +30;
	//var tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
    
    if(fPressed){
        tank.position.y += 2;
        console.log("f pressed");
    }

    if(xPressed){
        console.log("x Pressed");
        tank.position.y -=2;
    }
	
	//tankMaterial.diffuseColor = new BABYLON.Color3.Red;
    
	//tankMaterial.emissiveColor = new BABYLON.Color3.Blue;
    
	//tank.material = tankMaterial;
    tank.material = mat
	tank.position.y += 12;
    
	tank.movement = 1;
    
	tank.frontVector = new BABYLON.Vector3(0, 0, 1);
	
	cros.material = mat
	cros.position.y += 2;
    
	cros.movement = 1;
    
	cros.frontVector = new BABYLON.Vector3(0, 0, 1);
	
	tank.canFireCannonBalls = true;
    
	tank.canFireLaser = true;
	////////////////////
	
	//////////////////////
		// creating the tank move //
    tank.move = function () {	
        scene.activeCamera = scene.activeCameras[0];
        if (scene.activeCamera != scene.followCameraTank) {
            return;
        }
        var yMovement = 0;
        if (tank.position.y > 2) {
            tank.moveWithCollisions(new BABYLON.Vector3(0, -2, 0));
        }
				// move tank according to key press events//
        if (moveForwardW) {
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(tank.movement, tank.movement, tank.movement));
        }
		
		// car moving backward
        if (moveBackwardS) {
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(-1 * tank.movement, -1 * tank.movement, -1 * tank.movement));	       
        }
		// this thing counting the sin and cos to steer like car when turning left
        if (moveLeftA) {
            tank.rotation.y -= .1;
            tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y))
		}
		// this thing counting the sin and cos to steer like car when turning rigth
        if (moveRightD) {
            tank.rotation.y += .1;
            tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y))
        }
        if(fPressed){
            tank.position.y += 2;
        }
        if(xPressed){
            tank.position.y -=2;
        }

    }
	
	// this function make cross or aim in front of car
	cros.move = function (scene) {
	    this.scene = Game.activeScene;
        var pos = tank.position;

        cros.position = new BABYLON.Vector3(pos.x, pos.y + 3, pos.z);
        cros.position.addInPlace(tank.frontVector.multiplyByFloats(5, 5, 5));
    }
	// function to fire cannon balls //
    tank.fireCannonBalls = function (scene) {

        var tank = this;
        if (!fireBallB) return;
        if (!tank.canFireCannonBalls) return;
        tank.canFireCannonBalls = false;

			// function to disappear the cannon balls after 3 seconds//

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
            parameter: dude.AnimatedPlayer.imaginaryBox
        },
		
        function () {
				if (dude.AnimatedPlayer.imaginaryBox._isDisposed) return;
				dude.AnimatedPlayer.hit();
			}
        ));

        });

		// after 3 seconds it disappears the ball so it doesn't pile up on ground
        setTimeout(function () {
            cannonBall.dispose();
        }, 3000);
    }

			// function to fire laser beam //

    tank.fireLaserBeams = function (scene) {
        var tank = this;
        if (!fireRayR) return;
        if (!tank.canFireLaser) return;
        tank.canFireLaser = false;

						//function to disappear laser beam after 5 seconds//

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
                if (pickInfo.pickedMesh.name.startsWith("imaginaryBox")) {

                    pickInfo.pickedMesh.animatedPlayerMesh.AnimatedPlayer.decreaseHealth(pickInfo.pickedPoint);
                }

                else if (pickInfo.pickedMesh.name.startsWith("clone")) {
                    pickInfo.pickedMesh.parent.AnimatedPlayer.decreaseHealth(pickInfo.pickedPoint);

                }
            }
        }
		    

    }
    return tank;
}


// this is the teleportal which brings you to another world
function changeWorldScene(scene, hero)
{
    var portal = new BABYLON.Mesh.CreateCylinder("portal", 100, 100, 100, 24, 1, scene);
    portal.position.x += 200;
    portal.position.z += 200;
    portal.position.y += 50;
    portal.material = new BABYLON.StandardMaterial("portal", scene);
    portal.material.diffuseTexture = new BABYLON.Texture("images/lightning.jpg", scene);
    portal.material.diffuseTexture.uScale = 4;
    portal.material.emissiveColor = new BABYLON.Color3.Yellow;
    portal.actionManager = new BABYLON.ActionManager(scene);
    portal.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
{
    trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
    parameter: hero
},
function () {

    engine.stopRenderLoop();
    Game.activeScene = Game.activeScene +1;
    theSceneTwo();

}
));

    return portal;

}

//functions to create multiple enemies character//

function buildAnimatedPlayer(scene) {

    var mm = scene.assetsManager.addMeshTask("animatedPlayer", "him", "Dude/", "Dude.babylon");
    
	mm.onSuccess = function (task) {
        onDudeImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons);
        function onDudeImported(newMeshes, particleSystems, skeletons) {
            newMeshes[0].position = new BABYLON.Vector3(0, 0, 5);  // The original dude
            newMeshes[0].name = "aniCharacter";
            var aniCharacter = newMeshes[0];

            for (var i = 1 ; i < aniCharacter.getChildren().length ; i++) {
                //console.log(aniCharacter.getChildren()[i].name);
                aniCharacter.getChildren()[i].name = "clone_".concat(aniCharacter.getChildren()[i].name);
                //console.log(aniCharacter.getChildren()[i].name);
            }
            aniCharacter.animatableObject = scene.beginAnimation(skeletons[0], 0, 120, true, 1.0);
            var hero = new AnimatedPlayer(aniCharacter, 2, -1, scene, .2);
            scene.followCameraDude = createFollowCamera(scene, aniCharacter);
            scene.followCameraDude.viewport = new BABYLON.Viewport(0, 0, .5, 1);

            var freeCamPosition = new BABYLON.Vector3(aniCharacter.position.x,
                aniCharacter.position.y + AnimatedPlayer.boundingBoxParameters.lengthY + .2
                , aniCharacter.position.z);
            scene.freeCameraDude = createFreeCamera(scene, freeCamPosition);
            scene.freeCameraDude.viewport = new BABYLON.Viewport(0, 0, .5, 1);
            scene.activeCameras[0] = scene.freeCameraDude;

            loadCrossHair(scene);
            scene.dudes = [];
            scene.dudes[0] = aniCharacter;
            for (var q = 1 ; q <= 20 ; q++) {
                scene.dudes[q] = makeCopy(aniCharacter, skeletons, q);
                scene.beginAnimation(scene.dudes[q].skeleton, 0, 120, true, 1.0);
                var temp = new AnimatedPlayer(scene.dudes[q], 2, q, scene, .2);
            }

            scene.arcRotateDude = createArcRotateCamera(scene, scene.dudes[1]);
            scene.arcRotateDude.viewport = new BABYLON.Viewport(.5, 0, .5, 1);
            scene.activeCameras.push(scene.arcRotateDude);
            animateArcRotateCamera(scene.arcRotateDude);
        }
    }


	// once dude is loaded this will animated and get the array positions of each
    function onDudeImported(newMeshes, particleSystems, skeletons) {
        newMeshes[0].position = new BABYLON.Vector3(0, 0, 5);  // The original AnimatedPlayer
        newMeshes[0].name = "aniCharacter";
        var animatedCharacter = newMeshes[0];

        for (var i = 1 ; i < animatedCharacter.getChildren().length ; i++) {
            //console.log(aniCharacter.getChildren()[i].name);
            animatedCharacter.getChildren()[i].name = "clone_".concat(animatedCharacter.getChildren()[i].name);
            //console.log(aniCharacter.getChildren()[i].name);
        }
        scene.beginAnimation(skeletons[0], 0, 120, true, 1.0);
        var hero = new AnimatedPlayer(animatedCharacter, 2, -1, scene, .2);

        scene.dudes = [];
        scene.dudes[0] = animatedCharacter;
        for (var q = 1 ; q <= 10 ; q++) {
            scene.dudes[q] = makeCopy(animatedCharacter, skeletons, q);
            scene.beginAnimation(scene.dudes[q].skeleton, 0, 120, true, 1.0);
            var temp = new AnimatedPlayer(scene.dudes[q], 2, q, scene, .2);

        }

    }
}

// cloning the enemies character and assigning unique id to them//
function makeCopy(original, skeletons, id) {
    var myClone;

    // giving enemies random location on the ground within range of 1000 to 250
    var xrand = Math.floor(Math.random() * 1000) - 250;
    var zrand = Math.floor(Math.random() * 1000) - 250;

    myClone = original.clone("clone_" + id);
    myClone.position = new BABYLON.Vector3(xrand, 0, zrand);
    
    // just to avoid the enemies not complete here
    if (!skeletons) {
        return myClone;
    }

    // if enemies meshes are complete then make the enemies visible
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

// function to move enemies//
function moveHeroDude(scene) {
    var aniCharacter = scene.getMeshByName("aniCharacter");
    if (aniCharacter)
        aniCharacter.AnimatedPlayer.animatedPlayerShoot();
}

//function to move/animate cloned enemies//
function animateEnemy(scene) {
    if (scene.dudes) {
        for (var q = 1 ; q < scene.dudes.length ; q++) {
            scene.dudes[q].AnimatedPlayer.enenmyChasing();
        }
    }
}

// below are all generic function of htmlDrawBox to display and events listeners of keys//
window.addEventListener("resize", function () {
/*     htmlDrawBox.style.width = "800px";
    htmlDrawBox.style.height = "600px";
    engine.resize();
    htmlDrawBox.style.width = '100%';
    htmlDrawBox.style.height = '100%'; */
	engine.resize();
});


// function that is adopting the click event to lock the mouse
function modifySettings(scene) {
    scene.onPointerDown = function () {
        if (!scene.alreadyLocked) {
            //console.log("Requesting pointer lock");
            htmlDrawBox.requestPointerLock = htmlDrawBox.requestPointerLock ||
                htmlDrawBox.msRequestPointerLock || htmlDrawBox.mozRequestPointerLock ||
                htmlDrawBox.webkitRequestPointerLock;
            htmlDrawBox.requestPointerLock();
        }
        else {
            //console.log("Not requesting because we are already locked");
            if (scene.activeCameras[0] == scene.freeCameraDude) {
                var aniCharacter = scene.dudes[0];
                aniCharacter.AnimatedPlayer.fireGun();
            }
        }
    }

	// different browsers has different keyword to get mouse locked
    document.addEventListener("pointerlockchange", pointerLockListener);
    document.addEventListener("mspointerlockchange", pointerLockListener);
    document.addEventListener("mozpointerlockchange", pointerLockListener);
    document.addEventListener("webkitpointerlockchange", pointerLockListener);


// function that locks the pointer of mouse to disapppear on full screen mode
    function pointerLockListener() {
        var scene = Game.scenes[Game.activeScene];
        var element = document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement || document.pointerLockElement || null;

        if (element) {
            scene.alreadyLocked = true;
        }
        else {
            scene.alreadyLocked = false;
        }
    }

}


// function for score htmlDrawBox
function scoreCar(scene, txt, fnt, x, y, c) {
	scene = this.scene;
	htmlDrawBox = document.getElementById("renderCanvas2");
	context = htmlDrawBox.getContext('2d')
	context.fillStyle = c;
	context.font = fnt;
	context.clearRect(50,0,80,100);
	context.fillText(txt, x, y);
}


// event listening when keydown is donw or pressed
document.addEventListener("keydown", function (event) {
    var scene = Game.scenes[Game.activeScene];
    if (event.key == 'w' || event.key == 'W') {
        moveForwardW = true;
    }
    if (event.key == 's' || event.key == 'S') {
        moveBackwardS = true;
    }
    if (event.key == 'a' || event.key == 'A') {
        moveLeftA = true;
    }
    if (event.key == 'd' || event.key == 'D') {
        moveRightD = true;
    }
    if (event.key == 'b' || event.key == 'B') {
        fireBallB = true;
    }
    if (event.key == 'r' || event.key == 'R') {
        fireRayR = true;
    }
    if (event.key == 'f' || event.key == 'F') {
        fPressed = true;
    }

    if (event.key == 'x' || event.key == 'X') {
        xPressed = true;
    }

    if (event.key == 't' || event.key == 'T') {
        scene.activeCameras[0] = scene.followCameraTank;
    }
    if (event.key == 'y' || event.key == 'Y') {
        scene.activeCameras[0] = scene.followCameraDude;
    }
    if (event.key == 'u' || event.key == 'U') {
        scene.activeCameras[0] = scene.freeCameraDude;
    }

});


// event listening when key is up or not pressed
document.addEventListener("keyup", function (event) {
    var scene = Game.scenes[Game.activeScene];
    if (event.key == 'w' || event.key == 'W') {
        moveForwardW = false;
    }
    if (event.key == 's' || event.key == 'S') {
        moveBackwardS = false;
    }
    if (event.key == 'a' || event.key == 'A') {
        moveLeftA = false;
    }
    if (event.key == 'd' || event.key == 'D') {
        moveRightD = false;
    }
    if (event.key == 'b' || event.key == 'B') {
        fireBallB = false;
    }
    if (event.key == 'r' || event.key == 'R') {
        fireRayR = false;
    }
    if (event.key == 'F' || event.key == 'f') {
        fPressed = false;
    }
    if (event.key == 'x' || event.key == 'X') {
        xPressed = false;
    }
});

document.getElementById("b2").addEventListener("click", function(){
  console.log("clicked");
}); 
