
var clock = new THREE.Clock();
var container, stats;
var camera, scene, renderer, mesh;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();
animate();
function init(){
	if( true ){
		renderer = new THREE.WebGLRenderer({
			antialias		: true,
			preserveDrawingBuffer	: true
		});
		renderer.setClearColor( 0x000000, 1 );
	}else{
		renderer	= renderer = new THREE.CanvasRenderer();
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

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );

	var geometry	= new THREE.CylinderGeometry( 5, 5, 20, 32 );
	//var geometry	= new THREE.CubeGeometry( 10, 10, 10 );
	var mesh	= new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
	mesh.position.y	= -10;
	scene.add( mesh );



	threexSparks	= new THREEx.Sparks({
		maxParticles	: 400,
		counter		: new SPARKS.SteadyCounter(300)
	});
	
	// setup the emitter
	var emitter	= threexSparks.emitter();
	
	var initColorSize	= function(){
		this.initialize = function( emitter, particle ){
			particle.target.color().setHSV(0.3, 0.9, 0.4);
			particle.target.size(150);
		};
	};
	
	
	emitter.addInitializer(new initColorSize());
	emitter.addInitializer(new SPARKS.Lifetime(0,0.8));
	emitter.addInitializer(new SPARKS.Position( new SPARKS.PointZone( new THREE.Vector3(0,0,0) ) ) );
	emitter.addInitializer(new SPARKS.Velocity(new SPARKS.PointZone(new THREE.Vector3(0,250,00))));
	
	emitter.addAction(new SPARKS.Age());
	emitter.addAction(new SPARKS.Move()); 
	emitter.addAction(new SPARKS.RandomDrift(1000,0,1000));
	emitter.addAction(new SPARKS.Accelerate(0,-200,0));


	emitter.start();

	scene.add(threexSparks.container());
}
function onDocumentMouseMove(event) {

	mouseX = event.clientX - windowHalfX;
	mouseY = event.clientY - windowHalfY;

}
function onDocumentTouchMove( event ) {
	if ( event.touches.length == 1 ) {
		event.preventDefault();
		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		mouseY = event.touches[ 0 ].pageY - windowHalfY;
	}
}

function animate() {

	requestAnimationFrame( animate );

	render();
	//stats.update();

}

function render() {

	controls.update( clock.getDelta() );
	
	threexSparks.update();

	// FIXME this should be INSIDE webgl renderer... bug
	renderer.context.depthMask( true );

	renderer.render( scene, camera );
}
