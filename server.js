var express = require('express'),
	stylus = require('stylus'),
	logger = require('morgan'),
	bodyparser = require('body-parser'),
	mongoose = require('mongoose');


var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';  //what process environment node is running in

var app = express();

function compile(str, path) {
	return stylus(str).set('filename', path);
}

// express configuration
app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyparser());
app.use(stylus.middleware(
	{
		src: __dirname + '/public',
		compile: compile
	}
));
app.use(express.static(__dirname + '/public')); //static route handling setup - serve any files in /public


if(env === 'development') {
	mongoose.connect('mongodb://localhost/scrapbox');
}
else {
	mongoose.connect('mongodb://spectrometer:scrapbox@ds043971.mongolab.com:43971/scrapbox');
}
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error...'));
db.once('open', function callback() {
	console.log('access to scrapbox db established');
});

var messageSchema = mongoose.Schema({message: String});
var Message = mongoose.model('Message', messageSchema);
var mongoMessage;
Message.findOne().exec(function(err, messageDoc) {
	mongoMessage = messageDoc.message;
	console.log(mongoMessage);
});


//routes
app.get('/partials/:partialPath', function(req, res) {
	res.render('partials/' + req.params.partialPath);
});

app.get('*', function(req, res) {
	res.render('index');
});

//server
var port = process.env.PORT || 3030;
var server = app.listen(port, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('scrapbox currently listening at http://%s:%s', host, port);

});