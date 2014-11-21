var spatialite = require('./spatialite.js');
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
//time.start();
/*
query1 = "SELECT * FROM roads";
spatialite.query(query1,function(results){
	console.log(results);
	console.log('Executing time: '+time.stop());
});


spatialite.loadRoads(function(){
	console.log(JSON.stringify(spatialite.roads));
	console.log('Executing time: '+time.stop());
});
*/


/*
spatialite.loadNodes(function(){
	console.log(JSON.stringify(spatialite.nodes[0]));
	console.log('Executing time: '+time.stop());
});


spatialite.init(function(){
	time.start();
	console.log(spatialite.latlng2node_id(dot));
	console.log('Executing time: '+time.stop());
});
*/
/**/
spatialite.init(function(){
	time.start();
	spatialite.routeDijkstra(source,target,function(res){
		console.log('Executing time: '+time.stop());
		console.log(res.route.length+':'+JSON.stringify(res.route));
		
	});
});

/*
spatialite.init(function(){
	time.start();
	var cost = spatialite.getCost(from,to);
	console.log(cost);
	console.log('Executing time: '+time.stop());
});
*/
console.log('end');