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

    createRobot(0, 0, 0);

}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.x = 0;
    camera.position.y = 10;
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
    addArm(robot, -10, 10, 0, material);
    addArm(robot, 10, 10, 0, material);


    scene.add(robot);

    robot.position.x = x;
    robot.position.y = y;
    robot.position.z = z;
}

function addLeg(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(2, 10, 2);
    const leg = new THREE.Mesh(geometry, material);
    leg.position.set(x, y, z);
    obj.add(leg);
}

function addChest(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(10, 10, 5);
    const chest = new THREE.Mesh(geometry, material);
    chest.position.set(x, y, z);
    obj.add(chest);
}

function addHead(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(5, 5, 5);
    const head = new THREE.Mesh(geometry, material);
    head.position.set(x, y, z);
    obj.add(head);
}

function addArm(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(2, 10, 2);
    const arm = new THREE.Mesh(geometry, material);
    arm.position.set(x, y, z);
    obj.add(arm);
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