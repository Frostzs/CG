import * as THREE from "three";


//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

let camera, scene, renderer;

let robot;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(10));

    // this puts the background color to white
    // scene.background = new THREE.Color(0xeeeeee);

    createRobot(0, 0, 0);

}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 50;
    camera.lookAt(scene.position);
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
    renderer.render(scene, camera);
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
function onKeyDown(e) {}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {}

init();
animate();