import * as THREE from '../lib/threejs/build/three.module.js';
import { OrbitControls } from '../lib/threejs/examples/jsm/controls/OrbitControls.js';
import { BuildingLoader} from "./BuildingLoader.js";
import { OSMLoader} from "./OSMLoader.js";
import { EffectComposer } from './lib/threejs/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './lib/threejs/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './lib/threejs/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GUI } from '../lib/threejs/examples/jsm/libs/lil-gui.module.min.js';




// Set scene
var scene = new THREE.Scene();
var aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

// RENDERER
var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


let composer;

const params = {
    exposure: 1,
    bloomStrength: 1.5,
    bloomThreshold: 0,
    bloomRadius: 0
};


// Microphone
var Mic = new Microphone(256);
var LPF = new LowPassFilter(0.1);

// Camera Control
var controls = new OrbitControls( camera, renderer.domElement );
controls.listenToKeyEvents( window ); // optional

// plane
const geometry = new THREE.PlaneGeometry( 500, 500, 1 , 1 );
//geometry.rotateX(Math.PI/2);
//geometry.rotateZ(Math.PI);
const material = new THREE.MeshLambertMaterial( {color: 0xffffff} );
const plane = new THREE.Mesh( geometry, material );
scene.add( plane );

// light
var dirLight = new THREE.DirectionalLight( 0xffffff );
dirLight.position.set( - 1, 0, 1 ).normalize();
scene.add( dirLight );


// Load building
var loader = new BuildingLoader();
var Buildings = new THREE.Group();
loader.load("./data/manhattan-1854.geojson", 10000).then(a => {
    Buildings = a;
    scene.add(a);
    var osm = new OSMLoader();
    osm.load(loader.m_lon, loader.m_lat, 4);
});


// add color neons postprocess
const renderScene = new RenderPass( scene, camera );
const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
				bloomPass.threshold = params.bloomThreshold;
				bloomPass.strength = params.bloomStrength;
				bloomPass.radius = params.bloomRadius;

				composer = new EffectComposer( renderer );
				composer.addPass( renderScene );
				composer.addPass( bloomPass );


const gui = new GUI();

gui.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {

    renderer.toneMappingExposure = Math.pow( value, 4.0 );

} );

gui.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {

    bloomPass.threshold = Number( value );

} );

gui.add( params, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {

    bloomPass.strength = Number( value );

} );

gui.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

    bloomPass.radius = Number( value );

} );


















camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 10;

var render = function () {
    requestAnimationFrame(render);
    let volume = LPF.filter(Mic.getRMS());

    renderer.render( scene, camera );
    
    
};

render();