import * as THREE from "three";


//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

// colors
const red = 0xFF0000, blue = 0x0000FF, yellow = 0xFFFF00, white = 0xFFFFFF, black = 0x000000, gray = 0x808080, darkGray = 0x404040

// arrow detection
var leftArrow = false, upArrow = false, downArrow = false, rightArrow = false;
var isWireframe = false;

// global scale
const SCALE = 30;
const T = SCALE;

let camera, scene, renderer;

let robot, trailer;

let cameras = {};
let activeCamera;
const velocity = 0.5;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(10));

    // this puts the background color to white
    scene.background = new THREE.Color(0xeeeeee);

    createRobot(0, 0, 0);
    createTrailer(0,-12,-25); 


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
    chest.position.set(0, 0, 0); // center vertical position
    robot.add(chest);

    // Head
    const head = createHead();
    head.position.set(0, 0.5 * T, 0);
    chest.add(head);

    // Left Arm
    const leftArm = createArm();
    leftArm.position.set(-0.5 * T, 0.2 * T, 0);
    chest.add(leftArm);

    // Right Arm
    const rightArm = createArm();
    rightArm.position.set(0.5 * T, 0.2 * T, 0);
    chest.add(rightArm);
    
    // Torso
    const torso = createTorso();
    torso.position.set(0, -0.25 * T, 0);
    chest.add(torso);

    // Waist
    const waist = createWaist();
    waist.position.set(0, -0.4 * T, 0);
    torso.add(waist);

    // Left Leg
    const leftLeg = createLeg("left");
    leftLeg.position.set(-0.2 * T, -0.2 * T, 0);
    waist.add(leftLeg);

    // Right Leg
    const rightLeg = createLeg("right");
    rightLeg.position.set(0.2 * T, -0.2 * T, 0);
    waist.add(rightLeg);

    // Left Foot
    const leftFoot = createFoot();
    leftFoot.position.set(0, -0.5 * T, 0);
    leftLeg.add(leftFoot);

    // Right Foot
    const rightFoot = createFoot();
    rightFoot.position.set(0, -0.5 * T, 0);
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

    const barThickness = 0.05 * T;
    const barDepth = depth;

    const halfW = width / 2;
    const halfH = height / 2;

    // Periferal bars
    const top = createCube(width, barThickness, barDepth, gray);
    top.position.set(0, halfH, 0);
    grille.add(top);

    const bottom = createCube(width, barThickness, barDepth, gray);
    bottom.position.set(0, -halfH, 0);
    grille.add(bottom);

    const left = createCube(barThickness, height, barDepth, gray);
    left.position.set(-halfW, 0, 0);
    grille.add(left);

    const right = createCube(barThickness, height, barDepth, gray);
    right.position.set(halfW, 0, 0);
    grille.add(right);

    // Vertical bars
    const numVBars = 5;
    const barSpacing = width / (numVBars + 1);
    for (let i = 1; i <= numVBars; i++) {
        const bar = createCube(barThickness, height, barDepth, gray);
        bar.position.set(-halfW + i * barSpacing, 0, 0);
        grille.add(bar);
    }

    // Horizontal bars
    const numHBars = 3;
    const barHeight = height / (numHBars + 1);
    for (let j = 1; j <= numHBars; j++) {
        const bar = createCube(width, barThickness, barDepth, gray);
        bar.position.set(0, -halfH + j * barHeight, 0);
        grille.add(bar);
    }

    return grille;

}

function addGrille(obj, x, y, z) {
    const grille = createGrille(0.4 * T, 0.2 * T, 0.05 * T, gray);
    grille.position.set(x, y, z);
    obj.add(grille);
}

function createHead() {
    const head = new THREE.Object3D();

    const r = 0.2 * T, rS = 16;

    const helmet = createBall( r, r, rS, red);
    helmet.position.set(0, 0, 0);
    head.add(helmet);

    const earLeft = createCylinder(0.1, 0.05 * T, 0.3 * T, 8 * T, blue);
    earLeft.position.set(-0.2 * T, 0.1 * T, 0);
    head.add(earLeft);

    const earRight = createCylinder(0.1, 0.05 * T, 0.3 * T, 8 * T, blue);
    earRight.position.set(0.2 * T, 0.1 * T, 0);
    head.add(earRight);

    const eyeLeft = createCylinder(0.05 * T, 0.05 * T, 0.01 * T, rS, yellow);
    eyeLeft.rotation.x = Math.PI / 2;
    eyeLeft.position.set(-0.08 * T, 0.05 * T, 0.2 * T);
    head.add(eyeLeft);

    const eyeRight = createCylinder(0.05 * T, 0.05 * T, 0.01 * T, rS, yellow);
    eyeRight.rotation.x = Math.PI / 2;
    eyeRight.position.set(0.08 * T, 0.05 * T, 0.2 * T);
    head.add(eyeRight);

    const mouth = createCube(0.1 * T, 0.1 * T, 0.01 * T, gray);
    mouth.position.set(0, -0.12 * T, 0.21 * T);
    head.add(mouth);

    return head;

}

function addHead(obj) {
    const head = createHead();
    head.position.set(0, 0.5 * T, 0);
    obj.add(head);

}

function createChest() {
    const chest = new THREE.Object3D();

    const bodychest = createCube(0.6 * T, 0.5 * T, 0.4 * T, red);
    bodychest.position.set(0, 0, 0);
    chest.add(bodychest);

    // Left window
    const winGeo = new THREE.BoxGeometry(0.25 * T, 0.3 * T, 0.05 * T);
    const winMat = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.7
    });
    const windowLeft = new THREE.Mesh(winGeo, winMat);
    windowLeft.position.set(-0.175 * T, 0.05 * T, 0.225 * T);
    chest.add(windowLeft);

    // Right window
    const windowRight = new THREE.Mesh(winGeo, winMat);
    windowRight.position.set(0.175 * T, 0.05 * T, 0.225 * T);
    chest.add(windowRight);

    // Central division
    const windowdivision = createCube(0.05 * T, 0.3 * T, 0.05 * T, red);
    windowdivision.position.set(0, 0.05 * T, 0.225 * T);
    chest.add(windowdivision);

    // Low part of the chest
    const downbodychest = createCube(0.6 * T, 0.2 * T, 0.4 * T, gray);
    downbodychest.position.set(0, -0.35 * T, 0);
    chest.add(downbodychest);

    return chest;

}

function addChest(obj) {
    const chest = createChest();
    chest.position.set(0, 0, 0);
    obj.add(chest);

}

function createTorso() {
    const torso = new THREE.Object3D();

    const bodytorso = createCube(0.5 * T, 0.25 * T, 0.4 * T, red);
    bodytorso.position.set(0, 0, 0);
    torso.add(bodytorso);

    const grille = createGrille(0.4 * T, 0.2 * T, 0.05 * T, gray);
    grille.position.set(0, 0, 1); // slightly in front of torso
    torso.add(grille);

    return torso;

}

function addTorso(obj, x, y, z, material) {
    const torso = createTorso();
    torso.position.set(0, -0.4 * T, 0);
    obj.add(torso);

}

function createTyre() {
    const wheel = new THREE.Object3D();

    const tyre = createCylinder(0.1 * T, 0.1 * T, 0.05 * T, 16, black);
    tyre.rotation.z = Math.PI / 2; // rotate to lie flat
    wheel.add(tyre);

    const rim = createCylinder(0.06 * T, 0.06 * T, 0.025 * T, 16, gray);
    rim.rotation.z = Math.PI / 2; // rotate to lie flat
    rim.position.set(0.025 * T, 0, 0);
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

    const bodywaist = createCube(0.5 * T, 0.15 * T, 0.3 * T, white);
    bodywaist.position.set(0, 0, 0);
    waist.add(bodywaist);

    // Tyres
    addTyre(waist, -0.3 * T, 0, 0); // left tyre
    addTyre(waist, 0.3 * T, 0, 0); // right tyre

    return waist;

}

function addWaist(obj) {
    const waist = createWaist();
    waist.position.set(0, -0.6 * T, 0);
    obj.add(waist);

}

function createArm() {
    const arm = new THREE.Object3D();

    const upperArm = createCube(0.15 * T, 0.4 * T, 0.15 * T, red);

    upperArm.position.set(0, 0, 0);
    arm.add(upperArm);

    const forearm = createCube(0.15 * T, 0.4 * T, 0.15 * T, red);
    forearm.position.set(0, -0.45 * T, 0);
    arm.add(forearm);

    const blueDetail = createCube(0.1 * T, 0.38 * T, 0.01 * T, blue);
    blueDetail.position.set(0, 0, 0.085 * T);
    forearm.add(blueDetail);


    // Hierarchy:
    upperArm.add(forearm);
    arm.add(upperArm);

    return arm;

}

function addArm(obj, x, y, z) {
    const arm = createArm();
    arm.position.set(x, y, z);
    obj.add(arm);

}

function createLeg(side) {
    const leg = new THREE.Object3D();

    const thigh = createCube(0.2 * T, 0.3 * T, 0.2 * T, gray);
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


function addLeg(obj, x, y, z) {
    const leg = createLeg();
    leg.position.set(x, y, z);
    obj.add(leg);

}

function createFoot() {
    const foot = new THREE.Object3D();

    const bodyfoot = createCube(0.3 * T, 0.1 * T, 0.4 * T, red);
    bodyfoot.position.set(0, 0, 0);
    foot.add(bodyfoot);

    return foot;

}

function addFoot(obj, x, y, z) {
    const foot = createFoot();
    foot.position.set(x, y, z);
    obj.add(foot);

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
        const wheel = createCylinder(wheelRadius, wheelRadius, wheelThickness, 12, 0x000000);
        wheel.rotation.z = Math.PI / 2; // rotate to lie flat
        wheel.rotation.y = Math.PI / 2; // rotate to lie flat
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
    var speed = Math.PI * velocity;
}

function moveWaist() {
    // rotate waist/legs in the x and y axis ??
    var speed = Math.PI * velocity;
}

function moveArms() {
    // rotate arms in the y axis and forearms in the z axis
    var speed = Math.PI * velocity;
}

function moveHead() {
    // rotate head in the x axis
    var speed = Math.PI * velocity;
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
        case 'A':
            // rotate negative feet
            break;
        case 'Q':
            // rotate positive feet
            break;
        case 'W':
            // rotate positive waist
            break;
        case 'S':
            // rotate negative waist
            break;
        case 'E':
            // rotate positive arm
            break;
        case 'D':
            // rotate negative arm
            break;
        case 'R':
            // rotate positive head
            break;
        case 'F':
            // rotate negative head
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
        case 'A':
            // rotate negative feet
            break;
        case 'Q':
            // rotate positive feet
            break;
        case 'W':
            // rotate positive waist
            break;
        case 'S':
            // rotate negative waist
            break;
        case 'E':
            // rotate positive arm
            break;
        case 'D':
            // rotate negative arm
            break;
        case 'R':
            // rotate positive head
            break;
        case 'F':
            // rotate negative head
            break;
    }
}

init();
animate();