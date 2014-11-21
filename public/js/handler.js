var start = null;
var end = null;
var startPoint = null;
var endPoint = null;
var route_line = L.polyline([],{color:'blue'}).addTo(map);
var roads = [];
var nodes = [];

map.on('click',function(e){
	if ( start == null ){
		start = [e.latlng.lat,e.latlng.lng];
		startPoint = L.circle(L.latLng(start[0],start[1]),5,{color:'red'}).addTo(map);
	}else if ( end == null ){
		end = [e.latlng.lat,e.latlng.lng];
		endPoint = L.circle(L.latLng(end[0],end[1]),5,{color:'blue'}).addTo(map);
		//alert('route request:'+JSON.stringify(start)+':'+JSON.stringify(end));
		Route.getRoute(start,end,function(route){
			console.log(JSON.stringify(route));
			route_line.setLatLngs(dots2latlngs(route));
		});
		
	}else{
		map.removeLayer(startPoint);
		map.removeLayer(endPoint);
		startPoint = null;
		endPoint = null;
		start = null;
		end = null;
		route_line.setLatLngs(dots2latlngs([]));
	} 
	

});


//преобразование массива точек в массив объектов latlng
function dots2latlngs(dots){
	if (dots == null) return [];
	latlngs = new Array();
	for ( var i = 0; i < dots.length; i++ ) latlngs.push(L.latLng(dots[i][0],dots[i][1]));
	return latlngs;
}//end func

function getAllRoads(){
	Ajax.sendRequest('GET','/allroads','a=1',function(r){
		//console.log(JSON.stringify(r));
		for ( var i = 0; i < r.length; i++ ){
			roads.push(L.polyline(dots2latlngs(r[i]),{color:'green'}).addTo(map));
		}
	});
}

function getAllNodes(){
	Ajax.sendRequest('GET','/allnodes','a=1',function(n){
		//console.log(JSON.stringify(n));
		for ( var i = 0; i < n.length; i++ ){
			nodes.push(L.circle(L.latLng(n[i][0],n[i][1]),5,{color:'yellow'}).addTo(map));
		}
	});
}

function clearAllRoads(){
	while( roads.length != 0 ){
		map.removeLayer(roads[0]);
		delete roads[0];
		roads.splice(0,1);
	}
}

function clearAllNodes(){
	while( nodes.length != 0 ){
		map.removeLayer(nodes[0]);
		delete nodes[0];
		nodes.splice(0,1);
	}
}