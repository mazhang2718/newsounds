

	var socket = io();

	var synth = new Tone.Synth().toMaster();

	var scale = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];
	var chordProg = ["Dm", "A7", "C7", "Fmaj", "D7", "Gmaj", "Cmaj"];

	socket.on('news', function(data){

		console.log(data);
		var abstracts = [];
		data = data.results;
		for (var i = 0; i<data.length; i++){
			abstracts.push(data[i].abstract);
		}	

		var ctr = abstracts.length - 1;
		//var ctr = 7;
		var noteIndex;

		Tone.Transport.scheduleRepeat(function(time){
			if (ctr>=0){
				abstract = abstracts[ctr];

				Math.seedrandom(abstract);
				noteIndex = Math.floor(Math.random(abstract)*6);
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
			}
		}, "4:00:00");	

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
