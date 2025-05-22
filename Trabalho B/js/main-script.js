import * as THREE from "three";


//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

// colors
const red = 0xFF0000, blue = 0x0000FF, yellow = 0xFFFF00, white = 0xFFFFFF, black = 0x000000, gray = 0x808080, darkGray = 0x404040

// arrow detection
var leftArrow = false, upArrow = false, downArrow = false, rightArrow = false;
var isWireframe = false;


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

    //createRobot(0, 0, 0);
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

function createRobot(x, y, z) {
    robot = new THREE.Object3D();

    const material = new THREE.MeshBasicMaterial({ color : 0x00ff00 });

    addLeg(robot, x, y, z, material);
    addLeg(robot, x, y, z, material);
    addChest(robot, x, y, z, material);
    addHead(robot, x, y, z, material);
    addArm(robot, x, y, z, material);
    addArm(robot, x, y, z, material);


    scene.add(robot);

    robot.position.x = x;
    robot.position.y = y;
    robot.position.z = z;
}

function createHead() {
    const head = new THREE.Object3D();

    const helmet = createBall( r, h, rS, red);
    head.add(helmet);

    const earLeft = createCylinder(rT, rB, h, rS, blue);
    earLeft.position.set(x, y, z);
    head.add(earLeft);

    const earRight = createCylinder(rT, rB, h, rS, blue);
    earRight.position.set(x, y, z);
    head.add(earRight);

    const eyeLeft = createBall(r, h, rS, yellow);
    eyeLeft.position.set(x, y, z);
    head.add(eyeLeft);

    const eyeRight = createBall(r, h, rS, yellow);
    eyeRight.position.set(x, y, z);
    head.add(eyeRight);

    const mouth = createCube(w, h, d, gray);
    mouth.position.set(x, y, z);
    head.add(mouth);

}

function addHead(obj, x, y, z, material) {
    
    obj.add(head);

}

function createChest() {
    const chest = new THREE.Object3D();

    const window = createCube(w, h, d, /* transparente */);
    window.position.set(x, y, z);
    chest.add(window);
    
    const windowdivision = createCube(w, h, d, red);
    windowdivision.position.set(x, y, z);
    chest.add(windowdivision);

    const bodychest = createCube(w, h, d, red);
    bodychest.position.set(x, y, z);
    chest.add(bodychest);

    const downbodychest = createCube(w, h, d, gray);
    downbodychest.position.set(x, y, z);
    chest.add(downbodychest);

}

function addChest(obj, x, y, z, material) {
    
    obj.add(chest);
}

function createTorso() {
    const torso = new THREE.Object3D();

    const bodytorso = createCube(w, h, d, red);
    bodytorso.position.set(x, y, z);
    torso.add(bodytorso);

    const grille = createCube(w, h, d, white);
    grille.position.set(x, y, z);
    torso.add(grille);

}

function addTorso(obj, x, y, z, material) {

}

function createTyre() {

}

function addTyre(obj, x, y, z, material) {

}

function createWaist() {
    const waist = new THREE.Object3D();

    const bodywaist = createCube(w, h, d, white);
    bodywaist.position.set(x, y, z);
    waist.add(bodywaist);

    // Tyres

}

function addWaist(obj, x, y, z, material) {

    // Add waist to robot
    obj.add(waist);
}

function createArm() {
    const arm = new THREE.Object3D();

    const upperArm = createCube(w, h, d, red);
    upperArm.position.set(x, y, z);
    arm.add(upperArm);

    const forearm = createCube(w, h, d, red);
    forearm.position.set(x, y, z);
    arm.add(forearm);

    // add hand if necessary

}

function addArm(obj, x, y, z, material) {
    // Add forearm to upper arm
    upperArm.add(foreArm);

    // Add the arm to the robot
    obj.add(upperArm);
}

function createLeg() {
    const leg = new THREE.Object3D();

    const upperLeg = createCube(w, h, d, red);
    upperLeg.position.set(x, y, z);
    leg.add(upperLeg);

    const lowerLeg = createCube(w, h, d, red);
    lowerLeg.position.set(x, y, z);
    leg.add(lowerLeg);
    
    // add gray thing in the lateral part of the leg

    // Tyres

}

function addLeg(obj, x, y, z, material) {
    // Add lowerLeg to upperLeg
    upperLeg.add(lowerLeg);
    
    // Add foot to lowerLeg
    lowerLeg.add(foot);

    // Add the leg to the robot
    obj.add(upperLeg);
}

function createFoot() {
    const foot = new THREE.Object3D();

    const bodyfoot = createCube(w, h, d, red);
    bodyfoot.position.set(x, y, z);
    foot.add(bodyfoot);

}

function addFoot(obj, x, y, z, material) {

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