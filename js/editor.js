//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

var optionsSave	= function(){
	console.log("Saving options to url...")
	var textValue	= editor.getValue();
	var options	= {
		textValue	: textValue,
		camera		: {
			position	: {
				x	: camera.position.x,
				y	: camera.position.y,
				z	: camera.position.z
			},
			rotation	: {
				x	: camera.rotation.x,
				y	: camera.rotation.y,
				z	: camera.rotation.z
			}
		}
	};
	location.hash	= '#j/'+JSON.stringify(options);	
}
var optionsLoad	= function(){
	if( !location.hash )	return;
	console.log("Loading options from url...")
	if( location.hash.substring(0,3) === "#j/" ){
		var optionsJSON	= location.hash.substring(3);
		var options	= JSON.parse(optionsJSON);
	}else{
		console.assert(false);
	}

	if( options.textValue ){
		editor.setValue( options.textValue );
	}
	if( options.camera ){
		camera.position.x	= options.camera.position.x;
		camera.position.y	= options.camera.position.y;
		camera.position.z	= options.camera.position.z;
		// TODO camera.rotation doesnt work... i have to store controls position.
		camera.rotation.x	= options.camera.rotation.x;
		camera.rotation.y	= options.camera.rotation.y;
		camera.rotation.z	= options.camera.rotation.z; 
	}
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

// default effect
var value = ""+
"threexSparks	= new THREEx.Sparks({\n"+
"	maxParticles	: 400,\n"+
"	counter		: new SPARKS.SteadyCounter(300)\n"+
"});\n"+
"\n"+
"// setup the emitter\n"+
"var emitter	= threexSparks.emitter();\n"+
"\n"+
"var initColorSize	= function(){\n"+
"	this.initialize = function( emitter, particle ){\n"+
"		particle.target.color().setHSV(0.3, 0.9, 0.4);\n"+
"		particle.target.size(150);\n"+
"	};\n"+
"};\n"+
"\n"+
"\n"+
"emitter.addInitializer(new initColorSize());\n"+
"emitter.addInitializer(new SPARKS.Position( new SPARKS.PointZone( new THREE.Vector3(0,0,0) ) ) );\n"+
"emitter.addInitializer(new SPARKS.Lifetime(0,0.8));\n"+
"emitter.addInitializer(new SPARKS.Velocity(new SPARKS.PointZone(new THREE.Vector3(0,250,00))));\n"+
"\n"+
"emitter.addAction(new SPARKS.Age());\n"+
"emitter.addAction(new SPARKS.Move());\n"+
"emitter.addAction(new SPARKS.RandomDrift(1000,0,1000));\n"+
"emitter.addAction(new SPARKS.Accelerate(0,-200,0));\n"+
"\n";

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

var updateText= function(){
	if( threexSparks ){
		scene.remove(threexSparks.container());
		threexSparks.destroy();
		threexSparks	= null;
	}
	
	var textValue	= editor.getValue();
	eval(textValue);

	// restart it 
	threexSparks.emitter().start();	
	scene.add(threexSparks.container());
	
	optionsSave();
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

var editor	= CodeMirror(document.getElementById('editor'), {
	value		: value,
	mode		: "javascript",
	theme		: 'night',

	indentUnit	: 8,
	tabSize		: 8,
	indentWithTabs	: true,
	
	onChange	: updateText
});


optionsLoad();
jQuery("#editor").hide();
updateText();

jQuery("#osdLayer .button.editor").click(function(){	
	jQuery("#editor").toggle();
});

jQuery("#osdLayer .button.export").click(function(){
	var isVisible	= jQuery('#osdLayer .shorturl').css('display') !== 'none';
	
	if( isVisible ){
		jQuery('#osdLayer .shorturl').hide();
		return;
	}

	jQuery('#osdLayer .shorturl').show();
	
	var long_url	= location.href;
	// from http://stackoverflow.com/questions/1771397/jquery-on-the-fly-url-shortener
	var login	= "jeromeetienne";
	var api_key	= "R_9176fb8fcaf3a6c0fe4459cb699f6c1d";
	jQuery.getJSON(	"http://api.bitly.com/v3/shorten?callback=?", { 
			"format": "json",
			"apiKey": api_key,
			"login": login,
			"longUrl": long_url
		},
		function(response){
			var value	= response.data.url;
			jQuery('#osdLayer .shorturl input').val(value);
			$("#osdLayer .shorturl input").select();
		}
	);
});

jQuery(document).bind('keypress', function(event){
	console.log("keypress", event.keyCode)
	// alt-h == 204
	if( event.keyCode !== 204 )	return;
	event.preventDefault();  
	jQuery("#editor").toggle();
});


//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

// monitor camera move and save it in url if needed
(function(){
	// cache old value
	var oldPosition	= camera.position.clone();
	// TODO camera.rotation doesnt work... i have to store controls position.
	var oldRotation	= camera.rotation.clone();
	setInterval(function(){
		// check values changed
		var changePos	= camera.position.clone().subSelf(oldPosition).length() > 0;
		var changeRot	= camera.rotation.clone().subSelf(oldRotation).length() > 0;
		if( !changePos && !changeRot )	return;
		// cache old value
		oldPosition	= camera.position.clone();
		oldRotation	= camera.rotation.clone();
		// save options
		optionsSave();
	}, 1000);	
})();


//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

// handle fullscreen
jQuery("#osdLayer .button.fullscreen").click(function(){
	if( THREEx.FullScreen.activated() ){
	    THREEx.FullScreen.cancel();
	}else{
	    THREEx.FullScreen.request();
	}	
});
if( !THREEx.FullScreen.available() )	jQuery("#osdLayer .button.fullscreen").hide();



//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

// handle screenshot
jQuery("#osdLayer .button.screenshot").click(function(){
	// From http://29a.ch/2011/9/11/uploading-from-html5-canvas-to-imgur-data-uri
	// able to upload your screenshot without running servers

	var canvas	= renderer.domElement;
	try {
		var url = canvas.toDataURL('image/jpeg', 0.7);
	} catch(e) {
		var url = canvas.toDataURL();
	}

	var winHtml	= jQuery('#osdLayer .screenshotWindow').html();
	var win		= window.open();
	win.document.write(winHtml);
	jQuery('img', win.document).attr('src', url);
	jQuery('body', win.document).css({
		"margin"	: "0",
		"padding"	: "0",
		"color"		: "#C0C0C0"
	});

	// upload to imgur using jquery/CORS
	// https://developer.mozilla.org/En/HTTP_access_control
	jQuery.ajax({
		url	: 'http://api.imgur.com/2/upload.json',
		type	: 'POST',
		data	: {
			type	: 'base64',
			// get your key here, quick and fast http://imgur.com/register/api_anon
			key	: 'a25f210e5e6f682fb052d63b19987a56',
			name	: 'marblesoccer-screenshot.jpg',
			title	: 'Particle edited by http://jeromeetienne.github.com/sparks.js/editor/',
			caption	: 'Screenshot of sparks.js effect',
			image	: url.split(',')[1]
		},
		dataType	: 'json'
	}).success(function(data) {
		console.log("result data", data)
		win.location.href = data['upload']['links']['imgur_page'];
	}).error(function() {
		alert('Could not reach api.imgur.com. Sorry :(');
		win.close();
	});
});


//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

// kludge to get editor height
// - this should be done via css but i failed to make it happen
var updateEditorHeight	= function(){
	var heightStr	= jQuery("body").css('height');
	var bodyHeight	= parseInt(heightStr.substring(0, heightStr.length-2));
	var scrollHeight= bodyHeight - 100;
	jQuery(".CodeMirror-scroll").css('height', scrollHeight+'px');
}
updateEditorHeight();
window.addEventListener('resize', updateEditorHeight, false);


