import * as THREE from '../lib/threejs/build/three.module.js';
import { OrbitControls } from '../lib/threejs/examples/jsm/controls/OrbitControls.js';
import { BuildingLoader } from "./BuildingLoader.js";
import { EffectComposer } from '../lib/threejs/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../lib/threejs/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../lib/threejs/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OSMLoader } from "./OSMLoader.js";
import { GLTFLoader } from '../lib/threejs/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from '../lib/threejs/examples/jsm/libs/lil-gui.module.min.js';

const params = {
    exposure: 1,
    bloomStrength: 10,
    bloomThreshold: 0,
    bloomRadius: 0.5
};

var clock = new THREE.Clock();


// Set scene
var scene = new THREE.Scene();
var aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

// RENDERER
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ReinhardToneMapping;
document.body.appendChild(renderer.domElement);

// RENDERSCENE
const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

var composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);


// Microphone
var Mic = new Microphone(256);
var LPF = new LowPassFilter(0.1);

// Camera Control
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 1;
controls.maxDistance = 2000;

// plane
const geometry = new THREE.PlaneGeometry(500, 500, 1, 1);
//geometry.rotateX(Math.PI/2);
//geometry.rotateZ(Math.PI);
const material = new THREE.MeshLambertMaterial({ color: 0x000000 });
const plane = new THREE.Mesh(geometry, material);
plane.rotateX(-Math.PI/2);
scene.add(plane);

// light
scene.add(new THREE.AmbientLight(0x404040));

const pointLight = new THREE.PointLight(0xffffff, 1);
camera.add(pointLight);

renderer.toneMappingExposure = 5;


// Load building
var loader = new BuildingLoader();
var Buildings = new THREE.Group();
loader.load("./data/manhattan-1854.geojson", 1000).then(a => {
    Buildings = a;
    Buildings.rotateX(-Math.PI/2)
    scene.add(a);
    //var osm = new OSMLoader();
    //osm.load(loader.m_lon, loader.m_lat, 4);
});

camera.position.x = 29.86403055164309;
camera.position.y = 27.58004972135364;
camera.position.z = 10.071168515395144;

camera.setRotationFromEuler(new THREE.Euler(-0.8517765080776939,0.32457263395696995,0.34937632170380034));

var render = function () {
    requestAnimationFrame(render);
    //let volume = LPF.filter(Mic.getRMS());
    let volume = Mic.spectrum;

    Buildings.children.forEach(b => {
        b.position.z = b.basic_position + LPF.filter(volume[b.id_area] / 20);
    });
    composer.render();
    //renderer.render(scene, camera);
};


function onWindowResize() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);

}



window.addEventListener('resize', onWindowResize);
render();