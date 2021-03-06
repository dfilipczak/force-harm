var sevenths = [];
var scene;
var camera;
var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var cursor;
var boldLine;
var cylinder;
var mouseX;
var mouseY;
var synth;
var arp;
var arp2;
var ac;
var duoSynth
var mel = 0;

window.addEventListener('keypress', function(e) {
	Tone.Master._context._context.resume()
	// createTone()
	var key = String.fromCharCode(e.keyCode || e.which).toLowerCase();
	if (key == 'w' || key == 'a' || key == 's' || key == 'd' || key == 'z') {
		triggerNavigate(key);
	}
	setArp(currentChord.chroma)
	vm.intro=false;
	// console.log(key)
});

function onMouseMove(event) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouseX = event.clientX;
	mouseY = event.clientY;
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;


}



window.addEventListener('mousemove', onMouseMove, false);


function onMousePress(event) {

	if (overChord) {
		var shortestPath = BFS(currentChord, overChord);
		console.log(shortestPath)
		console.log(shortestPath.length)
		if (shortestPath.length > 1) {
			path = shortestPath;
		} else {
			console.log('path too short')
		}


	}



}

window.addEventListener('click', onMousePress, false);

window.onload = function() {
	Tone.Master._context._context.suspend()

	noise.seed(Math.random());
	scene = new THREE.Scene();
	//scene.add(group);
	// scene.background = new THREE.Color('olive');
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight), 0.1, 2500);
	camera.position.z = 30;
	// camera.position.y = 20;

	// camera.far=10



	renderer = new THREE.WebGLRenderer({
		alpha: true
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	renderer.domElement.style = "position:fixed; top:0px; left:0px"

	orbit = new THREE.OrbitControls(camera, renderer.domElement)

	ambient = new THREE.HemisphereLight(0x404040); // soft white light
	ambient.position.y = -10
	ambient.position.z = 5
	scene.add(ambient);



	var geometry = new THREE.SphereGeometry(1.1, 32, 32);
	// this.material = new THREE.MeshPhongMaterial( {color: 'yellow'} );


	// var shader = THREE.FresnelShader;
	// var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
	// uniforms["tCube"].value = textureCube;
	// this.material = new THREE.ShaderMaterial({
	// 	uniforms: uniforms,
	// 	vertexShader: shader.vertexShader,
	// 	fragmentShader: shader.fragmentShader
	// });
	var material = new THREE.MeshPhongMaterial({
		color: 'black'
	});
	// material.transparent=true;
	// material.opacity=0.5

	cursor = new THREE.Mesh(geometry, material);
	scene.add(cursor);



	var cylinderGeometry = new THREE.BoxGeometry(0.5, 0.5, 6, 8, 1);
	cylinder = new THREE.Mesh(cylinderGeometry,
		new THREE.MeshPhongMaterial({
			color: 'white'
		}));
	// cylinder.material.transparent=true;
	// cylinder.material.opacity=0.9
	// scene.add(cylinder)

	// var materialArray = [];
	// for (var i = 0; i < 6; i++)
	// 	materialArray.push(new THREE.MeshBasicMaterial({
	// 		map: loader.load(imagePrefix + directions[i] + imageSuffix),
	// 		side: THREE.BackSide
	// 	}));
	// var skyMaterial = new THREE.MultiMaterial(materialArray);
	// // var skyMaterial = new THREE.MeshPhongMaterial( {color:'black'} );
	// // skyMaterial.side = THREE.BackSide;
	// skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
	// skyBox.position.setComponent(1, 1000)
	// skyBox.rotation.y=15
	// scene.add(skyBox)



	//



	loadVM();

	vm.reset()



	var geometry = new THREE.Geometry();
	geometry.vertices.push(currentChord.sphere.position.clone());
	geometry.vertices.push(lastChord.sphere.position.clone());
	boldLine = new THREE.Line(geometry, new THREE.LineBasicMaterial({
		color: 'black'
	}));
	scene.add(boldLine)
	setVMFromCurrentChord()
	render();



	createTone()

	// initVexflow()

	// vm.linkedTo = currentChord.linkedTo.slice()
	// Vue.set(vm, 'linkedTo', currentChord.linkedTo)
}


var duoParams = {
	vibratoAmount: 0.5,
	vibratoRate: 5,
	harmonicity: 2,
	voice0: {
		volume: -50,
		portamento: '4n',
		oscillator: {
			type: 'sine'
		},
		filterEnvelope: {
			attack: 0.5,
			decay: 0,
			sustain: 1,
			release: 0.1
		},
		envelope: {
			attack: 0.01,
			decay: 0,
			sustain: 1,
			release: 0.5
		}
	},
	voice1: {
		volume: -20,
		portamento: '4n',
		oscillator: {
			type: 'sine'
		},
		filterEnvelope: {
			attack: 0.01,
			decay: 0,
			sustain: 1,
			release: 0.5
		},
		envelope: {
			attack: 0.5,
			decay: 0,
			sustain: 1,
			release: 0.1
		}
	}
}


function createTone() {
	ac = new AudioContext();
	synth = new Tone.Synth(ac);
	synth.toMaster();


	synth2 = new Tone.Synth(ac);
	synth2.toMaster();


	duoSynth = new Tone.DuoSynth(duoParams).toMaster();


	arp = new Tone.Pattern(function(time, note) {
		synth.triggerAttackRelease(note, 0.25);
	}, ["C4", "E4", "G4", "A4"], "upDown");
	arp.start(0);


	arp2 = new Tone.Pattern(function(time, note) {
		synth2.triggerAttackRelease(note, 0.25);
	}, ["C4", "E4", "G4", "A4"], "upDown");
	arp2.start(0);

	Tone.Transport.start();
	arp.interval = 0.2
	arp2.interval = 0.2 * 2
}

function setArp(chroma_) {
	let chroma = chroma_;
	chroma.sort(function(a, b) {
		return a - b
	});
	let names = [
		'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'
	]
	arp.values = [];
	arp2.values = [];
	chroma.forEach(function(c) {
		arp.values.push(names[c])
		arp2.values.push(names[c])
	})

	let oldMel = mel;
	mel = findClosest(chroma, oldMel);
	if (oldMel != mel) {
		duoSynth.triggerRelease()
		duoSynth.triggerAttack(names[mel]);
	}

	console.log(names[mel])
}

function findClosest(array, int) {

	//find value in array that is closest to but not identical to int
	let closest = null;
	let shortestDist = Infinity;
	for (var i = 0; i < array.length; i++) {
		if (Math.abs(int - array[i]) < shortestDist && array[i] != int) {
			dist = Math.abs(int - array[i]);
			closest = array[i];
		}
	}

	if (shortestDist > 5 && array.includes(int) && Math.random() > 0.5) {
		closest = int;
	}
	// console.log(closest)
	return closest;
}


function setVMFromCurrentChord() {
	vm.current = translateChordName(currentChord.root, currentChord.type);

	// var indices = ['w', 'a', 's', 'd']
	// for(var i = 0; i<5;i++){
	// 	if(currentChord.linkedTo[i]){
	// 		vm[indices[i]] = translateChordName(currentChord.linkedTo[i].root, currentChord.linkedTo[i].type)
	// 	}
	// }
	// vm.w = translateChordName(currentChord.linkedTo[0].root, currentChord.linkedTo[0].type)
	// vm.a = translateChordName(currentChord.linkedTo[1].root, currentChord.linkedTo[1].type)
	// vm.s = translateChordName(currentChord.linkedTo[2].root, currentChord.linkedTo[2].type)
	// vm.d = translateChordName(currentChord.linkedTo[3].root, currentChord.linkedTo[3].type)
	if (currentChord.linkedTo[0]) {
		vm.w = translateChordName(currentChord.linkedTo[0].root, currentChord.linkedTo[0].type)
	} else {
		vm.w = null;
	}
	if (currentChord.linkedTo[1]) {
		vm.a = translateChordName(currentChord.linkedTo[1].root, currentChord.linkedTo[1].type)
	} else {
		vm.a = null;
	}
	if (currentChord.linkedTo[2]) {
		vm.s = translateChordName(currentChord.linkedTo[2].root, currentChord.linkedTo[2].type)
	} else {
		vm.s = null;
	}
	if (currentChord.linkedTo[3]) {
		vm.d = translateChordName(currentChord.linkedTo[3].root, currentChord.linkedTo[3].type)
	} else {
		vm.d = null;
	}
	if (currentChord.linkedTo[4]) {
		vm.z = translateChordName(currentChord.linkedTo[4].root, currentChord.linkedTo[4].type)
	} else {
		vm.z = null;
	}

}