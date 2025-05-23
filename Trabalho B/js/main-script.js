import * as THREE from "three";


//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

// colors
const red = 0xFF0000, blue = 0x0000FF, yellow = 0xFFFF00, black = 0x000000, gray = 0x808080, lightMetalGray = 0xC0C0C0
const creme = 0xFFFDD0
// movement variables
var leftArrow = false, upArrow = false, downArrow = false, rightArrow = false;
const velocity = 0.5;
var rotateFeetNegative = false, rotateFeetPositive = false;
var rotateWaistNegative = false, rotateWaistPositive = false;
var rotateArmNegative = false, rotateArmPositive = false;
var rotateHeadNegative = false, rotateHeadPositive = false;



var isWireframe = false;

// global scale
const SCALE = 30;
const T = SCALE;

let camera, scene, renderer;

let robot, trailer;

let cameras = {};
let activeCamera;


/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(10));

    // this puts the background color to beige
    scene.background = new THREE.Color(creme);

    createRobot(0, 0, 0);
    createTrailer(0, -35, -40);


}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCameras() {
    const aspect = window.innerWidth / window.innerHeight;

    // Ortogonal Frontal
    const orthoFront = new THREE.OrthographicCamera(-75, 75, 75, -75, 1, 1000);

    orthoFront.position.set(0, 0, 400);
    orthoFront.lookAt(scene.position);

    // Ortogonal Lateral (direita)
    const orthoSide = new THREE.OrthographicCamera(-75, 75, 75, -75, 1, 1000);
    orthoSide.position.set(50, 0, 0);
    orthoSide.lookAt(scene.position);

    // Ortogonal Topo
    const orthoTop = new THREE.OrthographicCamera(-75, 75, 75, -75, 1, 1000);
    orthoTop.position.set(0, 50, 0);
    orthoTop.lookAt(scene.position);

    // Perspectiva
    const perspective = new THREE.PerspectiveCamera(70, aspect, 1, 1000);
    perspective.position.set(60, 60, 60);
    perspective.lookAt(scene.position);

    // Armazena no dicionário
    cameras = {
        front: orthoFront,
        side: orthoSide,
        top: orthoTop,
        perspective: perspective,
    };

    // Define a câmera ativa inicialmente
    activeCamera = cameras.perspective;
}


/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createCube(width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({ color });
    return new THREE.Mesh(geometry, material);
}

function createCylinder(radiusTop, radiusBottom, height, radialSegments, color) {
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    const material = new THREE.MeshBasicMaterial({ color });
    return new THREE.Mesh(geometry, material);
}

function createBall(radius, height, radialSegments, color) {
    const geometry = new THREE.SphereGeometry(radius, height, radialSegments);
    const  material = new THREE.MeshBasicMaterial({ color });
    return new THREE.Mesh(geometry, material);
}

//////////////////
/* CREATE ROBOT */
//////////////////

function createRobot(x, y, z) {
    robot = new THREE.Object3D();

    // Chest
    const chest = createChest();
    chest.name = "chest"; // name the object for later reference
    chest.position.set(0, 0, 0); // center vertical position
    robot.add(chest);

    // Head
    const head = createHead();
    head.name = "head"; // name the object for later reference
    head.position.set(0, 0.2 * T, 0);
    chest.add(head);

    // Left Arm
    const leftArm = createArm();
    leftArm.name = "leftArm"; // name the object for later reference
    leftArm.position.set(-0.5 * T, 0.2 * T, 0);
    chest.add(leftArm);

    // Right Arm
    const rightArm = createArm();
    rightArm.name = "rightArm"; // name the object for later reference
    rightArm.position.set(0.5 * T, 0.2 * T, 0);
    chest.add(rightArm);
    
    // Torso
    const torso = createTorso();
    torso.name = "torso"; // name the object for later reference
    torso.position.set(0, -0.25 * T, 0);
    chest.add(torso);

    // Waist
    const waist = createWaist();
    waist.name = "waist"; // name the object for later reference
    waist.position.set(0, -0.22 * T, 0);
    torso.add(waist);

    // Left Leg
    const leftLeg = createLeg("left");
    leftLeg.name = "leftLeg"; // name the object for later reference
    leftLeg.position.set(-0.15 * T, -0.2 * T, -0.025 * T);
    waist.add(leftLeg);

    // Right Leg
    const rightLeg = createLeg("right");
    rightLeg.name = "rightLeg"; // name the object for later reference
    rightLeg.position.set(0.15 * T, -0.2 * T, -0.025 * T);
    waist.add(rightLeg);

    // Left Foot
    const leftFoot = createFoot();
    leftFoot.name = "leftFoot"; // name the object for later reference
    leftFoot.position.set(0, -0.5 * T, 1);
    leftLeg.add(leftFoot);

    // Right Foot
    const rightFoot = createFoot();
    rightFoot.name = "rightFoot"; // name the object for later reference
    rightFoot.position.set(0, -0.5 * T, 1);
    rightLeg.add(rightFoot);

    // Add robot to scene
    robot.position.set(x, y, z);
    scene.add(robot);

}

///////////////////////////////
/* CREATE PARTS OF THE ROBOT */
///////////////////////////////

function createGrille(width, height, depth, color) {
    const grille = new THREE.Object3D();

    const barThickness = 0.025 * T;
    const barDepth = depth;

    const halfW = width / 2;
    const halfH = height / 2;

    // Vertical bars(lateral)
    const left = createCube(barThickness, height, barDepth, color);
    left.position.set(-halfW, 0, 0);
    grille.add(left);

    const right = createCube(barThickness, height, barDepth, color);
    right.position.set(halfW, 0, 0);
    grille.add(right);

    // Horizontal bars
    const numHBars = 5;
    const spacing = height / (numHBars - 1); // 4 spaces in 5 bars

    for (let i = 0; i < numHBars; i++) {
        const y = halfH - i * spacing;
        const bar = createCube(width, barThickness, barDepth, color);
        bar.position.set(0, y, 0);
        grille.add(bar);
    }

    return grille;
}

function createHead() {
    const head = new THREE.Object3D();

    const r = 0.2 * T, rS = 16;

    const headBase = createCylinder(0.225 * T, 0.15 * T, 0.3 * T, 32, blue);
    headBase.rotation.x = Math.PI / 2; // lay flat to look like a helmet
    headBase.position.set(0, 0.3 * T, 0);
    head.add(headBase);

    const earLeft = createCylinder(0.1, 0.05 * T, 0.3 * T, 8 * T, blue);
    earLeft.position.set(-0.17 * T, 5 + 0.3 * T, 0);
    head.add(earLeft);

    const earRight = createCylinder(0.1, 0.05 * T, 0.3 * T, 8 * T, blue);
    earRight.position.set(0.17 * T, 5 + 0.3 * T, 0);
    head.add(earRight);

    const eyeLeft = createCylinder(0.05 * T, 0.05 * T, 0.01 * T, rS, yellow);
    eyeLeft.rotation.x = Math.PI / 2;
    eyeLeft.position.set(-0.1* T, 0.05 * T + 0.3 * T, 0.16 * T);
    head.add(eyeLeft);

    const eyeRight = createCylinder(0.05 * T, 0.05 * T, 0.01 * T, rS, yellow);
    eyeRight.rotation.x = Math.PI / 2;
    eyeRight.position.set(0.1 * T, 0.05 * T + 0.3 * T, 0.16 * T);
    head.add(eyeRight);

    const mouth = createCube(0.1 * T, 0.1 * T, 0.01 * T, lightMetalGray);
    mouth.position.set(0, -0.15 * T + 0.3 * T, 0.16 * T);
    head.add(mouth);

    const neck = createCylinder(0.05 * T, 0.05 * T, 0.3 * T, rS, gray);
    neck.position.set(0, -0.2 * T + 0.3 * T, 0);
    head.add(neck);

    return head;

}

function createChest() {
    const chest = new THREE.Object3D();

    const bodychest = createCube(0.6 * T, 0.35 * T, 0.4 * T, red);
    bodychest.position.set(0, 2, 0);
    chest.add(bodychest);

    // Window
    const winGeo = new THREE.BoxGeometry(0.25 * T, 0.20 * T, 0.05 * T);
    const winMat = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.7
    });
    // Left window
    const windowLeft = new THREE.Mesh(winGeo, winMat);
    windowLeft.position.set(-0.15 * T, 0.05 * T, 0.225 * T);
    chest.add(windowLeft);

    // Right window
    const windowRight = new THREE.Mesh(winGeo, winMat);
    windowRight.position.set(0.15 * T, 0.05 * T, 0.225 * T);
    chest.add(windowRight);

    // Central division
    const windowdivision = createCube(0.05 * T, 0.3 * T, 0.05 * T, red);
    windowdivision.position.set(0, 0.05 * T, 0.225 * T);
    chest.add(windowdivision);

    // Left Soulder
    const leftShoulderJoint = createCylinder(0.04 * T, 0.04 * T, 0.15 * T, 16, red);
    leftShoulderJoint.rotation.z = Math.PI / 2;
    leftShoulderJoint.position.set(0.38 * T, 0.15 * T, 0);
    leftShoulderJoint.name = "leftShoulder"; // name the object for later reference
    chest.add(leftShoulderJoint);

    // Right Shoulder
    const rightShoulderJoint = createCylinder(0.04 * T, 0.04 * T, 0.15 * T, 16, red);
    rightShoulderJoint.rotation.z = Math.PI / 2;
    rightShoulderJoint.position.set(-0.38 * T, 0.15 * T, 0);
    rightShoulderJoint.name = "rightShoulder"; // name the object for later reference
    chest.add(rightShoulderJoint);

    return chest;

}


function createTorso() {
    const torso = new THREE.Object3D();

    const bodytorso = createCube(0.35 * T, 0.3 * T, 0.4 * T, red);
    bodytorso.position.set(0, 0, 0);
    torso.add(bodytorso);

    const grille = createGrille(0.4 * T, 0.2 * T, 0.05 * T, lightMetalGray);
    grille.position.set(0, 0, 0.22 * T); // entre a frente do torso e as janelas
    torso.add(grille);

    return torso;

}

function createTyre() {
    const wheel = new THREE.Object3D();

    const tyre = createCylinder(0.1 * T, 0.1 * T, 0.1 * T, 16, black);
    tyre.rotation.z = Math.PI / 2; // rotate to lie flat
    wheel.add(tyre);

    const rim = createCylinder(0.06 * T, 0.06 * T, 0.1 * T, 16, lightMetalGray);
    rim.rotation.z = Math.PI / 2; // rotate to lie flat
    rim.position.set(0.01, 0, 0);
    wheel.add(rim);

    return wheel;

}

function addTyre(obj, x, y, z, material) {
    const tyre = createTyre();
    tyre.position.set(x, y, z);
    obj.add(tyre);

}

function createWaist() {
    const waist = new THREE.Object3D();

    const bodywaist = createCube(0.6 * T, 0.15 * T, 0.4 * T, lightMetalGray);
    bodywaist.position.set(0, 0, 0);
    waist.add(bodywaist);

    // Tyres
    addTyre(waist, -0.35 * T, 0, 0); // left tyre
    addTyre(waist, 0.35 * T, 0, 0); // right tyre

    return waist;

}

function createArm() {
    const arm = new THREE.Object3D();

    const upperArm = createCube(0.15 * T, 0.4 * T, 0.15 * T, red);

    upperArm.position.set(0, -0.15 * T, 0);
    arm.add(upperArm);

    const forearm = createCube(0.15 * T, 0.4 * T, 0.15 * T, red);
    forearm.position.set(0, -0.35 * T, 0);
    upperArm.add(forearm);

    const blueDetail = createCube(0.1 * T, 0.38 * T, 0.01 * T, blue);
    blueDetail.position.set(0, 0, 0.085 * T);
    forearm.add(blueDetail);


    // Hierarchy:
    upperArm.add(forearm);
    arm.add(upperArm);

    return arm;

}

function createLeg(side) {
    const leg = new THREE.Object3D();

    const thigh = createCube(0.15 * T, 0.3 * T, 0.2 * T, gray);
    thigh.position.set(0, 0, 0);

    const shin = createCube(0.2 * T, 0.4 * T, 0.2 * T, blue);
    shin.position.set(0, -0.35 * T, 0);
    thigh.add(shin);

    // Tyres on the right side
    const xOffset = side === "left" ? -0.15 * T : 0.15 * T;

    addTyre(shin, xOffset, 0.15 * T, 0);   // pneu superior
    addTyre(shin, xOffset, -0.1 * T, 0);   // pneu inferior

    leg.add(thigh);
    return leg;
}

function createFoot() {
    const foot = new THREE.Object3D();

    const bodyfoot = createCube(0.2 * T, 0.1 * T, 0.4 * T, red);
    bodyfoot.position.set(0, 0, 0);
    foot.add(bodyfoot);

    return foot;

}


function createTrailer(x, y, z) {
    trailer = new THREE.Object3D();

    // --- Contentor (caixa principal) ---
    const containerWidth = 40;
    const containerHeight = 25;
    const containerDepth = 12;
    const container = createCube(containerWidth, containerHeight, containerDepth, 0x444444);
    container.position.set(0, containerHeight / 2 + 5, 0); // elevate to rest on wheels
    trailer.add(container);

    // --- Rodas ---
    const wheelRadius = 3;
    const wheelThickness = 2;

    // Four wheels:
    const wheelOffsetX = containerWidth / 2 - 5;
    const wheelOffsetY = wheelRadius;
    const wheelOffsetZ = containerDepth / 2 + 1;

    const wheelPositions = [
        [wheelOffsetX-7, wheelOffsetY, -wheelOffsetZ], // front-left
        [wheelOffsetX, wheelOffsetY, wheelOffsetZ],  // front-right
        [wheelOffsetX, wheelOffsetY, -wheelOffsetZ],  // rear-left
        [wheelOffsetX-7, wheelOffsetY, wheelOffsetZ],   // rear-right
    ];

    wheelPositions.forEach(pos => {
        const wheel = createTyre();
        wheel.rotation.y = -Math.PI / 2;
        wheel.scale.set(1.4, 1.4, 1.4); // scale the wheel
        wheel.position.set(...pos);
        trailer.add(wheel);
    });

    // --- Peça de ligação (haste de engate) ---
    const hitchLength = 5;
    const hitch = createCube(hitchLength, 2, 2, 0xaaaaaa);
    hitch.position.set(-containerWidth / 2 - hitchLength / 2, wheelOffsetY + 1, 0);
    trailer.add(hitch);

    // --- Posição final do reboque ---
    trailer.position.set(x, y, z);
    trailer.rotation.y = Math.PI / 2;

    scene.add(trailer);
}

function robotBuilt() {
    //check if the robot is built
    
    return false;
}

function moveFeet() {
    // rotate feet in the x axis
    var speed = Math.PI * velocity / SCALE;
    var leftFoot = robot.getObjectByName("leftFoot");
    var rightFoot = robot.getObjectByName("rightFoot");

    if (rotateFeetPositive == true && leftFoot.rotation.x < Math.PI / 2) {
        
        leftFoot.rotation.x += speed;
        rightFoot.rotation.x += speed;
        
        // limit rotation to 90 degrees
        if (leftFoot.rotation.x >= Math.PI / 2) {
            leftFoot.rotation.x = Math.PI / 2;
            rightFoot.rotation.x = Math.PI / 2;
        }
    }


    if (rotateFeetNegative == true && leftFoot.rotation.x > 0) {
        
        leftFoot.rotation.x -= speed;
        rightFoot.rotation.x -= speed;

        // limit rotation to 0 degrees
        if (leftFoot.rotation.x <= 0) {
            leftFoot.rotation.x = 0;
            rightFoot.rotation.x = 0;
        }
    }
}

function moveWaist() {
    // rotate waist/legs in the x and y axis
    var speed = Math.PI * velocity / T;
    var waist = robot.getObjectByName("waist");

    if (rotateWaistPositive == true && waist.rotation.x < Math.PI / 2) {
        waist.rotation.x += speed;
        if (waist.rotation.x >= Math.PI / 2) {
            waist.rotation.x = Math.PI / 2;
        }
    }

    if (rotateWaistNegative == true && waist.rotation.x > 0) {
        waist.rotation.x -= speed;
        if (waist.rotation.x <= 0) {
            waist.rotation.x = 0;
        }
    }

    // --- Keep robot on the same horizontal plane ---
    const legLength = 0.7 * T;
    const waistAngle = waist.rotation.x;
    const yOffset = - legLength * (1 - Math.cos(waistAngle));
    robot.position.y = yOffset;
}

function moveArms() {
    // Move arms toward the chest along the X axis
    var speed = velocity * 0.5; // Adjust speed as needed
    var angularSpeed = Math.PI * velocity / T;

    var chest = robot.getObjectByName("chest");
    var leftShoulder = chest.getObjectByName("leftShoulder");
    var rightShoulder = chest.getObjectByName("rightShoulder");
    var leftArm = robot.getObjectByName("leftArm");
    var leftForearm = leftArm.children[0].children[0];
    var rightArm = robot.getObjectByName("rightArm");
    var rightForearm = rightArm.children[0].children[0];

    // Define the minimum X position (when the arm is "inside" the chest)
    const minArmX = -0.25 * T; // Adjust this value as needed
    const maxArmX = -0.5 * T; // Original position

    // Left Arm: move right (increase X) toward chest center
    if (rotateArmPositive && leftArm.position.x < minArmX) { // 
        leftShoulder.position.x -= speed;
        rightShoulder.position.x += speed;
        leftArm.position.x += speed;
        rightArm.position.x -= speed;
        leftForearm.rotation.x -= angularSpeed;
        rightForearm.rotation.x -= angularSpeed;

        if (leftArm.position.x > minArmX) {
            leftArm.position.x = minArmX;
            rightArm.position.x = -minArmX;
            leftForearm.rotation.x = -math.PI / 2;
            rightForearm.rotation.x = -math.PI / 2;
        }
    }
    // Left Arm: move left (decrease X) away from chest
    if (rotateArmNegative && leftArm.position.x > maxArmX) { //
        leftShoulder.position.x += speed;
        rightShoulder.position.x -= speed;
        leftArm.position.x -= speed;
        rightArm.position.x += speed;
        leftForearm.rotation.x += angularSpeed;
        rightForearm.rotation.x += angularSpeed;

        if (leftArm.position.x < maxArmX) {
            leftArm.position.x = maxArmX;
            rightArm.position.x = -maxArmX;
            leftForearm.rotation.x = 0;
            rightForearm.rotation.x = 0;
        }
    }
}

function moveHead() {
    // rotate head in the chest's local Y axis (vertical axis of the chest)
    var speed = Math.PI * velocity / T;

    // Get the chest and head objects
    var chest = robot.getObjectByName("chest");
    var head = chest.getObjectByName("head");

    if (rotateHeadPositive) { // R
        head.rotation.x -= speed;
        if (head.rotation.x < -Math.PI) head.rotation.x = -Math.PI;
       
    }

    if (rotateHeadNegative) { // F
        head.rotation.x += speed;
        if (head.rotation.x > 0) head.rotation.x = 0;
    }
}

function moveTrailer() {
    var speed = velocity;
    if (leftArrow == false && rightArrow == true) {
        trailer.position.x += speed;
    }
    else if (leftArrow == true && rightArrow == false) {
        trailer.position.x -= speed;
    }
    if (upArrow == true && downArrow == false) {
        trailer.position.z += speed;
    }
    else if (upArrow == false && downArrow == true) {
        trailer.position.z -= speed;
    }

}
//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {}

////////////
/* UPDATE */
////////////
function update() {

    if (robotBuilt() && checkCollisions()) {
        handleCollisions();
    }
    else {
        moveTrailer();

        moveFeet();
        moveWaist();
        moveArms();
        moveHead();
    }

    
}

/////////////
/* DISPLAY */
/////////////
function render() {
    renderer.render(scene, activeCamera);
}


////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {

    renderer = new THREE.WebGLRenderer({
        antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
    createCameras();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    
    update();
    
    render();
    
    requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    switch (e.key) {
        case "ArrowLeft":
            leftArrow = true;
            break;
        case "ArrowUp":
            upArrow = true;
            break;
        case "ArrowRight":
            rightArrow = true;
            break;
        case "ArrowDown":
            downArrow = true;
            break;
        case '1':
            activeCamera = cameras.front;
            break;
        case '2':
            activeCamera = cameras.side;
            break;
        case '3':
            activeCamera = cameras.top;
            break;
        case '4':
            activeCamera = cameras.perspective;
            break;
        case '7': // 7
            isWireframe = !isWireframe;
            scene.traverse(function (object) {
                if (object instanceof THREE.Mesh) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(mat => mat.wireframe = isWireframe);
                    } else {
                        object.material.wireframe = isWireframe;
                    }
                }
            });
            render();
            break;
        case 'Q':
        case 'q':
            // rotate positive feet
            rotateFeetPositive = true;
            break;
        case 'A':
        case 'a':
            // rotate negative feet
            rotateFeetNegative = true;
            break;
        case 'W':
        case 'w':
            // rotate positive waist
            rotateWaistPositive = true;
            break;
        case 'S':
        case 's':
            // rotate negative waist
            rotateWaistNegative = true;
            break;
        case 'E':
        case 'e':
            // rotate positive arm
            rotateArmPositive = true;
            break;
        case 'D':
        case 'd':
            // rotate negative arm
            rotateArmNegative = true;
            break;
        case 'R':
        case 'r':
            // rotate positive head
            rotateHeadPositive = true;
            break;
        case 'F':
        case 'f':
            // rotate negative head
            rotateHeadNegative = true;
            break;
        
    }
}


///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    switch (e.key) {
        case "ArrowLeft":
            leftArrow = false;
            break;
        case "ArrowUp":
            upArrow = false;
            break;
        case "ArrowRight":
            rightArrow = false;
            break;
        case "ArrowDown":
            downArrow = false;
            break;
        case 'Q':
        case 'q':
            // rotate positive feet
            rotateFeetPositive = false;
            break;
        case 'A':
        case 'a':
            // rotate negative feet
            rotateFeetNegative = false;
            break;
        case 'W':
        case 'w':
            // rotate positive waist
            rotateWaistPositive = false;
            break;
        case 'S':
        case 's':
            // rotate negative waist
            rotateWaistNegative = false;
            break;
        case 'E':
        case 'e':
            // rotate positive arm
            rotateArmPositive = false;
            break;
        case 'D':
        case 'd':
            // rotate negative arm
            rotateArmNegative = false;
            break;
        case 'R':
        case 'r':
            // rotate positive head
            rotateHeadPositive = false;
            break;
        case 'F':
        case 'f':
            // rotate negative head
            rotateHeadNegative = false;
            break;
    }
}

init();
animate();