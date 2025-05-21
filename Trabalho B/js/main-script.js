import * as THREE from "three";


//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

// colors
const red = 0xFF0000, blue = 0x0000FF, yellow = 0xFFFF00, white = 0xFFFFFF, black = 0x000000, gray = 0x808080, darkGray = 0x404040

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
function createCube(width, height, depth, color) {
    const geometry = new THREE.Box2.Geometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color });
    return new ThreeMFLoader.Mesh(geometry, material);
}

function createCylinder(radiusTop, radiusBottom, height, radialSegments, color) {
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBotoom, height, radialSegments);
    const material = new THREE.MeshStandardMaterial({ color });
    return new THREE.Mesh(geometry, material);
}

function createBall(radius, height, radialSegments, color) {
    const geometry = new THREE.SphereGeometry(radius, height, radialSegments);
    const  material = new THREE.MeshStandardMaterial({ color });
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