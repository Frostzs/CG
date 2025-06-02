//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var cameras = [], camera, scene, renderer;
// var bufferSceneTerrain, bufferTextureTerrain, bufferSceneSky, bufferTextureSky;

var geometry, mesh;

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
    materialsToon = newMap(), materialBAsic = new Map(), clock = new THREE.Clock();

const keys = {}, movementVector = new THREE.Vector2(0, 0);

// Shade
let shadeCalculation = true;

// colors
const yellow = 0xf2b632;
const white = 0xffffff;
const brown = 0x5a3825;
const tileOrange = 0xb55239;
const blue = 0x003366;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';
    // Create a new scene
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCameras() {
    // TO DO: Create multiple cameras if needed
}

//////////////////////
/* CREATE MATERIALS */
//////////////////////
function createMAterials() {
    'use strict';
    // TO DO: Create materials for objects
    // TO DO Rodrigo: from my parts
}

function createToonMAterials() {
    'use strict';
    // TO DO: Create toon materials for objects
    // TO DO Rodrigo: from my parts
}

function createLAmbertMAterials() {
    'use strict';
    // TO DO: Create Lambert materials for objects
    // TO DO Rodrigo: from my parts
}

function createPhongMaterials() {
    'use strict';
    // TO DO: Create Phong materials for objects
    // TO DO Rodrigo: from my parts
}

function createBasicMaterials() {
    'use strict';
    // TO DO: Create basic materials for objects
    // TO DO Rodrigo: from my parts
}

function updateMaterials() {
    'use strict';
    // TO DO: Update materials if needed
    // TO DO Rodrigo: from my parts
}

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

function createMoon() {
    'use strict';
    // TO DO: Create moon as Object3D
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

////////////////////////
/*       LIGHTS       */
////////////////////////
function updateLights() {
    'use strict';
    // TO DO: Update lights if needed
}

///////////////////////
/* SHADE CALCULATION */
///////////////////////
function updateShadeCalculation() {
    'use strict';
    // TO DO: Update shade calculation if needed
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {
    'use strict';
    // TO DO: Check for collisions between objects
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handlePosition() {
    'use strict';
    // TO DO: Handle position of objects if needed
}

//////////////////////
/*      UPDATE      */
//////////////////////
function update() {
    'use strict';
    // TO DO: Update scene, camera, materials, lights, etc.
}

///////////////////////
/*      DISPLAY      */
///////////////////////
function render() {
    'use strict';
    renderer.render(scene, camera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';
    // Initialize scene, camera, renderer, materials, objects, lights, etc.
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';
    // TO DO: Animate the scene, update objects, handle collisions, etc.
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
    'use strict';
    // Update camera aspect ratio and renderer size on window resize
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown() {
    'use strict';
    // Handle key down events for movement or actions
}

/////////////////////
/* KEY UP CALLBACK */
/////////////////////
function onKeyUp() {
    'use strict';
    // Handle key up events to stop movement or actions
}



/* VERSÂO ANTIGA */
/*
function createBox(obj, x, y, z, width, height, depth, color) {
  'use strict';

  // Swap height and depth so height is treated as Z
  const geometry = new THREE.BoxGeometry(width, depth, height);
  const material = new THREE.MeshPhongMaterial({ color: color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  obj.add(mesh);

  objects.push(mesh);
  colors.push(color);

  return mesh;
}

function createAlentejoHouse(scene) {
  const base = new THREE.Object3D();
  createBox(base, 0, 0, 0, 20, 10, 8, white); // house structure
  scene.add(base);
  return base;
}

function createDoor(obj) {
  const frame = new THREE.Object3D();

  const frameDepth = 0.2;
  const doorWidth = 0.7;
  const doorHeight = 2;
  const doorDepth = 0.2;

  const y = 5;       // front face of house
  const z = -3;      // center of door height

  // Side frames
  createBox(frame, -doorWidth / 2 - frameDepth / 2, y, z, frameDepth, doorDepth, doorHeight, yellow);
  createBox(frame, doorWidth / 2 + frameDepth / 2, y, z, frameDepth, doorDepth, doorHeight, yellow);

  // Top frame
  createBox(frame, 0, y, z + doorHeight / 2 + frameDepth / 2, doorWidth + 2 * frameDepth, doorDepth, frameDepth, yellow);

  // Door
  createBox(frame, 0, y, z, doorWidth, doorDepth, doorHeight, brown);

  // Door window
  createBox(frame, 0, y, z + 0.75, 0.5, doorDepth, 0.5, blue);

  obj.add(frame);
}

function createWindow(obj, x, y, z) {
  const win = new THREE.Object3D();

  const width = 1;
  const height = 1;
  const depth = 0.2;
  const frame = 0.2;

  // Side frames
  createBox(win, x - width / 2 - frame / 2, y, z, frame, depth, height, yellow);
  createBox(win, x + width / 2 + frame / 2, y, z, frame, depth, height, yellow);

  // Top frame
  createBox(win, x, y, z + height / 2 + frame / 2, width + 2 * frame, depth, frame, yellow);

  // Window pane
  createBox(win, x, y, z, width, depth, height, blue);

  obj.add(win);
}

function createFrontWindows(obj) {
  const y = 5;      // front face
  const z = 0;      // center height of windows
  const positionsX = [-7.5, -2.5, 2.5, 7.5];

  positionsX.forEach((x) => {
    createWindow(obj, x, y, z);
  });
}
*/