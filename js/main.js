
var clock = new THREE.Clock();
var container, stats;
var camera, scene, renderer, mesh;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var threexSparks;

if( !init() ){
	animate();
}

function init(){
	if( Detector.webgl ){
		renderer = new THREE.WebGLRenderer({
			antialias		: true,
			preserveDrawingBuffer	: true
		});
		renderer.setClearColor( 0x000000, 1 );
	}else{
		Detector.addGetWebGLMessage();
		return true;
	}
	renderer.setSize( window.innerWidth, window.innerHeight );

	document.getElementById('container').appendChild(renderer.domElement);
	
	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set(0, 0, 100); 
	camera.lookAt(scene.position);
	scene.add(camera);
	
	controls = new THREE.TrackballControls( camera, renderer.domElement );
	controls.rotateSpeed		= 0.1;
	controls.staticMoving		= false;
	controls.dynamicDampingFactor	= 0.3;

	THREEx.WindowResize(renderer, camera);

	// add Stats.js - https://github.com/mrdoob/stats.js
	stats = new Stats();
	stats.domElement.style.position	= 'absolute';
	stats.domElement.style.bottom	= '0px';
	stats.domElement.style.right	= '0px';
	document.body.appendChild( stats.domElement );
			
	var geometry	= new THREE.CylinderGeometry( 5, 5, 20, 32 );
	//var geometry	= new THREE.CubeGeometry( 10, 10, 10 );
	var mesh	= new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
	mesh.position.y	= -10;
	scene.add( mesh );
}

function animate() {

	requestAnimationFrame( animate );

	render();

	stats.update();
}

function render() {

	controls.update( clock.getDelta() );
	
	threexSparks	&& threexSparks.update();

	// FIXME this should be INSIDE webgl renderer... bug
	renderer.context.depthMask( true );

	renderer.render( scene, camera );
}
