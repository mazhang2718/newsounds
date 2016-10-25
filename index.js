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
		    'api-key': process.env.NYT_API
		  },
		}, function(err, response, body) {

		  body = JSON.parse(body);
		  var results = body.results;
		  var abstracts = {};
		  var abstract;
		  var sent;

		  for (var i=0; i<results.length; i++){
		  	abstract = results[i].abstract;
		  	sent = sentiment(abstract);
		  	abstracts[i] = [abstract, sent];
		  }
		  
		  socket.emit('news', abstracts);
		});

	}

	sendRequest();

	socket.on('newAbstractRequest', function(socket){
		console.log('hi');
		sendRequest();
	});


});



