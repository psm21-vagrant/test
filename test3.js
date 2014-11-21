var route = require('./route.js');
var time = require('./time.js');

var from = 23513;
var to = 22036;
var exc = [23014,22960,22883,23448,23206];

var dot = [56.6765,45.464];
var dots = [
			{lat:56.6765, lng:45.464, radius: 0.07},
			{lat:56.76, lng:45.494, radius: 0.08}
			];

var source = [56.6429,47.926374];
var target = [56.62154,47.88707];

var targets = [[56.6429,47.926374],[56.62154,47.88707],[56.60154,47.87707],[56.60154,47.68707]];
var restricted = [
					{lat:56.6765, lng:45.464, radius: 0.07},
					{lat:56.76, lng:45.494, radius: 0.06},
					{lat:56.76, lng:47.494, radius: 0.06},
					//{lat:56.6429, lng:47.96, radius: 0.06},
					//{lat:56.6429, lng:47.88, radius: 0.06},
					//{lat:56.60, lng:47.926374, radius: 0.06},
					//{lat:56.66, lng:47.926374, radius: 0.06}
					
				];
		
console.log('start');
time.start();

/*
route.getRouteExc(from, to, exc, function(route){
	//console.log("length: " + route.length);
	//console.log(JSON.stringify(route));
	console.log('Executing time: '+time.stop());
	for ( var i = 0; i < route.length; i++ ){
		console.log(i+": "+route[i]+"\n");
	}
	
});


route.getNodeId(dot[0],dot[1],function(row){
	console.log(row);
	console.log('Executing time: '+time.stop());
});
*/

/*
route.getNodesInRadius(dot[0], dot[1], 0.07, function(result){
	console.log(result);
	console.log('Executing time: '+time.stop());
});


route.getNodesInRadiusDots(dots, function(result){
	console.log(result);
	console.log('Executing time: '+time.stop());
});
*/

/*
route.getRouteRestricted(source,target,restricted,function(res){
	console.log(res);
	console.log('Executing time: '+time.stop());
});


route.getSeveralNodeId(targets,function(ids){
	console.log(ids);
	console.log('Executing time: '+time.stop());
});

route.getSeveralRoutesRestricted(source,targets,restricted,function(res){
	console.log(res);
	console.log('Executing time: '+time.stop());
});
*/

query1 = "SELECT * FROM roads";
route.query(query1,function(results){
	console.log(results);
	console.log('Executing time: '+time.stop());
});



console.log('end');