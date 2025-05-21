import * as THREE from "three";


//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

let camera, scene, renderer;

let robot;

let cameras = {};
let activeCamera;


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
function createCamera() {
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
function createRobot(x, y, z) {
    robot = new THREE.Object3D();

    const material = new THREE.MeshBasicMaterial({ color : 0x00ff00 });

    addLeg(robot, -5, 0, 0, material);
    addLeg(robot, 5, 0, 0, material);
    addChest(robot, 0, 10, 0, material);
    addHead(robot, 0, 20, 0, material);
    addArm(robot, -10, 12.5, 0, material);
    addArm(robot, 10, 12.5, 0, material);


    scene.add(robot);

    robot.position.x = x;
    robot.position.y = y;
    robot.position.z = z;
}

function addLeg(obj, x, y, z, material) {
    // Create upperLeg
    const upperLeg = new THREE.Object3D();
    const upperLegMesh = new THREE.Mesh(new THREE.BoxGeometry(3, 5, 3), material);
    upperLegMesh.position.set(x, y, z);
    upperLeg.add(upperLegMesh);
    // Create lowerLeg
    const lowerLeg = new THREE.Object3D();
    const lowerLegMesh = new THREE.Mesh(new THREE.BoxGeometry(3, 5, 3), material);
    lowerLegMesh.position.set(x, y - 5, z);
    lowerLeg.add(lowerLegMesh);
    // Create foot
    const foot = new THREE.Object3D();
    const footMesh = new THREE.Mesh(new THREE.BoxGeometry(5, 1, 5), material);
    footMesh.position.set(x, y - 10, z);
    foot.add(footMesh);
    
    // Add lowerLeg to upperLeg
    upperLeg.add(lowerLeg);
    
    // Add foot to lowerLeg
    lowerLeg.add(foot);

    // Add the leg to the robot
    obj.add(upperLeg);
}

function addWaist(obj, x, y, z, material) {
    // Create waist
    const waist = new THREE.Object3D();
    const waistMesh = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 5), material);
    waistMesh.position.set(x, y, z);
    waist.add(waistMesh);
    // Add waist to robot
    obj.add(waist);
}

function addChest(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(10, 10, 5);
    const chest = new THREE.Mesh(geometry, material);
    chest.position.set(x, y, z);
    obj.add(chest);
}

function addHead(obj, x, y, z, material) {
    // Create head
    const head = new THREE.Object3D();
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(5, 10, 10), material);
    headMesh.position.set(x, y, z);
    head.add(headMesh);
    // Create eyes
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), eyeMaterial);
    leftEye.position.set(x - 1.5, y + 0.7, z + 5.5);
    head.add(leftEye);
    const rightEye = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), eyeMaterial);
    rightEye.position.set(x + 1.5, y + 0.7, z + 5.5);
    head.add(rightEye);
    // Create mouth
    const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 1), mouthMaterial);
    mouth.position.set(x, y - 3.5, z + 5.5);
    


    // Add mouth to head
    head.add(mouth);
    // Add head to robot
    obj.add(head);


    obj.add(head);
}

function addArm(obj, x, y, z, material) {
    // Create upper arm
    const upperArm = new THREE.Object3D();
    const upperArmMesh = new THREE.Mesh(new THREE.BoxGeometry(4, 5, 4), material);
    upperArmMesh.position.set(x, y, z);
    upperArm.add(upperArmMesh);

    // Create forearm
    const forearm = new THREE.Object3D();
    const forearmMesh = new THREE.Mesh(new THREE.BoxGeometry(4, 5, 4), material);
    forearmMesh.position.set(x, y - 5 , z);
    forearm.add(forearmMesh);

    // Add forearm to upper arm
    upperArm.add(forearm);

    // Add the arm to the robot
    obj.add(upperArm);
}

function createTrailer(x, y, z) {
    const trailer = new THREE.Object3D();

    const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
    const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const hitchMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });

    // --- Contentor (caixa principal) ---
    const containerWidth = 40;
    const containerHeight = 25;
    const containerDepth = 12;
    const container = new THREE.Mesh(
        new THREE.BoxGeometry(containerWidth, containerHeight, containerDepth),
        boxMaterial
    );
    container.position.set(0, containerHeight / 2 + 5, 0); // elevate to rest on wheels
    trailer.add(container);

    // --- Rodas ---
    const wheelRadius = 3;
    const wheelThickness = 2;
    const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 12);

    // Four wheels:
    const wheelOffsetX = containerWidth / 2 - 5;
    const wheelOffsetY = wheelRadius;
    const wheelOffsetZ = containerDepth / 2 + 1;

    const wheelPositions = [
        [wheelOffsetX-4, wheelOffsetY, -wheelOffsetZ], // front-left
        [wheelOffsetX, wheelOffsetY, wheelOffsetZ],  // front-right
        [wheelOffsetX, wheelOffsetY, -wheelOffsetZ],  // rear-left
        [wheelOffsetX-4, wheelOffsetY, wheelOffsetZ],   // rear-right
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2; // rotate to lie flat
        wheel.position.set(...pos);
        trailer.add(wheel);
    });

    // --- Peça de ligação (haste de engate) ---
    const hitchLength = 5;
    const hitch = new THREE.Mesh(
        new THREE.BoxGeometry(hitchLength, 2, 2),
        hitchMaterial
    );
    hitch.position.set(-containerWidth / 2 - hitchLength / 2, wheelOffsetY + 1, 0);
    trailer.add(hitch);

    // --- Posição final do reboque ---
    trailer.position.set(x, y, z);
    trailer.rotation.y = Math.PI / 2;

    scene.add(trailer);
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
function update() {}

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
    createCamera();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
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
    }
}


///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {}

init();
animate();