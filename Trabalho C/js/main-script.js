import * as THREE from "three";
import { VRButton } from './VRButton.js';
import { OrbitControls } from './OrbitControls.js';


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

let  ovniGroup, ovniPointLights = [], ovniSpotLight;
let ovniPointLightsOn = true, ovniSpotLightOn = true;
let ovniMoving = { left: false, right: false, up: false, down: false };
const OVNI_RADIUS = 5, OVNI_HEIGHT = 0.8, OVNI_SPEED = 0.3, OVNI_ROT_SPEED = 0.02;

var cameras = []

var moon, ovni, tree;
let houseAlentejo
var controls;
// var skydome, terrain;
var groundTexture, skyTexture;
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
const bluecyan = 0xB0E0E6;
const darkGreen = 0x013220;
const brownOrange = 0xcc5500;
const lightGreen = '#0b3d0b';


function generateFloralTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = lightGreen;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    const colors = ['white', 'yellow', 'violet', 'lightblue'];
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvasSize;
        const y = Math.random() * canvasSize;
        const r = 1.6 + Math.random() * 1.5; 
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

            const geometry = new THREE.PlaneGeometry(100, 100, width , height ); 


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
                    const elevation = pixelData[pixelIndex] / 225 * 3; // escalar a altura

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
            groundPlane.position.set(0, 25, 30);

            groundPlane.receiveShadow = true;
            scene.add(groundPlane);
            const houseX = -25;
            const houseZ = 50;
            const yGround = getGroundHeightAt(houseX, houseZ);
//            createAlentejoHouse(houseX, yGround, houseZ);

            createAlentejoHouse(-25, 30, 50);
//            randomPTrees(15);
            createTree(0, 30, 0);
        };

        // Caso a imagem já esteja carregada (às vezes o `onload` não dispara)
        if (img.complete && img.naturalWidth !== 0) {
            img.onload(); 
        }
    });
}

// not work well yet
function getGroundHeightAt(xTarget, zTarget) {
    if (!groundPlane || !groundPlane.geometry || !groundPlane.geometry.attributes.position) {
        console.warn('Ground plane not ready yet.');
        return 0;
    }

    const positionAttr = groundPlane.geometry.attributes.position;
    let closestIndex = 0;
    let minDist = Infinity;

    for (let i = 0; i < positionAttr.count; i++) {
        const x = positionAttr.getX(i);
        const z = positionAttr.getZ(i); // ← agora correto (é o que se torna Z no mundo)
        const dist = (x - xTarget) ** 2 + (z - zTarget) ** 2;

        if (dist < minDist) {
            minDist = dist;
            closestIndex = i;
        }
    }

    return positionAttr.getY(closestIndex); // ← Y da geometria = altura no mundo após rotação
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

    createMoon(20, 80, -30);
    scene.add(moon);

    globalDirectionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    globalDirectionalLight.position.set(30, 40, 20); // angle != than 0 with the xOy plane
    globalDirectionalLight.target.position.set(0, 0, 0);
    scene.add(globalDirectionalLight);
    scene.add(globalDirectionalLight.target);

    createOvni(50, 50, 50);
    
}
// #endregion

// #region CREATE CAMERA(S)
//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
     const aspect = window.innerWidth / window.innerHeight;
    const pers = new THREE.PerspectiveCamera(60, aspect, 0.1, 500);
    pers.position.set(20, 60, 80);  // X=80 (right), Y=60 (top), Z=80 (front-right)
    pers.lookAt(0, 0, 0);           // Look toward the center of the scene

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
    materials.set("wall", new THREE.MeshLambertMaterial({ color: white, side: THREE.DoubleSide }));
    materials.set("window", new THREE.MeshLambertMaterial({ color: bluecyan, side: THREE.DoubleSide }));
    materials.set("door", new THREE.MeshLambertMaterial({ color: brown, side: THREE.DoubleSide }));
    materials.set("frame", new THREE.MeshLambertMaterial({ color: yellow, side: THREE.DoubleSide }));
    materials.set("baseTrim", new THREE.MeshLambertMaterial({ color: yellow, side: THREE.DoubleSide }));
    materials.set("ceiling", new THREE.MeshLambertMaterial({ color: tileOrange, side: THREE.DoubleSide }));
    materials.set("treeTrunk", new THREE.MeshLambertMaterial({ color: brownOrange, side: THREE.DoubleSide }));
    materials.set("treeLeaves", new THREE.MeshLambertMaterial({ color: darkGreen, side: THREE.DoubleSide }));
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

// Creation of a sphere using BufferGeometry
function createSphereGeometry(radius, widthSegments, heightSegments) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const uvs = [];
    for (let y = 0; y <= heightSegments; y++) {
        const v = y / heightSegments;
        const theta = v * Math.PI;
        for (let x = 0; x <= widthSegments; x++) {
            const u = x / widthSegments;
            const phi = u * Math.PI * 2;
            const px = radius * Math.cos(phi) * Math.sin(theta);
            const py = radius * Math.cos(theta);
            const pz = radius * Math.sin(phi) * Math.sin(theta);
            vertices.push(px, py, pz);
            uvs.push(u, v);
        }
    }
    for (let y = 0; y < heightSegments; y++) {
        for (let x = 0; x < widthSegments; x++) {
            const a = y * (widthSegments + 1) + x;
            const b = a + widthSegments + 1;
            const c = b + 1;
            const d = a + 1;
            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}

//  Create spherical cap using BufferGeometry
function createSphericalCapGeometry(radius, widthSegments, heightSegments, phiLength) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const uvs = [];
    for (let y = 0; y <= heightSegments; y++) {
        const v = y / heightSegments;
        const theta = v * phiLength;
        for (let x = 0; x <= widthSegments; x++) {
            const u = x / widthSegments;
            const phi = u * Math.PI * 2;
            const px = radius * Math.cos(phi) * Math.sin(theta);
            const py = radius * Math.cos(theta);
            const pz = radius * Math.sin(phi) * Math.sin(theta);
            vertices.push(px, py, pz);
            uvs.push(u, v);
        }
    }
    for (let y = 0; y < heightSegments; y++) {
        for (let x = 0; x < widthSegments; x++) {
            const a = y * (widthSegments + 1) + x;
            const b = a + widthSegments + 1;
            const c = b + 1;
            const d = a + 1;
            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}

// Create a cylinder for the bottom part of the ovni using BufferGeometry
function createCylinderGeometry(radius, height, radialSegments) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    // Top circle
    for (let i = 0; i < radialSegments; i++) {
        const angle = (i / radialSegments) * Math.PI * 2;
        vertices.push(
            Math.cos(angle) * radius,
            height / 2,
            Math.sin(angle) * radius
        );
    }
    // Bottom circle
    for (let i = 0; i < radialSegments; i++) {
        const angle = (i / radialSegments) * Math.PI * 2;
        vertices.push(
            Math.cos(angle) * radius,
            -height / 2,
            Math.sin(angle) * radius
        );
    }
    // lateral faces
    for (let i = 0; i < radialSegments; i++) {
        const next = (i + 1) % radialSegments;
        indices.push(i, next, radialSegments + i);
        indices.push(next, radialSegments + next, radialSegments + i);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}


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

// cena mt rapida dps componho
function randomPTrees(n) {
    for (let i = 0; i < n; i++) {
        const x = (Math.random() - 0.5) * 400; // dentro do terreno (-200 a +200)
        const z = (Math.random() - 0.5) * 600; // dentro do terreno (-300 a +300)
        const y = getGroundHeightAt(x, z);

        const tree = new THREE.Group();
        createTree(0, 0, 0, tree); // árvore centrada na origem

        tree.position.set(x, y, z);
        tree.rotation.y = Math.random() * Math.PI * 2; // rotação aleatória
        const scale = 0.8 + Math.random() * 0.7;
        tree.scale.set(scale, scale, scale); // escala aleatória

        scene.add(tree);
    }
}

function createTree(x = 0, y = 0, z = 0, group = null) {
    const tree = group || new THREE.Group();
    const matTrunk = materials.get("treeTrunk");
    const matLeaves = materials.get("treeLeaves");

    // Tree trunk(slightly incline)
    const trunkGeometry = createCylinderGeometry(0.5, 6, 16);
    const trunk = new THREE.Mesh(trunkGeometry, matTrunk);
    trunk.rotation.z = THREE.MathUtils.degToRad(-10);
    trunk.position.set(0, 3, 0);
    tree.add(trunk);

    // Second branch(opost inclination)
    const branchGeometry = createCylinderGeometry(0.3, 4, 16);
    const branch = new THREE.Mesh(branchGeometry, matTrunk);
    branch.rotation.z = THREE.MathUtils.degToRad(30);
    branch.position.set(0.8, 5.5, 0);
    tree.add(branch);

    // Leaves with 1 to 3 elipsoids
    const numEllipsoids = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numEllipsoids; i++) {
        const leafGeo = createSphereGeometry(1.5, 16, 12);
        const leaf = new THREE.Mesh(leafGeo, matLeaves);
        leaf.scale.y = 1.2 + Math.random();
        leaf.position.set(
            (Math.random() - 0.5) * 2,
            7 + Math.random() * 2,
            (Math.random() - 0.5) * 2
        );
        tree.add(leaf);
    }

    if (!group) {
        tree.position.set(x, y, z);
        scene.add(tree);
    }
}

function createMoon(x, y, z) {
    'use strict';
    // Create an empty geometry
    const radius = 3;
    const widthSegments = 24;
    const heightSegments = 16;
    const geometry = createSphereGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshPhongMaterial({ color: moonYellow, emissive: moonYellow });
    const moonMesh = new THREE.Mesh(geometry, material);
    moonMesh.position.set(x, y, z); // Position it in the sky

    moon = moonMesh;
}

// Cria as luzes do OVNI (chamada dentro de createOvni)
function createOvniLights(group, nLuzes, rLuzes, yLuz) {
    ovniPointLights = [];
    for (let i = 0; i < nLuzes; i++) {
        const angle = (i / nLuzes) * Math.PI * 2;
        const lx = Math.cos(angle) * rLuzes;
        const lz = Math.sin(angle) * rLuzes;
        // Pequena esfera
        const sphereGeo = new THREE.BufferGeometry();
        const sphereVerts = [];
        for (let j = 0; j <= 8; j++) {
            const v = j / 8;
            const theta = v * Math.PI;
            for (let k = 0; k <= 8; k++) {
                const u = k / 8;
                const phi = u * Math.PI * 2;
                sphereVerts.push(
                    lx + 0.2 * Math.cos(phi) * Math.sin(theta),
                    yLuz + 0.2 * Math.cos(theta),
                    lz + 0.2 * Math.sin(phi) * Math.sin(theta)
                );
            }
        }
        // Faces da esfera pequena
        const sphereIndices = [];
        for (let j = 0; j < 8; j++) {
            for (let k = 0; k < 8; k++) {
                const a = j * 9 + k;
                const b = a + 9;
                const c = b + 1;
                const d = a + 1;
                sphereIndices.push(a, b, d);
                sphereIndices.push(b, c, d);
            }
        }
        sphereGeo.setAttribute('position', new THREE.Float32BufferAttribute(sphereVerts, 3));
        sphereGeo.setIndex(sphereIndices);
        sphereGeo.computeVertexNormals();
        const sphereMat = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0xff0000 });
        const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
        group.add(sphereMesh);

        // Luz pontual
        const pointLight = new THREE.PointLight(0xff0000, 1, 10);
        pointLight.position.set(lx, yLuz, lz);
        group.add(pointLight);
        ovniPointLights.push(pointLight);

    }

    // Cylinder for the OVNI bottom part
    const cylHeight = 0.2; // Height of the cylinder
    const cylGeo = createCylinderGeometry(0.5, cylHeight, 16);
    const cylMat = new THREE.MeshPhongMaterial({ color: 0xffff00, emissive: 0xffff00 });
    const cylMesh = new THREE.Mesh(cylGeo, cylMat);
    group.add(cylMesh);

    // Spotlight
    ovniSpotLight = new THREE.SpotLight(0xffffff, 2, 40, Math.PI / 6, 0.5, 1);
    ovniSpotLight.position.set(0, -OVNI_HEIGHT - cylHeight, 0);
    ovniSpotLight.target.position.set(0, -OVNI_HEIGHT - cylHeight - 5, 0);
    ovniGroup.add(ovniSpotLight);
    ovniGroup.add(ovniSpotLight.target);
    ovniSpotLight.castShadow = true;
}

// Cria o OVNI manualmente
function createOvni(x, y, z) {
    'use strict';
    ovniGroup = new THREE.Group();

    // "Main" body for the OVNI
    const corpoGeo = createSphereGeometry(OVNI_RADIUS, 32, 16);
    const corpoMat = new THREE.MeshPhongMaterial({ color: 0x888888, shininess: 100 });
    const corpoMesh = new THREE.Mesh(corpoGeo, corpoMat);
    corpoMesh.scale.y = OVNI_HEIGHT / OVNI_RADIUS; // Squash the sphere
    ovniGroup.add(corpoMesh);

    // Cockpit
    const cockpitGeo = createSphericalCapGeometry(OVNI_RADIUS * 0.6, 24, 12, Math.PI / 2);
    const cockpitMat = new THREE.MeshPhongMaterial({ color: 0x99ccff, transparent: true, opacity: 0.7 });
    const cockpitMesh = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpitMesh.position.y = OVNI_HEIGHT * 0.7;
    ovniGroup.add(cockpitMesh);

    
    createOvniLights(ovniGroup, 8, OVNI_RADIUS * 0.8, -OVNI_HEIGHT * 0.8);


    ovniGroup.position.set(x, y, z);
    scene.add(ovniGroup);
    ovni = ovniGroup;
    ovni.castShadow = true;
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

function addTriangleToGroup(group, p1, p2, p3, material) {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        ...p1, ...p2, ...p3
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

    const group = new THREE.Object3D();

    // Front wall frames
    const zFront = 4.5;
    const xCentersFront = [3, -3];

    for (const xC of xCentersFront) {
        const xLeft = xC - halfWidth;
        const xRight = xC + halfWidth;
        const yBottom = -halfHeight;
        const yTop = halfHeight;

        // Left side
        addQuadToGroup(group,
            [xLeft - thickness, yBottom, zFront],
            [xLeft, yBottom, zFront],
            [xLeft, yTop, zFront],
            [xLeft - thickness, yTop, zFront],
            mat
        );

        // Right side
        addQuadToGroup(group,
            [xRight, yBottom, zFront],
            [xRight + thickness, yBottom, zFront],
            [xRight + thickness, yTop, zFront],
            [xRight, yTop, zFront],
            mat
        );

        // Top
        addQuadToGroup(group,
            [xLeft - thickness, yTop, zFront],
            [xRight + thickness, yTop, zFront],
            [xRight + thickness, yTop + thickness, zFront],
            [xLeft - thickness, yTop + thickness, zFront],
            mat
        );

        // Bottom
        addQuadToGroup(group,
            [xLeft - thickness, yBottom - thickness, zFront],
            [xRight + thickness, yBottom - thickness, zFront],
            [xRight + thickness, yBottom, zFront],
            [xLeft - thickness, yBottom, zFront],
            mat
        );
    }

    // Left wall windows
    const xLeftWall = 5;
    const zCenters = [2.25, -2.25];

    for (const zC of zCenters) {
        const zLeft = zC - halfWidth;
        const zRight = zC + halfWidth;
        const yBottom = -halfHeight;
        const yTop = halfHeight;

        // Right side
        addQuadToGroup(group,
            [xLeftWall, yBottom, zRight],
            [xLeftWall, yBottom, zRight + thickness],
            [xLeftWall, yTop, zRight + thickness],
            [xLeftWall, yTop, zRight],
            mat
        );

        // Left side
        addQuadToGroup(group,
            [xLeftWall, yBottom, zLeft - thickness],
            [xLeftWall, yBottom, zLeft],
            [xLeftWall, yTop, zLeft],
            [xLeftWall, yTop, zLeft - thickness],
            mat
        );

        // Top
        addQuadToGroup(group,
            [xLeftWall, yTop, zLeft - thickness],
            [xLeftWall, yTop, zRight + thickness],
            [xLeftWall, yTop + thickness, zRight + thickness],
            [xLeftWall, yTop + thickness, zLeft - thickness],
            mat
        );

        // Bottom
        addQuadToGroup(group,
            [xLeftWall, yBottom - thickness, zLeft - thickness],
            [xLeftWall, yBottom - thickness, zRight + thickness],
            [xLeftWall, yBottom, zRight + thickness],
            [xLeftWall, yBottom, zLeft - thickness],
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

    const group = new THREE.Object3D();

    // Front wall windows
    const zFront = 4.5;
    const xCentersFront = [3, -3];

    for (const xC of xCentersFront) {
        addQuadToGroup(group,
            [xC - halfWidth, -halfHeight, zFront],
            [xC + halfWidth, -halfHeight, zFront],
            [xC + halfWidth, +halfHeight, zFront],
            [xC - halfWidth, +halfHeight, zFront],
            mat
        );
    }

    // Left wall windows
    const xSide = 5;
    const zCentersSide = [2.25, -2.25];

    for (const zC of zCentersSide) {
        addQuadToGroup(group,
            [xSide, -halfHeight, zC - halfWidth],
            [xSide, -halfHeight, zC + halfWidth],
            [xSide, +halfHeight, zC + halfWidth],
            [xSide, +halfHeight, zC - halfWidth],
            mat
        );
    }

    houseAlentejo.add(group);
    createFrameWindows(x, y, z);
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

    const yBottom = -1.5;
    const yTop = yBottom + 0.5;

    const doorHalfWidth = 0.5;
    const frameThickness = 0.25;

    // Front wall trim
    // Base trim of the left side of the front wall
    addQuadToGroup(group,
        [-halfWidth, yBottom, 4.5],
        [-doorHalfWidth, yBottom, 4.5],
        [-doorHalfWidth, yTop, 4.5],
        [-halfWidth, yTop, 4.5],
        mat
    );

    // Base trim of the right side of the front wall
    addQuadToGroup(group,
        [doorHalfWidth, yBottom, 4.5],
        [halfWidth, yBottom, 4.5],
        [halfWidth, yTop, 4.5],
        [doorHalfWidth, yTop, 4.5],
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
    const matRoof = materials.get("ceiling");
    const matWall = materials.get("wall")
    const group = new THREE.Object3D();

    const xLeft = 5;
    const xRight = -5;
    const yBase = 1.5;
    const yTop = 3;
    const zFront = 4.5;
    const zBack = -4.5;
    const zMid = 0;

    // Right Side
    addTriangleToGroup(group,
        [xRight, yBase, zBack],
        [xRight, yBase, zFront],
        [xRight, yTop,  zMid],
        matWall
    );

    // Left Side
    addTriangleToGroup(group,
        [xLeft, yBase, zFront],
        [xLeft, yBase, zBack],
        [xLeft, yTop,  zMid],
        matWall
    );

    // Front Side
    addQuadToGroup(group,
        [xRight, yBase, zFront],
        [xLeft, yBase, zFront],
        [xLeft, yTop,  zMid],
        [xRight, yTop,  zMid],
        matRoof
    );

    // Back Side
    addQuadToGroup(group,
        [xLeft, yBase, zBack],
        [xRight, yBase, zBack],
        [xRight, yTop,  zMid],
        [xLeft, yTop,  zMid],
        matRoof
    );

    group.position.set(0, 0, 0);
    houseAlentejo.add(group);
}

function createAlentejoHouse(x, y, z) {
    'use strict';

    houseAlentejo = new THREE.Object3D();

    createDoor(x, y, z);
    createWindows(x, y, z);
    createBaseTrim(x, y, z);
    createFrameHouse(x, y, z);
    createWalls(x, y, z);
    createCeiling(x, y, z);
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
function update() {
    if (ovni) {
        // constate rotation speed and movement speed
        ovni.rotation.y += OVNI_ROT_SPEED;

        // horizontal movement
        let dx = 0, dz = 0;
        if (ovniMoving.left) dx -= OVNI_SPEED;
        if (ovniMoving.right) dx += OVNI_SPEED;
        if (ovniMoving.up) dz -= OVNI_SPEED;
        if (ovniMoving.down) dz += OVNI_SPEED;
        ovni.position.x += dx;
        ovni.position.z += dz;
    }
    if (controls) controls.update();

}
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

    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(renderer));

    renderer.setAnimationLoop(function () {
     renderer.render(scene, activeCamera);
    });

    // OrbitControls
    controls = new OrbitControls(activeCamera, renderer.domElement);

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
    renderer.shadowMap.enabled = true;
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
    switch (e.key) {
        case '1':
            generateGroundTexture = true;
            const newTexture = generateFloralTexture();
            newTexture.wrapS = THREE.RepeatWrapping;
            newTexture.wrapT = THREE.RepeatWrapping;
            newTexture.repeat.set(25, 30);
            groundPlane.material.map = newTexture;
            groundPlane.material.needsUpdate = true;
            break;

        case '2': 
            generateSkyTexture = true;
            skyDome.material.map = generateStarryTexture();
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(25, 50); 
            
            skyDome.material.needsUpdate = true;
            break;

        case 'p':
        case 'P':
            ovniPointLightsOn = !ovniPointLightsOn;
            ovniPointLights.forEach(l => l.visible = ovniPointLightsOn);
            break;
        case 's':
        case 'S':
            ovniSpotLightOn = !ovniSpotLightOn;
            if (ovniSpotLight) ovniSpotLight.visible = ovniSpotLightOn;
            break;
        case 'ArrowLeft':
            ovniMoving.left = true; 
            break;
        case 'ArrowRight':
            ovniMoving.right = true; 
            break;
        case 'ArrowUp':
            ovniMoving.up = true; 
            break;
        case 'ArrowDown':
            ovniMoving.down = true; 
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
    switch (e.key) {
        case '1': 
            generateGroundTexture = false;
            break;
        case '2':
            generateSkyTexture = false;
            break;
        case 'ArrowLeft':
            ovniMoving.left = false; 
            break;
        case 'ArrowRight':
            ovniMoving.right = false; 
            break;
        case 'ArrowUp':
            ovniMoving.up = false; 
            break;
        case 'ArrowDown':
            ovniMoving.down = false; 
            break;
    }
}
// #endregion

init();
animate();