

//Initialize Client Socket Connection
var socket = io();

//Initialize Instruments
var synth = new Tone.Synth().toMaster();
//var MelodyInst;
//var BassInst;
//var Percussion;


//Generate scale based on root note.
function genScale(root){


}

//Generate rhythms
function genRhythms(){

}

//Generate all the treble notes/rhythms to be played
function genTreb(){

}

//Generate chord progressions for each section
var chordProgressions;

var bpm = 120;
var modes = "maj min".split(" ");
var roots = "C Db D Eb E F F# G Ab A Bb".split(" ");




var scale = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];
var chordProg = ["Dm", "A7", "C7", "Fmaj", "D7", "Gmaj", "Cmaj"];

//Retrieve new data from the news API

socket.on('news', function(data){

	var abstracts = [];
	var sentiments = [];

	for (var key in data) {
	  if (data.hasOwnProperty(key)) {
	    abstracts.push(data[key][0]);
	    sentiments.push(data[key][1]);
	  }
	}

	console.log(abstracts);
	console.log(sentiments);

	//var ctr = abstracts.length - 1;
	var ctr = 2;
	var noteIndex;

	Tone.Transport.scheduleRepeat(function(time){
		if (ctr>=0){
			abstract = abstracts[ctr];

			Math.seedrandom(abstract);
			noteIndex = Math.floor(Math.random()*6);
			chord = chordProg[noteIndex];

    		var pattern = new Tone.Pattern(function(time,note){
				synth.triggerAttackRelease(note, "32n");
			}, chordNotes[chord], "upDown");

			pattern.start(time).stop("+4m");

			var msg = new SpeechSynthesisUtterance(abstract);

			var voices = window.speechSynthesis.getVoices();
				msg.voice = voices[17]; // Note: some voices don't support altering params

			window.speechSynthesis.speak(msg);

    		document.getElementById('test').innerHTML = abstract;

    		ctr -= 1;

    		if (ctr < 0){

    			Tone.Transport.schedule(
    				function(time){
    					socket.emit('newAbstractRequest');
    				}, "+4m");
    		}
    	}
	}, "4m", "+0m", "12m");	

});


var chordNotes = {
	"Dm" : ["D4", "F4", "C4", "A4"],
	"A7" : ["G4", "C#4", "A4", "E4"],
	"C7" : ["C4", "A#4", "E4", "F#4"],
	"Fmaj" : [ "F4", "C4","D4", "A4"],
	"D7" : ["C5", "F#4", "E5", "A#4"],
	"Gmaj" : ["A4","D5", "F#4",  "B4"],
	"Cmaj" : ["G4", "C5", "E5", "B4"],
};


Tone.Transport.start();
