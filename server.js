var express = require('express');
var app = express();
var server = require('http').Server(app);
var port = 8000;
var spatialite = require('./spatialite');
var Helper = require('./helper');
var time = require('./time');
spatialite.init(function(){
	console.log('spatialite ready...');});
	server.listen(port,function(){
		console.log('Server start at port '+port+ ' ' + Helper.getTime());
});


app.use(express.static(__dirname+'/public'));

/*�������� �������*/
app.get('/',function(req,res){
    console.log('/ was called');
	res.sendFile(__dirname+'/index.html');
});


/*������� ��� GET ������� �������� �� ������ spatialite*/
app.get('/route',function(req,res){
	var data = JSON.parse(req.query.data);
	var source = data[0];
	var target = data[1];
	time.start();
	//spatialite.routeDijkstra3(source, target, function(route){
	spatialite.routeQuery(source, target, function(route){
		console.log('Executing time: '+time.stop());
		res.writeHead(200, {"Content-Type": "text/html","Access-Control-Allow-Origin": "*"});
		res.write(JSON.stringify(route));
		res.end();
	});
     
});

/*������� ��� GET ������� ���� ����� �� ������ spatialite*/
app.get('/allroads',function(req,res){
	spatialite.getAllRoads(function(roads){
		res.writeHead(200, {"Content-Type": "text/html","Access-Control-Allow-Origin": "*"});
		res.write(JSON.stringify(roads));
		res.end();
	});
	
	
     
})

/*������� ��� GET ������� ���� ����� �� spatialite*/
app.get('/allnodes',function(req,res){
	spatialite.getAllNodes(function(nodes){
		res.writeHead(200, {"Content-Type": "text/html","Access-Control-Allow-Origin": "*"});
		res.write(JSON.stringify(nodes));
		res.end();
	});
     
})



