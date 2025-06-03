import * as THREE from "three";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

let canvasSize = 512;
let groundPlane, skyDome;
let generateGroundTexture = false;
let generateSkyTexture = false;
let scene, activeCamera, renderer;
let globalDirectionalLight;
let globalDirectionalLightOn = true;

var cameras = []

var moon, ovni, house, tree;
// var skydome, terrain;

var treePos = [], trees = [];

/*
// Lights
var ambientLight = new THREE.AmbientLight( cor, intensidade? );
var globalLight = new THREE.DirectionalLight( cor, intensidade? );
var whatMAterial = "???";
*/

// Materials
const materials = new Map(), materialsLAmbert = new Map(), materialsPhong = new Map(), 
materialsToon = new Map(), materialBAsic = new Map(), clock = new THREE.Clock();

const keys = {}, movementVector = new THREE.Vector2(0, 0);

// Shade
let shadeCalculation = true;

// colors
const moonYellow = 0xEBC815
const yellow = 0xf2b632;
const white = 0xffffff;
const brown = 0x5a3825;
const tileOrange = 0xb55239;
const blue = 0x003366;
const black = 0xffffff;


function generateFloralTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0b3d0b'; // light green
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    const colors = ['white', 'yellow', 'violet', 'lightblue'];
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * canvasSize;
        const y = Math.random() * canvasSize;
        const r = 0.5 + Math.random() * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
}

function generateStarryTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');

    // Fundo com degradê de azul escuro para violeta escuro
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasSize);
    gradient.addColorStop(0, '#000022'); // Azul quase preto
    gradient.addColorStop(1, '#14001a'); // Violeta escuro
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Desenhar estrelas
    for (let i = 0; i < 600; i++) {
        const x = Math.random() * canvasSize;
        const y = Math.random() * canvasSize;
        const r = 0.2 + Math.random() * 1;
        const alpha = 1.0;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
    }

    // Algumas estrelas maiores e mais brilhantes (efeito visual de profundidade)
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * canvasSize;
        const y = Math.random() * canvasSize;
        const r = 2 + Math.random() * 2;
        const gradientStar = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradientStar.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradientStar.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradientStar;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
}


// #region CREATE SCENE(S)
/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';
    scene = new THREE.Scene();

    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshBasicMaterial({ color: 0xffffff,map: generateFloralTexture() });
    groundPlane = new THREE.Mesh(groundGeo, groundMat);
    groundPlane.rotation.x = -Math.PI / 2;
    scene.add(groundPlane);

    const skyGeo = new THREE.SphereGeometry(100, 32, 32);
    const skyMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,             // branco, pois a cor será substituída pela textura
        side: THREE.BackSide,
        map: generateStarryTexture()
    });

    skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);

    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    createMoon(3, 24, 16);
    scene.add(moon);

    globalDirectionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    globalDirectionalLight.position.set(30, 40, 20); // angle != than 0 with the xOy plane
    globalDirectionalLight.target.position.set(0, 0, 0);
    scene.add(globalDirectionalLight);
    scene.add(globalDirectionalLight.target);
    
}
// #endregion

// #region CREATE CAMERA(S)
//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
     const aspect = window.innerWidth / window.innerHeight;
    const pers = new THREE.PerspectiveCamera(75, aspect, 0.1, 500);
    pers.position.set(0, 50, 50);
    pers.lookAt(0, 10, 10);

    cameras = {
        perspective: pers
    };

    activeCamera = cameras.perspective;
}
// #endregion

// #region CREATE LIGHTS
/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function updateLights() {
    'use strict';
    // TO DO: Update lights if needed
}
// #endregion

// #region SHADE CALCULATION
///////////////////////
/* SHADE CALCULATION */
///////////////////////
function updateShadeCalculation() {
    'use strict';
    // TO DO: Update shade calculation if needed
}
// #endregion

// #region CREATE OBJECT3D(S)
////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createFlowers() {
    'use strict';
    // TO DO: Create flowers as Object3D(IF needed)
}

function createStars() {
    'use strict';
    // TO DO: Create stars as Object3D
}

function createDegrade() {
    'use strict';
    // TO DO: Create degrade as Object3D(????)
}

function createSkydome() {
    'use strict';
    // TO DO: Create skydome as Object3D
}

function createTerrain() {
    'use strict';
    // TO DO: Create terrain as Object3D
}

function createTree() {
    'use strict';
    // TO DO Rodrigo: Create tree as Object3D

    // Tree trunk

    // Branches

    // Leaves
}

function createMoon(radius, widthSegments, heightSegments) {
    'use strict';
    // Create an empty geometry
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const uvs = [];

    // Generate vertices
    for (let y = 0; y <= heightSegments; y++) {
        const v = y / heightSegments;
        const theta = v * Math.PI;
        for (let x = 0; x <= widthSegments; x++) {
            const u = x / widthSegments;
            const phi = u * Math.PI * 2;

            const px = -radius * Math.cos(phi) * Math.sin(theta);
            const py =  radius * Math.cos(theta);
            const pz =  radius * Math.sin(phi) * Math.sin(theta);

            vertices.push(px, py, pz);
            uvs.push(u, v);
        }
    }

    // Generate faces (indices)
    for (let y = 0; y < heightSegments; y++) {
        for (let x = 0; x < widthSegments; x++) {
            const a = y * (widthSegments + 1) + x;
            const b = a + widthSegments + 1;
            const c = b + 1;
            const d = a + 1;

            // Each quad is made of two triangles
            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    
    const material = new THREE.MeshPhongMaterial({ color: moonYellow, emissive: moonYellow });

    const moonMesh = new THREE.Mesh(geometry, material);
    moonMesh.position.set(20, 30, -30); // Position it in the sky

    moon = moonMesh;
}

function createOvniLights() {
    'use strict';
    // TO DO: Create ovni lights as Object3D
}

function createOvni(x, y, z) {
    'use strict';
    // TO DO: Create ovni as Object3D
}

function createbaseTrim() {
    'use strict';
    // TO DO Rodrigo: Create base trim as Object3D
}

function createWalls(x, y, z){
    'use strict';
    // TO DO Rodrigo: Create walls as Object3D

    // Side Wall

    // Front Wall

    // Back Wall

}

function createframeWindows() {
    'use strict';
    // TO DO Rodrigo: Create frame windows as Object3D

    // Sides Window Frame

    // Top Window Frame

    // Bottom Window Frame
}

function createWindows(x, y, z) {
    'use strict';
    // TO DO Rodrigo: Create windows as Object3D

    // Side Window

    // Front Windows

    // Door Window
}

function createDoor(x, y, z) {
    'use strict';
    // TO DO Rodrigo: Create door as Object3D
    
    // Door

    // Door Window?

}

function createCeiling(){
    'use strict';
    // TO DO Rodrigo: Create ceiling as Object3D
}

function createAlentejoHouse(x, y, z) {
    'use strict';
    // TO DO Rodrigo: Create Alentejo house as Object3D
    houseAlentejo = new THREE.Object3D();

    createWalls(x, y, z);

    createWindows(x, y, z);

    createDoor(x, y, z);

    createCeiling();

    scene.add(houseAlentejo);
}
// #endregion

// #region COLLISIONS
//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {}


///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {}
// #endregion

// #region UPDATE
////////////
/* UPDATE */
////////////
function update() {}
// #endregion

// #region DISPLAY
/////////////
/* DISPLAY */
/////////////
function createRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}
// #endregion

// #region INIT
////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    createScene();
    createCamera();
    createRenderer();
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onResize);

}
// #endregion

// #region ANIMATION CYCLE
/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function render() {
    renderer.render(scene, activeCamera);
}

function animate() {
    update();
    
    render();
    
    requestAnimationFrame(animate);
}
// #endregion

// #region RESIZE WINDOW
////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        activeCamera.aspect = window.innerWidth / window.innerHeight;
        activeCamera.updateProjectionMatrix();
    }
}
// #endregion

// #region KEY DOWN
///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';
    switch (e.keyCode) {
        case 49: // key '1'
            generateGroundTexture = true;
            groundPlane.material.map = generateFloralTexture();
            groundPlane.material.needsUpdate = true;
            break;
        case 50: // key '2'
            generateSkyTexture = true;
            skyDome.material.map = generateStarryTexture();
            skyDome.material.needsUpdate = true;
            break;
        case 68: // key 'D' or 'd'
            globalDirectionalLightOn = !globalDirectionalLightOn;
            globalDirectionalLight.visible = globalDirectionalLightOn;
            break;
    }
}
// #endregion 

// #region KEY UP
///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    'use strict';
    switch (e.keyCode) {
        case 49: // key '1'
            generateGroundTexture = false;
            break;
        case 50: // key '2'
            generateSkyTexture = false;
            break;
    }
}
// #endregion

init();

animate();