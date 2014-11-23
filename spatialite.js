var sqlite = require('spatialite');
var db = new sqlite.Database('RU-ME.sqlite');
var debug = require('./debug.js');

var roads = []; /**������ �����**/
var nodes = [];/**������ �����**/
var index_from = []; /**��������� ������� ��� ��������� ������**/
var index_size = []; 
var n = 0; /**���������� ������ �����**/
var m = 0; /**���������� ��� �����**/
var INF = 999999999; /**������� �����**/
var margin = 0.6; /**����������� ���������� ��� ����������� ����� ����� ��� �������**/

/**
* ���������� ������� � ��������� ����������� � ���� ������� ��������
* @param sql ������ �������
* @param callback ������� ��������� ������ � ������� ���������� ���������
* � ���� ������� ��������
**/
function query(sql, callback){
	db.spatialite(function(err) {
		db.all(sql, function(err, rows) {
			results = [];
			if ( rows != undefined ){
				if ( rows != null ){
					for ( var i = 0; i < rows.length; i++ ){
						results.push(rows[i]);
					}			
				}
			}
			callback(results);
		});
	});
}


/**
* ��������� ����� �� ���� � ���� ������� �������� � ������ � ������ roads + ���������� ��������� ��������
* @param callback ������� ��������� ������
* roads - ������ �������� ���� {node_from:node_from,node_to:node_to,name:name,cost:cost,length:length,lat_from:lat_from,lng_from:lng_from,lat_to:lat_to,lng_to:lng_to}
**/
function loadRoads(callback){
	var sql = "SELECT node_from, node_to, name, cost, length, Y(rn.geometry) "; 
		sql += "AS lat_from, X(rn.geometry) AS lng_from, Y(rn2.geometry) "; 
		sql += "AS lat_to, X(rn2.geometry) AS lng_to, AsGeoJSON(r.geometry) AS geometry ";  
		sql += "FROM roads r,roads_nodes rn, roads_nodes rn2 "; 
		sql += "WHERE r.node_from=rn.node_id AND r.node_to=rn2.node_id ORDER BY node_from,node_to";
	
	
	db.spatialite(function(err) {
		db.all(sql, function(err, rows) {
			if ( rows != undefined ){
				if ( rows != null ){
					//���������� � ������
					var geom = null;
					for ( var i = 0; i < rows.length; i++ ){
						roads.push(rows[i]);
						geom = JSON.parse(rows[i].geometry);
						geom.coordinates.reverse();
						roads.push({node_from:rows[i].node_to, node_to:rows[i].node_from,cost:rows[i].cost,length:rows[i].length,geometry:JSON.stringify(geom)});
					}
					m = roads.length;
					//���������
					roads.sort(function(x,y){ return x.node_from-y.node_from});
					
					var curr_from = 0;
					var prev_from = 0;
					for ( var i = 0; i < m; prev_from = curr_from,i++ ){
						curr_from = roads[i].node_from;
						if ( curr_from != prev_from ){ //���� from ����� ���������� ��� ��������� ������ � index_from
							if ( curr_from - 1 > index_from.length ){
								for ( var j = 0; j < (curr_from - 1 - index_from.length); j++ ){
									index_from.push(-1);
									index_size.push(0);
								}
							}
							index_from.push(i);
							index_size.push(1);
						}else{ //���� from ������ ����������� ��������� index_size
							index_size[index_size.length-1]++;
						}
					}			
				}
			}
			callback();
		});
	});
}

/**
* ��������� ����� ����� �� ���� � ���� ������� �������� � ������ � ������ nodes
* @param callback ������� ��������� ������
* nodes - ������ �������� ���� {node_id:node_id,cardinality:cardinality,lat:lat,lng:lng}
**/
function loadNodes(callback){
	var sql = "SELECT node_id, cardinality, Y(geometry) AS lat, X(geometry) AS lng FROM roads_nodes"; 
	db.spatialite(function(err) {
		db.all(sql, function(err, rows) {
			if ( rows != undefined ){
				if ( rows != null ){
					for ( var i = 0; i < rows.length; i++ ){
						nodes.push(rows[i]);
					}			
				}
			}
			n = nodes.length;
			callback();
		});
	});
}

/**
* ��������� ��������� ���� ����� �� ���� from � ���� to
**/
function getCost(from,to,banned){
	if (from == to ) return 0;
	for ( var i = 0; i < banned.length; i++ ){
		if ( from == banned[i] || to == banned[i] ) return INF;
	}
	if ( index_size[from-1] == 0 && index_size[to-1] == 0 ) return INF;
	for ( var i = index_from[from-1]; i < index_from[from-1] + index_size[from-1]; i++ ){
		if ( roads[i].node_from == from && roads[i].node_to == to ){
			return roads[i].cost;
		} 
	}
	return INF;
}

/**
* ��������� ��������� ( ��� ������� ����� ) ���� ����� �� ���� from � ���� to
**/
function getCoordinates(from,to){
	var geom = null;
	if (from == to ) return [];
	if ( index_size[from-1] == 0 && index_size[to-1] == 0 ) return [];
	for ( var i = index_from[from-1]; i < index_from[from-1] + index_size[from-1]; i++ ){
		if ( roads[i].node_from == from && roads[i].node_to == to ){
			geom = JSON.parse(roads[i].geometry);
			return geom.coordinates;
		} 
	}
	return [];
}

/**
* ��������� id ����� ����������� �������
**/
function getIncident(curr){
	var incident = [];
	if ( curr > n || curr < 1 ) return incident;
	for ( var i = index_from[curr-1]; i <  index_from[curr-1] + index_size[curr-1]; i++ ){
		incident.push(i);
	}
	return incident;
}

/**
* �������� ������ �� ����
* ������������� ��������� �������� ����������
* @param ������� ��������� ������
**/
function init(callback){
	console.log('load graph...');
	loadNodes(function(){
		loadRoads(function(){
			callback();
		})
	});
}

/**
* ����������� �������� �������� � ����
* @param from ��������� �����
* @param to �������� �����
* @param callback ������� ��������� ������ � ������� ���������� ��������� � ����
* ������� ����� [[lat1, lng1], [lat2,lng2],...]]
**/

function routeQuery(from, to, callback){
	var start = latlng2node_id(from);
    var end = latlng2node_id(to);
	console.log(start+':'+end);
	var sql = "SELECT AsGeoJSON(geometry) AS geometry FROM roads_net WHERE ";
	sql += "NodeFrom=" + start + " AND NodeTo=" + end; 
	sql += " LIMIT 1;"
    //console.log(sql);
	db.spatialite(function(err) {
		db.get(sql, function(err, row) {
            //console.log(JSON.stringify(row));
            route = [];
			if ( row != undefined ){
				if ( row.geometry != null ){
					var obj = JSON.parse(row.geometry);
					route = obj.coordinates;
				}
			}
			//console.log(JSON.stringify(reverse(route)));
            callback(reverse(route));
		});
	});
}

/**
* ����������� �������� �� ��������� ��������
* @param from ��������� �����
* @param to �������� �����
* @param callback ������� ��������� ������ � ������� ���������� ��������� � ����
* ������� ����� [[lat1, lng1], [lat2,lng2],...]]
**/

function routeDijkstra(from, to, callback){
	var visited = []; /**���������� ������� � ���������� ������**/
    var label = [];/**����� ������**/
    var prev = [];/**���������� �������**/
	var cost = 0;
	var min = 0;
    start = latlng2node_id(from);
    end = latlng2node_id(to);
	console.log(start+':'+end);
	curr = start;
	var tempLabel = 0;
    for ( var i = 0; i < n; i++ ){
	   visited.push(0);
	   label.push(INF);
	   prev.push(0);
	}
	label[curr-1] = 0;
	while ( visited[end-1] == 0 ){
		for ( var i = 0; i < n; i++ ){
			if ( visited[i] == 1 ) continue;
			cost = getCost(curr,i+1,[]);
			tempLabel = label[curr-1] + cost;
			if ( tempLabel > INF ) tempLabel = INF;
			if ( label[i] > tempLabel ){
				label[i] = tempLabel;
				prev[i] = curr;
			}	
		}
		visited[curr-1] = 1;
		min = INF;
		index = curr-1;
		for ( var i = 0; i < n; i++ ){
			if ( visited[i] == 1 ) continue;
			if ( min > label[i] ){
				min = label[i];
				index = i;
			}	
		}
		if ( min == INF ) break; 
		curr = index+1;
		//console.log(curr);
	}
	if ( label[end-1] == INF ){
		callback([]);
		return false;
	}
	//����� �����������
    var lengthPath = label[end-1];
	var path = [];
	path.push(end);
	curr = end;
	while( prev[curr-1] != start ){
		path.push(prev[curr-1]);
		curr = prev[curr-1];
	}
	path.push(start);
	path.reverse();
	callback(path2route(path));
}

/**
* ����������� �������� �� ��������� �������� ������� 2
* @param from ��������� �����
* @param to �������� �����
* @param callback ������� ��������� ������ � ������� ���������� ��������� � ����
* ������� ����� [[lat1, lng1], [lat2,lng2],...]]
**/
function routeDijkstra2(from, to, callback){
    var visited = []; /**���������� ������� � ���������� ������**/
    var label = [];/**����� ������**/
    var prev = [];/**���������� �������**/
    start = latlng2node_id(from);
    end = latlng2node_id(to);
	console.log(start+':'+end);
	curr = start;
	var tempLabel = 0;
    for ( var i = 0; i < n; i++ ){
	   visited.push(0);
	   label.push(INF);
	   prev.push(0);
	}
	label[curr-1] = 0;
	for ( var i  = 0; i < n; i++ ){
		min = INF;
        for ( j = 0; j < n; j++ ){
			if ( visited[j] == 1 ) continue;
			if ( label[j] < min ){
			     min = label[j];
                 curr = j+1;
			}
        }//end for
        visited[curr-1] = 1;
        if (label[curr-1] == INF || visited[end-1] == 1) break;
        
		for ( var j = 0; j < n; j++ ){
			if ( visited[j] == 1 ) continue;
            var cost = getCost(curr,j+1,[]);
			tempLabel = (cost + label[curr-1]);
			if (tempLabel > INF) tempLabel = INF;
			if ( label[j] > tempLabel){
				label[j] = tempLabel;
				prev[j] = curr;       
			}//end if 
		}//end for	
	}//end for
	if ( label[end-1] == INF ){
		callback([]);
		return false;
	}
	//����� �����������
	if ( label[end-1] >= INF ) callback([]);
    var lengthPath = label[end-1];
	var path = [];
	path.push(end);
	curr = end;
	while( prev[curr-1] != start ){
		path.push(prev[curr-1]);
		curr = prev[curr-1];
	}
	path.push(start);
	path.reverse();
	callback(path2route(path));
}

/**
* ����������� �������� �� ��������� �������� ������� 3, � ��������� �����
* @param from ��������� �����
* @param to �������� �����
* @param callback ������� ��������� ������ � ������� ���������� ��������� � ����
* ������� ����� [[lat1, lng1], [lat2,lng2],...]]
**/

function routeDijkstra3(from, to, callback){
	var visited = []; /**���������� ������� � ���������� ������**/
    var label = [];/**����� ������**/
    var prev = [];/**���������� �������**/
    var nodes_part = []; /**��������� ������ ����� ������������� ������**/
	var u = 0; /**����� ���������� ������� ����� ������������� ������**/

	//���������� �������
	
	var delta = Math.max(Math.abs(from[0] - to[0]),Math.abs(from[1] - to[1]))*margin;
	var lat_min = Math.min(from[0], to[0]) - delta;
	if ( lat_min < -90 ){ lat_min = -90;} else if ( lat_min > 90 ){lat_min = 90;}
	var lat_max = Math.max(from[0], to[0]) + delta;
	if ( lat_min < -90 ){ lat_min = -90;} else if ( lat_min > 90 ){lat_min = 90;}
	var lng_min = Math.min(from[1], to[1]) - delta;
	if ( lng_min < -180 ){ lng_min = 360 + lng_min;} else if ( lng_min > 180 ){ lng_min = lng_min - 360;}
	var lng_max = Math.max(from[1], to[1]) + delta;
	if ( lng_max < -180 ){ lng_max = 360 + lng_max;} else if ( lng_max > 180 ){ lng_max = lng_max - 360;}
	
	console.log('lat_min: '+lat_min+'\nlat_max: '+lat_max+'\nlng_min: '+lng_min+'\nlng_max: '+lng_max);
	//�������� ������ ����� �����
	for ( var i = 0; i < n; i++ ){
		var lat = nodes[i].lat;
		var lng = nodes[i].lng;
		if ( lat < lat_max && lat > lat_min && lng < lng_max && lng > lng_min ){
			nodes_part.push(i);
		}
	}
	u = nodes_part.length;
	console.log(u);
	//���������� ������ � ����� � ��������� �����
	var start = latlng2node_id_part(from,nodes_part,u);
    var end = latlng2node_id_part(to,nodes_part,u);
	console.log(start+':'+end);
	//������ ��������
	var curr = start;
    for ( var i = 0; i < u; i++ ){
	   visited.push(0);
	   label.push(INF);
	   prev.push(0);
	}
    var tempLabel = 0;
	visited[curr] = 1;
	label[curr] = 0;
	while(visited[end] == 0){
		for ( i = 0; i < u; i++ ){
			if ( visited[i] == 1 ) continue;
			var cost = getCost(nodes_part[curr]+1,nodes_part[i]+1, []);
			tempLabel = (cost + label[curr]);
			if (tempLabel > INF) tempLabel = INF;
			if ( label[i] > tempLabel){
				label[i] = tempLabel;
				prev[i] = curr;
			}//end if
		}//end for
		var min = INF;
		var index = curr;
		for ( var i = 0; i < u; i++ ){
			if ( visited[i] == 1 ) continue;
			if ( label[i] < min ){
				min = label[i];
				index = i;
			}
		}//end for
		visited[index] = 1; //����������� ���� ���������� �����
		curr = index;
		if ( min == INF ) break;
	}//end while
	if ( label[end] == INF ){
		callback([]);
		return false;
	} 
	//����� �����������
	var lengthPath = label[end];
	var path = [];
	path.push(nodes_part[end]+1);
	curr = end;
	while( prev[curr] != start ){
		path.push(nodes_part[prev[curr]]+1);
		curr = prev[curr];
	}
	path.push(nodes_part[start]+1);
	path.reverse();
	callback(path2route(path));
}


/**
* ����������� �������� �� ��������� �������� ������� 4
* @param from ��������� �����
* @param to �������� �����
* @param callback ������� ��������� ������ � ������� ���������� ��������� � ����
* ������� ����� [[lat1, lng1], [lat2,lng2],...]]
**/
function routeDijkstraEnemy(from, to, enemy, callback){
    var visited = []; /**���������� ������� � ���������� ������**/
    var label = [];/**����� ������**/
    var prev = [];/**���������� �������**/
	var cost = 0;
	var min = 0;
    start = latlng2node_id(from);
    end = latlng2node_id(to);
	console.log(start+':'+end);
	curr = start;
	var banned = getBannedNodesId(enemy);
	var tempLabel = 0;
    for ( var i = 0; i < n; i++ ){
	   visited.push(0);
	   label.push(INF);
	   prev.push(0);
	}
	label[curr-1] = 0;
	while ( visited[end-1] == 0 ){
		for ( var i = 0; i < n; i++ ){
			if ( visited[i] == 1 ) continue;
			cost = getCost(curr,i+1,banned);
			tempLabel = label[curr-1] + cost;
			if ( tempLabel > INF ) tempLabel = INF;
			if ( label[i] > tempLabel ){
				label[i] = tempLabel;
				prev[i] = curr;
			}	
		}
		visited[curr-1] = 1;
		min = INF;
		index = curr-1;
		for ( var i = 0; i < n; i++ ){
			if ( visited[i] == 1 ) continue;
			if ( min > label[i] ){
				min = label[i];
				index = i;
			}	
		}
		if ( min == INF ) break; 
		curr = index+1;
		//console.log(curr);
	}
	if ( label[end-1] == INF ){
		callback([]);
		return false;
	}
	//����� �����������
    var lengthPath = label[end-1];
	var path = [];
	path.push(end);
	curr = end;
	while( prev[curr-1] != start ){
		path.push(prev[curr-1]);
		curr = prev[curr-1];
	}
	path.push(start);
	path.reverse();
	callback(path2route(path));
}

/**
* �������������� ������������������ id ����� � ������ ����
* � ����
* ������� ����� [[lat1, lng1], [lat2,lng2],...]]
* @param path ������������������ �����
* @return route ������ ����� [[lat1, lng1], [lat2,lng2],...]]
**/
function path2route(path){
	var route = [];
	var len = path.length;
	var prev = 0;
	var geom = null;
	for ( var curr = 0; curr < len; prev = curr, curr++ ){
		geom = getCoordinates(path[prev],path[curr]);
		for ( var i = 0; i < geom.length; i++ ){
			route.push(geom[i]);
		}
	}
	return reverse(route);
}

/**
* ������ ������� ������ � ������� � ������� �����
**/
function reverse(route){
    var reverse_route = [];
    for (var i = 0; i < route.length; i++){
        var dot = [route[i][1], route[i][0]];
        reverse_route.push(dot);
    }
    return reverse_route;
}

/**
* ������ ������� ������ � ������� � ������� �������� �����
**/
function reverse2(route){
    var reverse_route = [];
    for (var i = 0; i < route.length; i++){
        reverse_route.push(reverse(route[i]));
    }
    return reverse_route;
}

/**
* ��������� ��������� ���� �� id
* @param node_id id ����
* @return ������ ��������� [lat,lng]
**/
function node_id2latlng(node_id){
	if ( node_id < 0 || node_id >= n ) return [undefined, undefined];
	return [nodes[node_id - 1].lat, nodes[node_id - 1].lng];
}

/**
* ��������� id ���� �� �����������
* @param dot ������ ��������� [lat,lng]
* @return id ���� 
**/
function latlng2node_id(dot){
	var node_id = 1;
	var minDist = distance(dot,nodes[1]);
	for ( var i = 0; i < n; i++ ){
		var currDist = distance(dot, nodes[i]);
		if ( currDist < minDist ){
			node_id = nodes[i].node_id;
			minDist = currDist;
		}
	}
	return node_id;
}

/**
* ��������� id ���� �� ����������� � ��������� �����
* @param dot ������ ��������� [lat,lng]
* @return id ���� 
**/
function latlng2node_id_part(dot,nodes_part,u){
	var node_id = 0;
	var minDist = distance(dot,nodes[nodes_part[0]]);
	for ( var i = 0; i < u; i++ ){
		var currDist = distance(dot, nodes[nodes_part[i]]);
		if ( currDist < minDist ){
			node_id = i;
			minDist = currDist;
		}
	}
	return node_id;
}

/**
* ���������� �������� ���������� ����� ������ � ����� �����
* @param dot �����, �������� ��� ������ ��������� [lat,lng]
* @param node ���� �����, �������� ��� ������ ���� {node_id:node_id,lat:lat,lng:lng }
* @return ������� ���������� (��� ����� ��������) 
**/
function distance(dot, node){
	return (dot[0]-node.lat)*(dot[0]-node.lat) + (dot[1]-node.lng)*(dot[1]-node.lng);
}

/**
* ����� ���� �����
**/
function getAllRoads(callback){
	var allroads = [];
	var geom = null;
	for ( var i = 0; i < m; i++ ){
		geom = JSON.parse(roads[i].geometry);
		allroads.push(geom.coordinates);
	}
	callback(reverse2(allroads));
}

/**
* ����� ���� �����
**/
function getAllNodes(callback){
	var allnodes = [];
	for ( var i = 0; i < n; i++ ){
		allnodes.push([nodes[i].lat,nodes[i].lng]);
	}
	callback(allnodes);
}

/**
* ����� ���� ����������� �����
**/
function getRestirctedNodes(enemy, callback){
	var restricted = [];
	for ( var i = 0; i < enemy.length; i++ ){
		for ( var j = 0; j < n; j++ ){
			if ( distance([enemy[i].lat,enemy[i].lng],nodes[j]) <= enemy[i].radius * enemy[i].radius ){
				restricted.push([nodes[j].lat,nodes[j].lng]);
			}
		}
	}
	callback(restricted);
}

/**
* ��������� ���� ����������� �����
**/
function getBannedNodesId(enemy){
	var restricted = [];
	for ( var i = 0; i < enemy.length; i++ ){
		for ( var j = 0; j < n; j++ ){
			if ( distance([enemy[i].lat,enemy[i].lng],nodes[j]) <= enemy[i].radius * enemy[i].radius ){
				restricted.push(j+1);
			}
		}
	}
	return restricted;
}

exports.init = init;
exports.query = query;
exports.loadNodes = loadNodes;
exports.latlng2node_id = latlng2node_id;
exports.routeDijkstra = routeDijkstra;
exports.routeDijkstra2 = routeDijkstra2;
exports.routeDijkstra3 = routeDijkstra3;
exports.routeDijkstraEnemy = routeDijkstraEnemy;
exports.getCost = getCost;
exports.routeQuery = routeQuery;
exports.getAllRoads = getAllRoads;
exports.getAllNodes = getAllNodes;
exports.getRestirctedNodes = getRestirctedNodes;