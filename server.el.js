var express = require('express');
var app = express();
var server = require('http').Server(app);
var port = 8002;
var elevation= require('./elevation');
var Helper = require('./helper');
var time = require('./time');

server.listen(port, function(){
	console.log('Server start at port '+port+ ' ' + Helper.getTime());
});

app.use(express.static(__dirname+'/elevation/public'));

/*основной маршрут*/
app.get('/',function(req,res){
    console.log('/ was called');
	res.sendFile(__dirname+'/index.html');
});


/*маршрут для GET запроса высоты точки из базы el2.sqlite; формат запроса /elevation?data=[lat,lng]*/
app.get('/elevation',function(req,res){
	var data = JSON.parse(req.query.data);
	time.start();
	elevation.getElevation(data, function(result){
		console.log('Executing time: '+time.stop());
		res.writeHead(200, {"Content-Type": "text/html","Access-Control-Allow-Origin": "*"});
		res.write(JSON.stringify(result));
		res.end();
	}); 
});

/*маршрут для GET запроса высот массива точек из базы el2.sqlite; формат запроса /elevation?data=[[lat1,lng1],[lat2,lng2],...]*/
app.get('/elevations',function(req,res){
	var data = JSON.parse(req.query.data);
	time.start();
	elevation.getElevations(data, function(result){
		console.log('Executing time: '+time.stop());
		res.writeHead(200, {"Content-Type": "text/html","Access-Control-Allow-Origin": "*"});
		res.write(JSON.stringify(result));
		res.end();
	}); 
});
