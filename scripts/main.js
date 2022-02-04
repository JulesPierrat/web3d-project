var scene = new THREE.Scene();
var aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var Mic = new Microphone(256);
var LPF = new LowPassFilter(0.1);

// Cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

var render = function () {
    requestAnimationFrame(render);
    let volume = LPF.filter(Mic.getRMS());
    

    cube.position.y += volume/50;
    renderer.render( scene, camera );
    cube.position.y -= volume/50;


    
};

render();