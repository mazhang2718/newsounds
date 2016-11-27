var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var request = require('request');
var io = require('socket.io');
var sentiment = require('sentiment');


app.use(express.static('public'));
app.set('port', port);

var server = app.listen(port, function() {
   console.log('Example app listening on port 3000!');	
});


app.get('/', function (req,res) {
   res.sendFile('index.html');
});

app.get('/one', function (req, res) {
  res.sendFile(__dirname + '/public/index2.html');
});


io = io(server);

io.on('connection', function(socket){


	function sendRequest(){

		request.get({
		  url: "https://api.nytimes.com/svc/news/v3/content/all/all.json",
		  qs: {
		    'api-key': "afe4dca13ffd4c3ab82a16a98713490b"
		  },
		}, function(err, response, body) {

		  body = JSON.parse(body);
		  var results = body.results;
		  var data = [];
		  var story = {};

		  for (var i=0; i<results.length; i++){
		  	story = {};
		  	story["abstract"] = results[i].abstract;
		  	story["sent"] = sentiment(results[i].abstract);
		  	story["section"] = results[i].section;
		  	story["media"] = results[i].multimedia;
		  	data.push(story);
		  }
		  
		  socket.emit('news', data);
		});

	}

	sendRequest();

	socket.on('newAbstractRequest', function(socket){
		console.log("hello hello hello");
		sendRequest();
	});


});



