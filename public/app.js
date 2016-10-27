/*


Initialize Globals


*/




//Initialize Client Socket Connection
var socket = io();

//Array of news headline/abstracts

var elements = [];

var abstracts = [];
var sentiments = [];
var sections = [];
var multimedia = [];

//Initialize Instruments
var synth = new Tone.Synth().toMaster();

var vol = new Tone.Volume(-12);
var polySynth = new Tone.PolySynth(4, Tone.Synth).toMaster();

polySynth.chain(vol, Tone.Master);

//var MelodyInst;
//var BassInst;
//var Percussion;

//Generate chord progressions for each section
var chordProgressions;

var bpm = 90;
var mode;
var roots = "C Db D Eb E F F# G Ab A Bb".split(" ");
var _root;

var rhythms = "2n 4n 8n".split(" ");
var rhythms_bass = "2n 3t".split(" ");
//Interval of repetition
var res = "8n";
var res_bass = "1m";

var iterLength = "4m";



/*



Functions




*/




//Generate scale based on root note and mode.
function genScale(_root, mode){

	var scale;

	var majorSteps = [0,2,4,5,7,9,11,12];
	var minorSteps = [0,2,3,5,7,8,10,12];

	var steps;

	if (mode == "maj"){
		steps = majorSteps;
	}
	else if (mode == "min"){
		steps = minorSteps;
	}
	else{
		steps = majorSteps;
	}

	_root = _root + "4";

	scale = Tone.Frequency(_root).harmonize(steps).eval();

	return scale;

}

//Creates a chord triad based on root note and mode.
function genChordTriad(scale){
	var triad;

	triad = [scale[0],scale[2],scale[4]];

	return triad;
}

//Generates a 7 chord based on root note and mode.
function genChord7(scale){

	var chord;

	chord = [scale[0],scale[2],scale[4], scale[6]];

	return chord;
}


/*

function playVisuals(){

}

*/

function genNote(scale){

	var noteData = {};

	var noteDuration = rhythms[Math.floor(Math.random()*(rhythms.length))];

	var note = scale[Math.floor(Math.random()*12)];


	noteData["note"] = note;
	noteData["duration"] = noteDuration;

	return noteData;
}


//Loops the iteration every res (16th note) for iterLength duration
function setTransport(_root, mode){







    Tone.Transport.scheduleRepeat(function(time) {
      playBass(_root, mode);
    }, res_bass, "+0m", iterLength);


    Tone.Transport.scheduleRepeat(function(time) {
      bpm = (document.body.scrollTop*0.03)+40; 	
      Tone.Transport.bpm.value = bpm;
      playTreble(_root, mode);
    }, res, "+0m", iterLength);

}

//Song Driver: Actually plays the notes
function playTreble(_root, mode){

	var scale = genScale(_root, mode);

	var noteData = genNote(scale);

	var vis = {};
	vis["note"] = noteData.note;
	vis["duration"] = noteData.duration;
	vis["root"] = _root;
	vis["mode"] = mode;
	vis["clef"] = "treble";
	vis["left"] = 0;

	elements.push(vis);

	synth.triggerAttackRelease(noteData.note, noteData.duration);

}

function playBass(_root, mode){

	var scale = genScale(_root, mode);

	var chord = genChord7(scale);

	var duration = rhythms_bass[Math.floor(Math.random()*rhythms_bass.length)];

	var vis = {};

	for (var i=0; i<chord.length; i++){

		vis = {};
		chord[i] = Tone.Frequency(chord[i]).transpose(-12).eval();
		vis["note"] = chord[i];
		vis["duration"] = duration;
		vis["root"] = _root;
		vis["mode"] = mode;
		vis["clef"] = "bass";
		vis["left"] = 0;

		elements.push(vis);

	}

	polySynth.triggerAttackRelease(chord, duration);

}





function genVoices(abstract){

	var msg = new SpeechSynthesisUtterance(abstract);

	var voices = window.speechSynthesis.getVoices();
	
	msg.voice = voices[17]; 

	window.speechSynthesis.speak(msg);

}

function getRoot(section){

	switch(section){
		case "World":
			return roots[0];
		case "U.S.":
			return roots[1];
		case "Politics":
			return roots[2];
		case "Food":
			return roots[3];
		case "Business":
			return roots[4];
		case "Opinion":
			return roots[5];
		case "Tech":
			return roots[6];
		case "Science":
			return roots[7];
		case "Health":
			return roots[8];
		case "Sports":
			return roots[9];
		case "Arts":
			return roots[10];
		case "Style":
			return roots[11];
		default:
			return roots[0];
	}
}


function draw(elements){

  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {


	var ctx = canvas.getContext('2d');
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;

  	var i = 0;
  	var x;
  	var y;
  	var width;
  	var height = (window.innerHeight)/60;
  	var color;
  	var speed = 5;
  	
  	while (i < elements.length){

  		if (elements[i].clef == "treble"){
  			y = ((window.innerHeight / 2) / (elements[i].note/12 + 1))*15 ;
  			color = 'red';
  		}
  		else{
  			y = ((window.innerHeight / 2) / (elements[i].note/12 + 1))*15 + (window.innerHeight / 3);
  			//console.log(y);
  			color = 'green';
  		}

  		x = elements[i].left;

  		width = parseInt(10 / (elements[i].duration[0] * 0.1), 10);

  		ctx.fillStyle = color;

  		//console.log(elements);
  		//console.log(x); console.log(y); console.log(width); console.log(height);
  		//console.log(y);

	    ctx.fillRect(x, y, width, height);



	    if (elements[i].left < window.innerWidth){
	    	elements[i].left += speed;
	    }
	    else{
			if (i > -1) {
			    elements.splice(i, 1);
			    i -= 1;
			}
	    }

	    i++;

	}

  }

}


/*




EXECUTE



*/



//Retrieve new data from the news API
socket.on('news', function(data){

	//console.log(data);

	for (var i = 0; i<data.length; i++) {
	    abstracts.push(data[i].abstract);
	    sentiments.push(data[i].sent);
	    sections.push(data[i].section);
	    multimedia.push(data[i].media);
	 }

	//console.log(multimedia);

	var duration = Tone.TimeBase(iterLength).mult(String(abstracts.length));
	duration = Tone.Time(duration).toNotation();

	//Iterates over each abstract for 4 measures each
	Tone.Transport.scheduleRepeat(function(time){
		if (abstracts.length>1){

			var abstract = abstracts.pop();
			var sentiment = sentiments.pop();
			var section = sections.pop();
			var media = multimedia.pop();

			Math.seedrandom(abstract);

			if (sentiment < 0){
				mode = "min";
			}
			else{
				mode = "maj";
			}

			_root = getRoot(section);


			setTransport(_root, mode);

			genVoices(abstract);

    		document.getElementById('test').innerHTML = abstract;
    		if (media != ""){
    			document.getElementById('imageBarLeft').style.background = 'url(' + media[2].url + ')';
    			document.getElementById('imageBarRight').style.background = 'url(' + media[2].url + ')';
				document.getElementById('imageBarCenter').style.background = 'url(' + media[2].url + ')';
    		}
    	}
    	else{
    		socket.emit('newAbstractRequest');
    	}
	}, iterLength, "+0m", duration);	

});


var playing = false;

function start(){
	console.log('start');

	if (playing == false){
		Tone.Transport.start();
		playing = true;
	}
	else{
		Tone.Transport.stop();
		// elements = [];
		// abstracts = [];
		// sentiments = [];
		// sections = [];
		// multimedia = [];
		playing = false;
	}
}

var el = document.getElementById("play");
el.addEventListener("click", function(){start()});


setInterval(function(){draw(elements)}, 10);
