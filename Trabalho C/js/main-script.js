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

var moon, ovni, houseAlentejo, tree;
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
const tileOrange = 0xcf5000;
const blue = 0x0f2aff;
const black = 0xffffff;
const bluecyan = 0x00ffff;


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

//////////////////////
/* CREATE MATERIALS */
//////////////////////
function createMAterials() {
    'use strict';
    materials.set("wall", new THREE.MeshLambertMaterial({ color: white, side: THREE.FrontSide }));
    materials.set("window", new THREE.MeshLambertMaterial({ color: blue, side: THREE.FrontSide }));
    materials.set("door", new THREE.MeshLambertMaterial({ color: brown, side: THREE.FrontSide }));
    materials.set("frame", new THREE.MeshLambertMaterial({ color: yellow, side: THREE.FrontSide }));
    materials.set("baseTrim", new THREE.MeshLambertMaterial({ color: yellow, side: THREE.FrontSide }));
    materials.set("ceiling", new THREE.MeshLambertMaterial({ color: tileOrange, side: THREE.FrontSide }));
    // TO DO: Create materials for objects
    // TO DO Rodrigo: from my parts

    createLAmbertMAterials();
    createPhongMaterials();
    createToonMAterials();
    createBasicMaterials();
}

function createToonMAterials() {
    'use strict';
    materialsToon.set("wall", new THREE.MeshLambertMaterial({ color: white }));
    materialsToon.set("window", new THREE.MeshLambertMaterial({ color: blue }));
    materialsToon.set("door", new THREE.MeshLambertMaterial({ color: brown }));
    materialsToon.set("frame", new THREE.MeshLambertMaterial({ color: yellow }));
    materialsToon.set("baseTrim", new THREE.MeshLambertMaterial({ color: yellow }));
    materialsToon.set("ceiling", new THREE.MeshLambertMaterial({ color: tileOrange }));
    // TO DO: Create toon materials for objects
    // TO DO Rodrigo: from my parts
}

function createLAmbertMAterials() {
    'use strict';
    materialsLAmbert.set("wall", new THREE.MeshLambertMaterial({ color: white }));
    materialsLAmbert.set("window", new THREE.MeshLambertMaterial({ color: blue }));
    materialsLAmbert.set("door", new THREE.MeshLambertMaterial({ color: brown }));
    materialsLAmbert.set("frame", new THREE.MeshLambertMaterial({ color: yellow }));
    materialsLAmbert.set("baseTrim", new THREE.MeshLambertMaterial({ color: yellow }));
    materialsLAmbert.set("ceiling", new THREE.MeshLambertMaterial({ color: tileOrange }));
    // TO DO: Create Lambert materials for objects
    // TO DO Rodrigo: from my parts
}

function createPhongMaterials() {
    'use strict';
    materialsPhong.set("wall", new THREE.MeshLambertMaterial({ color: white }));
    materialsPhong.set("window", new THREE.MeshLambertMaterial({ color: blue }));
    materialsPhong.set("door", new THREE.MeshLambertMaterial({ color: brown }));
    materialsPhong.set("frame", new THREE.MeshLambertMaterial({ color: yellow }));
    materialsPhong.set("baseTrim", new THREE.MeshLambertMaterial({ color: yellow }));
    materialsPhong.set("ceiling", new THREE.MeshLambertMaterial({ color: tileOrange }));
    // TO DO: Create Phong materials for objects
    // TO DO Rodrigo: from my parts
}

function createBasicMaterials() {
    'use strict';
    materialsBasic.set("wall", new THREE.MeshLambertMaterial({ color: white }));
    materialsBasic.set("window", new THREE.MeshLambertMaterial({ color: blue }));
    materialsBasic.set("door", new THREE.MeshLambertMaterial({ color: brown }));
    materialsBasic.set("frame", new THREE.MeshLambertMaterial({ color: yellow }));
    materialsBasic.set("baseTrim", new THREE.MeshLambertMaterial({ color: yellow }));
    materialsBasic.set("ceiling", new THREE.MeshLambertMaterial({ color: tileOrange }));
    // TO DO: Create basic materials for objects
    // TO DO Rodrigo: from my parts
}

function updateMaterials() {
    'use strict';
    // TO DO: Update materials if needed
    // TO DO Rodrigo: from my parts
}

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

// Auxiliar function to create a section with color
function addQuadToGroup(group, p1, p2, p3, p4, material) {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    ...p1, ...p2, ...p3,
    ...p1, ...p3, ...p4
  ]);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);
}

// #region CREATE HOUSE
function createWindowDoor(x, y, z) {
    'use strict';
    const windowGroup = new THREE.Object3D();
    const mat = materials.get("window");

    const width = 0.3;
    const height = 0.4;
    const halfWidth = width / 2;

    const centerY = 1.0; // height of the window door center
    const bottom = centerY - height / 2;
    const top = centerY + height / 2;

    const zFront = 5.01;

    addQuadToGroup(windowGroup,
        [-halfWidth, bottom, zFront],
        [halfWidth, bottom, zFront],
        [halfWidth, top, zFront],
        [-halfWidth, top, zFront],
        mat
    );

    houseAlentejo.add(windowGroup);
}

function createFrameDoor(x, y, z) {
    'use strict';

    const group = new THREE.Object3D();
//  const mat = materials.get("frame");
    const mat = new THREE.MeshBasicMaterial({ color: yellow });

    const doorWidth = 0.7;
    const doorHeight = 2.0;
    const frameThickness = 0.2;

    const halfWidth = doorWidth / 2;
    const zFront = 5;
    const bottom = 0;
    const top = bottom + doorHeight;

    // Left 
    addQuadToGroup(group,
        [-halfWidth - frameThickness, bottom, zFront],
        [-halfWidth, bottom, zFront],
        [-halfWidth, top, zFront],
        [-halfWidth - frameThickness, top, zFront],
        mat
    );

    // Right
    addQuadToGroup(group,
        [halfWidth, bottom, zFront],
        [halfWidth + frameThickness, bottom, zFront],
        [halfWidth + frameThickness, top, zFront],
        [halfWidth, top, zFront],
        mat
    );

    // Top
    addQuadToGroup(group,
        [-halfWidth - frameThickness, top, zFront],
        [halfWidth + frameThickness, top, zFront],
        [halfWidth + frameThickness, top + frameThickness, zFront],
        [-halfWidth - frameThickness, top + frameThickness, zFront],
        mat
    );

    // Bottom
    addQuadToGroup(group,
        [-halfWidth - frameThickness, bottom - frameThickness, zFront],
        [halfWidth + frameThickness, bottom - frameThickness, zFront],
        [halfWidth + frameThickness, bottom, zFront],
        [-halfWidth - frameThickness, bottom, zFront],
        mat
    );

    houseAlentejo.add(group);
}

function createDoor(x, y, z) {
    'use strict';

    const door = new THREE.Object3D();
//  const mat = materials.get("door");
    const mat = new THREE.MeshBasicMaterial({ color: brown });

    const doorWidth = 0.7;
    const doorHeight = 2.0;
    const halfWidth = doorWidth / 2;

    // Height of the bottom of the door
    const bottom = 0;
    const top = bottom + doorHeight;

    // Front wall in z = 5 plane
    const zFront = 5;

    addQuadToGroup(door,
        [-halfWidth, bottom, zFront],
        [halfWidth, bottom, zFront],
        [halfWidth, top, zFront],
        [-halfWidth, top, zFront],
        mat
    );

    houseAlentejo.add(door);

    createWindowDoor(x, y, z);
    createFrameDoor(x, y, z);
}

function createFrameWindows(x, y, z) {
    'use strict';

    const frameMat = materials.get("frame");
    const thickness = 0.2;
    const width = 1.0;
    const height = 1.5;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const yCenter = 0.25;
    const yBottom = yCenter - halfHeight;
    const yTop = yCenter + halfHeight;

    const zFront = 5;
    const xSide = 7.5;

    const group = new THREE.Object3D();

    // Front wall windows
    const xOffsetsFront = [-4.5, 4.5];

    for (const xPos of xOffsetsFront) {
        // Left side
        addQuadToGroup(group,
            [xPos - halfWidth - thickness, yBottom, zFront],
            [xPos - halfWidth, yBottom, zFront],
            [xPos - halfWidth, yTop, zFront],
            [xPos - halfWidth - thickness, yTop, zFront],
            frameMat
        );

        // Right side
        addQuadToGroup(group,
            [xPos + halfWidth, yBottom, zFront],
            [xPos + halfWidth + thickness, yBottom, zFront],
            [xPos + halfWidth + thickness, yTop, zFront],
            [xPos + halfWidth, yTop, zFront],
            frameMat
        );

        // Top
        addQuadToGroup(group,
            [xPos - halfWidth - thickness, yTop, zFront],
            [xPos + halfWidth + thickness, yTop, zFront],
            [xPos + halfWidth + thickness, yTop + thickness, zFront],
            [xPos - halfWidth - thickness, yTop + thickness, zFront],
            frameMat
        );

        // Bottom
        addQuadToGroup(group,
            [xPos - halfWidth - thickness, yBottom - thickness, zFront],
            [xPos + halfWidth + thickness, yBottom - thickness, zFront],
            [xPos + halfWidth + thickness, yBottom, zFront],
            [xPos - halfWidth - thickness, yBottom, zFront],
            frameMat
        );
    }

    // Left wall windows in x = 7.5 plane
    const zOffsetsSide = [-3, 3];
    for (const zPos of zOffsetsSide) {
        // Left side
        addQuadToGroup(group,
            [xSide, yBottom, zPos - halfWidth - thickness],
            [xSide, yBottom, zPos - halfWidth],
            [xSide, yTop, zPos - halfWidth],
            [xSide, yTop, zPos - halfWidth - thickness],
            frameMat
        );

        // Right side
        addQuadToGroup(group,
            [xSide, yBottom, zPos + halfWidth],
            [xSide, yBottom, zPos + halfWidth + thickness],
            [xSide, yTop, zPos + halfWidth + thickness],
            [xSide, yTop, zPos + halfWidth],
            frameMat
        );

        // Top
        addQuadToGroup(group,
            [xSide, yTop, zPos - halfWidth - thickness],
            [xSide, yTop, zPos + halfWidth + thickness],
            [xSide, yTop + thickness, zPos + halfWidth + thickness],
            [xSide, yTop + thickness, zPos - halfWidth - thickness],
            frameMat
        );

        // Bottom
        addQuadToGroup(group,
            [xSide, yBottom - thickness, zPos - halfWidth - thickness],
            [xSide, yBottom - thickness, zPos + halfWidth + thickness],
            [xSide, yBottom, zPos + halfWidth + thickness],
            [xSide, yBottom, zPos - halfWidth - thickness],
            frameMat
        );
    }

    houseAlentejo.add(group);
}

function createWindows(x, y, z) {
    'use strict';

//  const mat = materials.get("window");
    const mat = new THREE.MeshBasicMaterial({ color: bluecyan });

    const width = 1.0;
    const height = 1.5;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const yCenter = 0.25;
    const yBottom = yCenter - halfHeight;
    const yTop = yCenter + halfHeight;

    const zFront = 5;
    const xSide = 7.5;

    const group = new THREE.Object3D();

    // Front wall windows
    const xOffsetsFront = [-4.5, 4.5];

    for (const xPos of xOffsetsFront) {
        addQuadToGroup(group,
            [xPos - halfWidth, yBottom, zFront],
            [xPos + halfWidth, yBottom, zFront],
            [xPos + halfWidth, yTop, zFront],
            [xPos - halfWidth, yTop, zFront],
            mat
        );
    }

    // Left wall windows
    const zOffsetsSide = [-3, 3];
    for (const zPos of zOffsetsSide) {
        addQuadToGroup(group,
            [xSide, yBottom, zPos - halfWidth],
            [xSide, yBottom, zPos + halfWidth],
            [xSide, yTop, zPos + halfWidth],
            [xSide, yTop, zPos - halfWidth],
            mat
        );
    }

    houseAlentejo.add(group);
}

function createBaseTrim(x, y, z) {
    'use strict';

    const mat = materials.get("baseTrim");
    const group = new THREE.Object3D();

    const houseWidth = 15;
    const houseDepth = 10;
    const trimHeight = 0.5;

    const halfWidth = houseWidth / 2;
    const halfDepth = houseDepth / 2;

    const yBottom = -2.5;
    const yTop = yBottom + trimHeight;

    // Front wall trim
    addQuadToGroup(group,
        [-halfWidth, yBottom, +5],
        [halfWidth, yBottom, +5],
        [halfWidth, yTop, +5],
        [-halfWidth, yTop, +5],
        mat
    );

    // Back wall trim
    addQuadToGroup(group,
        [-halfWidth, yBottom, -5],
        [halfWidth, yBottom, -5],
        [halfWidth, yTop, -5],
        [-halfWidth, yTop, -5],
        mat
    );

    // Right side trim
    addQuadToGroup(group,
        [+7.5, yBottom, -halfDepth],
        [+7.5, yBottom, +halfDepth],
        [+7.5, yTop, +halfDepth],
        [+7.5, yTop, -halfDepth],
        mat
    );

    // Left side trim
    addQuadToGroup(group,
        [-7.5, yBottom, -halfDepth],
        [-7.5, yBottom, +halfDepth],
        [-7.5, yTop, +halfDepth],
        [-7.5, yTop, -halfDepth],
        mat
    );

    houseAlentejo.add(group);
}

function createFrameHouse(x, y, z) {
    'use strict';

    const mat = materials.get("frame");
    const group = new THREE.Object3D();

    const houseWidth = 15;
    const houseDepth = 10;
    const height = 5.0;
    const thickness = 0.5;

    const halfWidth = houseWidth / 2;
    const halfDepth = houseDepth / 2;

    const yBottom = -2.5;
    const yTop = yBottom + height;

    // Left front corner
    addQuadToGroup(group,
        [-halfWidth - thickness, yBottom, +5],
        [-halfWidth, yBottom, +5],
        [-halfWidth, yTop, +5],
        [-halfWidth - thickness, yTop, +5],
        mat
    );

    // Right front corner
    addQuadToGroup(group,
        [+halfWidth, yBottom, +5],
        [+halfWidth + thickness, yBottom, +5],
        [+halfWidth + thickness, yTop, +5],
        [+halfWidth, yTop, +5],
        mat
    );

    // Left back corner
    addQuadToGroup(group,
        [-halfWidth - thickness, yBottom, -5],
        [-halfWidth, yBottom, -5],
        [-halfWidth, yTop, -5],
        [-halfWidth - thickness, yTop, -5],
        mat
    );

    // Right back corner
    addQuadToGroup(group,
        [+halfWidth, yBottom, -5],
        [+halfWidth + thickness, yBottom, -5],
        [+halfWidth + thickness, yTop, -5],
        [+halfWidth, yTop, -5],
        mat
    );

    houseAlentejo.add(group);
}

function createWalls(x, y, z) {
    'use strict';

    console.log();

    const mat = new THREE.MeshBasicMaterial({ color: white, side: THREE.DoubleSide });

    const group = new THREE.Object3D();

    const zFront = 5;
    const yBottom = -2.5;
    const yTop = 2.5;
    const yWindowBottom = -0.5;
    const yWindowTop = 1.0;
    const doorLeft = -0.35;
    const doorRight = 0.35;

    // Block 1 - above the door
    addQuadToGroup(group,
        [doorLeft, yWindowTop, zFront],
        [doorRight, yWindowTop, zFront],
        [doorRight, yTop, zFront],
        [doorLeft, yTop, zFront],
        mat
    );

    // Bloch 2 – between door and left window
    addQuadToGroup(group,
        [-4.0, yBottom, zFront],
        [doorLeft, yBottom, zFront],
        [doorLeft, yTop, zFront],
        [-4.0, yTop, zFront],
        mat
    );

    // Block 3 – between door and right window
    addQuadToGroup(group,
        [doorRight, yBottom, zFront],
        [4.0, yBottom, zFront],
        [4.0, yTop, zFront],
        [doorRight, yTop, zFront],
        mat
    );

    // Block 4 – below right window
    addQuadToGroup(group,
        [4.0, yBottom, zFront],
        [5.0, yBottom, zFront],
        [5.0, yWindowBottom, zFront],
        [4.0, yWindowBottom, zFront],
        mat
    );

    // Block 5 – below left window
    addQuadToGroup(group,
        [-5.0, yBottom, zFront],
        [-4.0, yBottom, zFront],
        [-4.0, yWindowBottom, zFront],
        [-5.0, yWindowBottom, zFront],
        mat
    );

    // Block 6 – left side of the front wall
    addQuadToGroup(group,
        [-7.5, yBottom, zFront],
        [-5.0, yBottom, zFront],
        [-5.0, yTop, zFront],
        [-7.5, yTop, zFront],
        mat
    );

    // Block 7 – right side of the front wall
    addQuadToGroup(group,
        [5.0, yBottom, zFront],
        [7.5, yBottom, zFront],
        [7.5, yTop, zFront],
        [5.0, yTop, zFront],
        mat
    );

    // Block 8 – top horizontal of the front wall
    addQuadToGroup(group,
        [-7.5, yTop, zFront],
        [7.5, yTop, zFront],
        [7.5, yTop + 0.2, zFront],
        [-7.5, yTop + 0.2, zFront],
        mat
    );

    houseAlentejo.add(group);
}

function createCeiling(){
    'use strict';
    // TO DO Rodrigo: Create ceiling as Object3D
}

function createAlentejoHouse(x, y, z) {
    'use strict';

    houseAlentejo = new THREE.Object3D();

    createDoor(x, y, z);
    createWindows(x, y, z);
    createBaseTrim(x, y, z);
    createFrameHouse(x, y, z);
    createWalls(x, y, z);
    houseAlentejo.position.set(x, y, z);
    scene.add(houseAlentejo);
}// #endregion CREATE HOUSE
// #endregion CREATE OBJECT3D(S)

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