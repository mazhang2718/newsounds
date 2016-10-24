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


io = io(server);

io.on('connection', function(socket){


request.get({
  url: "https://api.nytimes.com/svc/news/v3/content/all/all.json",
  qs: {
    'api-key': process.env.NYT_API
  },
}, function(err, response, body) {
  body = JSON.parse(body);
  socket.emit('news', body);
});

});



