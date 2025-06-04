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

var moon, ovni, tree;
let houseAlentejo
// var skydome, terrain;

var treePos = [], trees = [];

/*
// Lights
var ambientLight = new THREE.AmbientLight( cor, intensidade? );
var globalLight = new THREE.DirectionalLight( cor, intensidade? );
var whatMAterial = "???";
*/

// Materials
const materials = new Map(), materialsLambert = new Map(), materialsPhong = new Map(), 
    materialsToon = new Map(), materialsBasic = new Map(), clock = new THREE.Clock();

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
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvasSize;
        const y = Math.random() * canvasSize;
        const r = 1 + Math.random() * 2;
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

function createTerrainWithHeightmap() {
    const loader = new THREE.TextureLoader();
    loader.load('heightmap.png', function(heightmap) {
        const img = heightmap.image;

        // Espera a imagem carregar completamente
        img.onload = () => {
            const width = img.width;
            const height = img.height;

            const geometry = new THREE.PlaneGeometry(500, 700, width , height ); // largura 2x maior que altura


            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;
            context.drawImage(img, 0, 0);
            const pixelData = context.getImageData(0, 0, width, height).data;

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const vertexIndex = y * width + x;
                    const pixelIndex = (y * width + x) * 4;
                    const elevation = pixelData[pixelIndex] / 255 * 35; // escalar a altura

                    geometry.attributes.position.setZ(vertexIndex, elevation);
                }
            }

            geometry.computeVertexNormals();

            const texture = generateFloralTexture();
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(25, 50); 

            const material = new THREE.MeshPhongMaterial({
                map: texture,
                flatShading: false,
                side: THREE.DoubleSide,
            });


            groundPlane = new THREE.Mesh(geometry, material);
            groundPlane.rotation.x = -Math.PI / 2;
            scene.add(groundPlane);
        };

        // Caso a imagem já esteja carregada (às vezes o `onload` não dispara)
        if (img.complete && img.naturalWidth !== 0) {
            img.onload(); 
        }
    });
}


// #region CREATE SCENE(S)
/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';
    scene = new THREE.Scene();

    createTerrainWithHeightmap();

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
    pers.position.set(0, 40, 100);
    pers.lookAt(0, 30, 10);

    cameras = {
        perspective: pers
    };

    activeCamera = cameras.perspective;
}
// #endregion

//////////////////////
/* CREATE MATERIALS */
//////////////////////
function createMaterials() {
    'use strict';
    materials.set("wall", new THREE.MeshLambertMaterial({ color: white, side: THREE.FrontSide }));
    materials.set("window", new THREE.MeshLambertMaterial({ color: blue, side: THREE.FrontSide }));
    materials.set("door", new THREE.MeshLambertMaterial({ color: brown, side: THREE.FrontSide }));
    materials.set("frame", new THREE.MeshLambertMaterial({ color: yellow, side: THREE.FrontSide }));
    materials.set("baseTrim", new THREE.MeshLambertMaterial({ color: yellow, side: THREE.FrontSide }));
    materials.set("ceiling", new THREE.MeshLambertMaterial({ color: tileOrange, side: THREE.FrontSide }));
    // TO DO: Create materials for objects
    // TO DO Rodrigo: from my parts

    createLambertMaterials();
    createPhongMaterials();
    createToonMaterials();
    createBasicMaterials();
}

function createToonMaterials() {
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

function createLambertMaterials() {
    'use strict';
    materialsLambert.set("wall", new THREE.MeshLambertMaterial({ color: white }));
    materialsLambert.set("window", new THREE.MeshLambertMaterial({ color: blue }));
    materialsLambert.set("door", new THREE.MeshLambertMaterial({ color: brown }));
    materialsLambert.set("frame", new THREE.MeshLambertMaterial({ color: yellow }));
    materialsLambert.set("baseTrim", new THREE.MeshLambertMaterial({ color: yellow }));
    materialsLambert.set("ceiling", new THREE.MeshLambertMaterial({ color: tileOrange }));
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
function createFrameDoor(x, y, z) {
    'use strict';
    const group = new THREE.Object3D();
    const mat = materials.get("frame");

    const width = 1.0;
    const height = 2.0;
    const thickness = 0.25;
    const zFront = 4.5;

    const halfWidth = width / 2;
    const top = 0.5;
    const bottom = -1;


    // Left
    addQuadToGroup(group,
        [-halfWidth - thickness, bottom, zFront],
        [-halfWidth, bottom, zFront],
        [-halfWidth, top, zFront],
        [-halfWidth - thickness, top, zFront],
        mat
    );

    // Right
    addQuadToGroup(group,
        [halfWidth, bottom, zFront],
        [halfWidth + thickness, bottom, zFront],
        [halfWidth + thickness, top, zFront],
        [halfWidth, top, zFront],
        mat
    );

    // Top
    addQuadToGroup(group,
        [-halfWidth - thickness, top, zFront],
        [halfWidth + thickness, top, zFront],
        [halfWidth + thickness, top + thickness, zFront],
        [-halfWidth - thickness, top + thickness, zFront],
        mat
    );

    houseAlentejo.add(group);
}

function createDoor(x, y, z) {
    'use strict';
    const door = new THREE.Object3D();
    const mat = materials.get("door");

    const doorWidth = 1.0;
    const doorHeight = 2.0;
    const halfWidth = doorWidth / 2;
    const zFront = 4.5;

    addQuadToGroup(door,
    [-halfWidth, -1.5, zFront],
    [halfWidth, -1.5, zFront],
    [halfWidth, 0.5, zFront],
    [-halfWidth, 0.5, zFront],
    mat
    );

    houseAlentejo.add(door);
    createFrameDoor(x, y, z);
}

function createFrameWindows(x, y, z) {
    'use strict';
    const mat = materials.get("frame");

    const width = 1.5;
    const height = 1.0;
    const thickness = 0.25;

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const zCenter = 0;
    const zBottom = zCenter - halfHeight;
    const zTop = zCenter + halfHeight;

    const group = new THREE.Object3D();

    // Front wall windows
    const yFront = 4.5;
    const xCentersFront = [3, -3];

    for (const xC of xCentersFront) {
        const xLeft = xC - halfWidth;
        const xRight = xC + halfWidth;

        // Left side
        addQuadToGroup(group,
            [xLeft - thickness, yFront, zBottom],
            [xLeft, yFront, zBottom],
            [xLeft, yFront, zTop],
            [xLeft - thickness, yFront, zTop],
            mat
        );

        // Right side
        addQuadToGroup(group,
            [xRight, yFront, zBottom],
            [xRight + thickness, yFront, zBottom],
            [xRight + thickness, yFront, zTop],
            [xRight, yFront, zTop],
            mat
        );

        // Top
        addQuadToGroup(group,
            [xLeft - thickness, yFront, zTop],
            [xRight + thickness, yFront, zTop],
            [xRight + thickness, yFront, zTop + thickness],
            [xLeft - thickness, yFront, zTop + thickness],
            mat
        );

        // Bottom
        addQuadToGroup(group,
            [xLeft - thickness, yFront, zBottom - thickness],
            [xRight + thickness, yFront, zBottom - thickness],
            [xRight + thickness, yFront, zBottom],
            [xLeft - thickness, yFront, zBottom],
            mat
        );
    }

    // Left wall windows
    const xSide = 5;
    const yCentersSide = [2.25, -2.25];

    for (const yC of yCentersSide) {
        const yBottom = yC - halfWidth;
        const yTop = yC + halfWidth;

        // Right side
        addQuadToGroup(group,
            [xSide, yBottom, zBottom - thickness],
            [xSide, yBottom, zBottom],
            [xSide, yTop, zBottom],
            [xSide, yTop, zBottom - thickness],
            mat
        );

        // Left side
        addQuadToGroup(group,
            [xSide, yBottom, zTop],
            [xSide, yBottom, zTop + thickness],
            [xSide, yTop, zTop + thickness],
            [xSide, yTop, zTop],
            mat
        );

        // Top
        addQuadToGroup(group,
            [xSide, yTop, zBottom - thickness],
            [xSide, yTop, zTop + thickness],
            [xSide, yTop + thickness, zTop + thickness],
            [xSide, yTop + thickness, zBottom - thickness],
            mat
        );

        // Bottom
        addQuadToGroup(group,
            [xSide, yBottom - thickness, zBottom - thickness],
            [xSide, yBottom - thickness, zTop + thickness],
            [xSide, yBottom, zTop + thickness],
            [xSide, yBottom, zBottom - thickness],
            mat
        );
    }

    houseAlentejo.add(group);
}

function createWindows(x, y, z) {
    'use strict';
    const mat = materials.get("window");

    const width = 1.5;
    const height = 1.0;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const zCenter = 0;
    const zBottom = zCenter - halfHeight;
    const zTop = zCenter + halfHeight;

    const group = new THREE.Object3D();

    // Front wall windows
    const yFront = 4.5;
    const xCentersFront = [3, -3];

    for (const xC of xCentersFront) {
        addQuadToGroup(group,
            [xC - halfWidth, yFront, zBottom],
            [xC + halfWidth, yFront, zBottom],
            [xC + halfWidth, yFront, zTop],
            [xC - halfWidth, yFront, zTop],
            mat
        );
    }

    // Left wall windows
    const xSide = 5;
    const yCentersSide = [2.25, -2.25];

    for (const yC of yCentersSide) {
        addQuadToGroup(group,
            [xSide, yC - halfWidth, zBottom],
            [xSide, yC + halfWidth, zBottom],
            [xSide, yC + halfWidth, zTop],
            [xSide, yC - halfWidth, zTop],
            mat
        );
    }

    houseAlentejo.add(group);
}

function createBaseTrim(x, y, z) {
    'use strict';
    const mat = materials.get("baseTrim");
    const group = new THREE.Object3D();

    const houseWidth = 10;      // x = -5 to +5
    const houseDepth = 9;       // z = -4.5 to +4.5
    const trimHeight = 0.5;

    const halfWidth = houseWidth / 2;
    const halfDepth = houseDepth / 2;

    const yBottom = 0;
    const yTop = yBottom + trimHeight;

    const doorHalfWidth = 0.5;
    const frameThickness = 0.25;

    // Front wall trim
    // Base trim of the left side of the front wall
    addQuadToGroup(group,
        [-halfWidth, yBottom, 4.5],
        [-doorHalfWidth - frameThickness, yBottom, 4.5],
        [-doorHalfWidth - frameThickness, yTop, 4.5],
        [-halfWidth, yTop, 4.5],
        mat
    );

    // Base trim of the right side of the front wall
    addQuadToGroup(group,
        [doorHalfWidth + frameThickness, yBottom, 4.5],
        [halfWidth, yBottom, 4.5],
        [halfWidth, yTop, 4.5],
        [doorHalfWidth + frameThickness, yTop, 4.5],
        mat
    );

    // Back wall trim
    addQuadToGroup(group,
        [-halfWidth, yBottom, -4.5],
        [halfWidth, yBottom, -4.5],
        [halfWidth, yTop, -4.5],
        [-halfWidth, yTop, -4.5],
        mat
    );

    // Left side trim
    addQuadToGroup(group,
        [5, yBottom, -halfDepth],
        [5, yBottom, halfDepth],
        [5, yTop, halfDepth],
        [5, yTop, -halfDepth],
        mat
    );

    // Right side trim
    addQuadToGroup(group,
        [-5, yBottom, -halfDepth],
        [-5, yBottom, halfDepth],
        [-5, yTop, halfDepth],
        [-5, yTop, -halfDepth],
        mat
    );

    houseAlentejo.add(group);
}

function createFrameHouse(x, y, z) {
    'use strict';
    const mat = materials.get("frame");
    const group = new THREE.Object3D();

    const thickness = 0.5;
    const yBottom = -1;
    const yTop = 1.5;

    // Corners Front Wall
    addQuadToGroup(group, [4.5, yBottom, 4.5], [5, yBottom, 4.5], [5, yTop, 4.5], [4.5, yTop, 4.5], mat);
    addQuadToGroup(group, [-5, yBottom, 4.5], [-4.5, yBottom, 4.5], [-4.5, yTop, 4.5], [-5, yTop, 4.5], mat);

    // Corners Back Wall
    addQuadToGroup(group, [4.5, yBottom, -4.5], [5, yBottom, -4.5], [5, yTop, -4.5], [4.5, yTop, -4.5], mat);
    addQuadToGroup(group, [-5, yBottom, -4.5], [-4.5, yBottom, -4.5], [-4.5, yTop, -4.5], [-5, yTop, -4.5], mat);

    // Corners Left Wall
    addQuadToGroup(group, [5, yBottom, 4], [5, yBottom, 4.5], [5, yTop, 4.5], [5, yTop, 4], mat);
    addQuadToGroup(group, [5, yBottom, -4.5], [5, yBottom, -4], [5, yTop, -4], [5, yTop, -4.5], mat);

    // Corners Right Wall
    addQuadToGroup(group, [-5, yBottom, 4], [-5, yBottom, 4.5], [-5, yTop, 4.5], [-5, yTop, 4], mat);
    addQuadToGroup(group, [-5, yBottom, -4.5], [-5, yBottom, -4], [-5, yTop, -4], [-5, yTop, -4.5], mat);

    houseAlentejo.add(group);
}

function createWalls(x, y, z) {
    'use strict';
    const mat = materials.get("wall");
    const group = new THREE.Object3D();

    // === Front Wall (z = 4.5) ===
    const zFront = 4.5;
    addQuadToGroup(group, [-4.5, 0.75, zFront], [4.5, 0.75, zFront], [4.5, 1.5, zFront], [-4.5, 1.5, zFront], mat);         // Above windows
    addQuadToGroup(group, [-4.5, -1.0, zFront], [-4.0, -1.0, zFront], [-4.0, 1.5, zFront], [-4.5, 1.5, zFront], mat);       // Between framewindow and framehouse
    addQuadToGroup(group, [4.0, -1.0, zFront], [4.5, -1.0, zFront], [4.5, 1.5, zFront], [4.0, 1.5, zFront], mat);           // Between framewindow and framehouse
    addQuadToGroup(group, [-2.0, -1.0, zFront], [-0.75, -1.0, zFront], [-0.75, 0.75, zFront], [-2.0, 0.75, zFront], mat);   // Between framedoor and framewindow
    addQuadToGroup(group, [0.75, -1.0, zFront], [2.0, -1.0, zFront], [2.0, 0.75, zFront], [0.75, 0.75, zFront], mat);       // Between framedoor and framewindow
    addQuadToGroup(group, [-4.0, -1.0, zFront], [-2.0, -1.0, zFront], [-2.0, -0.75, zFront], [-4.0, -0.75, zFront], mat);   // Behind framewindow
    addQuadToGroup(group, [2.0, -1.0, zFront], [4.0, -1.0, zFront], [4.0, -0.75, zFront], [2.0, -0.75, zFront], mat);       // Behind framewindow

    // === Back Wall (z = -4.5) ===
    const zBack = -4.5;
    addQuadToGroup(group, [-4.5, -1.0, zBack], [4.5, -1.0, zBack], [4.5, 1.5, zBack], [-4.5, 1.5, zBack], mat);

    // === Left Wall (x = 5) ===
    const xLeft = 5;
    addQuadToGroup(group, [xLeft, 0.75, -3.25], [xLeft, 0.75, 3.25], [xLeft, 1.5, 3.25], [xLeft, 1.5, -3.25], mat);         // Above windows
    addQuadToGroup(group, [xLeft, -0.75, -1.25], [xLeft, -0.75, 1.25], [xLeft, 0.75, 1.25], [xLeft, 0.75, -1.25], mat);     // Between framewindow and framehouse
    addQuadToGroup(group, [xLeft, -1.0, -3.25], [xLeft, -1.0, 3.25], [xLeft, -0.75, 3.25], [xLeft, -0.75, -3.25], mat);     // Behind windows
    addQuadToGroup(group, [xLeft, -1.0, 3.25], [xLeft, -1.0, 4.0], [xLeft, 1.5, 4.0], [xLeft, 1.5, 3.25], mat);             // Between framewindow and framehouse
    addQuadToGroup(group, [xLeft, -1.0, -4.0], [xLeft, -1.0, -3.25], [xLeft, 1.5, -3.25], [xLeft, 1.5, -4.0], mat);         // Between framewindow and framehouse

    // === Right Wall (x = -5) ===
    const xRight = -5;
    addQuadToGroup(group, [xRight, -1.0, -4.0], [xRight, -1.0, 4.0], [xRight, 1.5, 4.0], [xRight, 1.5, -4.0], mat);

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
    createMaterials();
    createAlentejoHouse(0, 0, 0);
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
            const newTexture = generateFloralTexture();
            newTexture.wrapS = THREE.RepeatWrapping;
            newTexture.wrapT = THREE.RepeatWrapping;
            newTexture.repeat.set(25, 30);
            groundPlane.material.map = newTexture;
            groundPlane.material.needsUpdate = true;
            break;

        case 50: // key '2'
            generateSkyTexture = true;
            skyDome.material.map = generateStarryTexture();
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(25, 50); 
            
            skyDome.material.needsUpdate = true;
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