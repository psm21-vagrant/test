var sqlite = require('spatialite');
var db = new sqlite.Database('RU-ME.sqlite');
var debug = require('./debug.js');

/** 
* ������� id ���� ����� ���������� � ����� � ��������� ������������
* @param lat,lng ����������
* @param callback ������� ��������� ������ � ������� ���������� id ���� 
**/
function getNodeId(lat,lng, callback){
	var sql = "SELECT node_id, X(geometry) AS x, Y(geometry) AS y, MIN(Distance(geometry, MakePoint("+lng+","+lat+"))) AS rast FROM roads_nodes";
    db.spatialite(function(err) {
	  db.get(sql, function(err, row) {
        //console.log(row.node_id);
        callback(row.node_id);
	  });
	});
}


/** 
* ������� id ����� ����� ��������� � ������ � ��������� ������������
* @param dots ������ ����� [[lat1,lng1],[lat2,lng2]...]
* @param callback ������� ��������� ������ � ������� ���������� id ���� 
**/
function getSeveralNodeId(dots, callback){
	var ids = [];
	var dotsLen = dots.length;
	for ( var i = 0; i < dotsLen; i++ ){
		getNodeId(dots[i][0],dots[i][1],function(id){
			ids.push(id);
			if (ids.length == dotsLen) callback(ids);
		});
	}
}

/** 
* ������� ���� ����� ������� �� ������ ���������� �������
* �� ����� � ��������� ������������
* @param lat,lng ����������
* @param radius ������
* @param callback ������� ��������� ������ � ������� ���������� 
* ������ �������� ���� {node_id:<id ����>, x: <������>, y: <�������>} 
**/
function getNodesInRadius(lat, lng, radius, callback){
	var condition = "Distance(geometry, MakePoint("+lng+","+lat+")) < " + radius;
	var sql1 = "SELECT count(*) AS count FROM roads_nodes WHERE " + condition;
	var sql2 = "SELECT node_id, X(geometry) AS x, Y(geometry) as y FROM roads_nodes WHERE " + condition;
	var result = [];
	db.spatialite(function(err) {
		db.each(sql1, function(err, row1) {
			db.each(sql2, function(err, row2) {
				result.push(row2);
				if (result.length == row1.count) callback(result);
			 });
		});
	});
}

/** 
* ������� ���� ����� ������� �� ������ ���������� �������
* �� ������� ����� ��������� � ���� ������� {lat:lat, lng:lng, radius: radius}
* @param dots ������ ��������, �������� ����� ���� {lat:lat, lng:lng, radius: radius}
* @param callback ������� ��������� ������ � ������� ���������� 
* ������ id �����
**/
function getNodesInRadiusDots(dots, callback){
	var dotsLen = dots.length;
	var condition = "";
	if ( dotsLen > 0 ){
		for ( var i = 0; i < dotsLen; i++ ){
			condition += "Distance(geometry, MakePoint("+dots[i].lng+","+dots[i].lat+")) < " + dots[i].radius;
			if ( i < dotsLen - 1 ) condition += " OR ";
		}
	}else{
		condition += "1";
	}
	
	var sql = "SELECT node_id, X(geometry) AS x, Y(geometry) as y FROM roads_nodes WHERE " + condition;
	var result = [];
	db.spatialite(function(err) {
		db.all(sql, function(err, rows) {
			for ( var i = 0; i < rows.length; i++ ) result.push(rows[i].node_id);
			callback(result);
		});
	});
}


/** 
* ������� ������� �� ���� � id = from �� ���� � id = to, �� ���������� ����� ����
* ��������� � ������� ����������� ����� exc
* @param from, to id ����� ����� ��������� � �������� �����
* @param exc ������ id ����������� �����
* @param callback ������� ��������� ������ � ������� ���������� 
* ������� � ���� ������� ����� ���� [[lat1,lng1],[lat2,lng2]...]
* ���� ������� �� ������ ���������� ������ ������ 
**/
function getRouteExc(from, to, exc, callback){
	var sql = "SELECT AsGeoJSON(geometry) AS geometry FROM roads_net WHERE ";
	sql += "NodeFrom=" + from + " AND NodeTo=" + to; 
	var excLen = exc.length;
	
	if ( excLen > 0 ){
		var excStr = '';
		for ( var i = 0; i < excLen; i++ ){
			excStr += exc[i];
			if ( i < excLen - 1 ) excStr += ',';
		}
		sql += " AND NodeTo NOT IN (" + excStr + ") AND NodeFrom NOT IN (" + excStr + ")";
	}
	sql += " LIMIT 1;"
	debug.log(sql);
	db.spatialite(function(err) {
		db.get(sql, function(err, row) {
			route = [];
			if ( row != undefined ){
				if ( row.geometry != null ){
					var obj = JSON.parse(row.geometry);
					route = obj.coordinates;
				}
			}
			callback(reverse(route));
		});
	});
}

/** 
* ������� ������� �� ���� � id = from �� ���� � id = to
* @param from, to id ����� ����� ��������� � �������� �����
* @param callback ������� ��������� ������ � ������� ���������� 
* ������� � ���� ������� ����� ���� [[lat1,lng1],[lat2,lng2]...]
* ���� ������� �� ������ ���������� ������ ������ 
**/
function getRouteDirect(from, to, callback){
	var sql = "SELECT AsGeoJSON(geometry) AS geometry FROM roads_net WHERE ";
	sql += "NodeFrom=" + from + " AND NodeTo=" + to; 
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
* ��������������� ������� ��� ���������� �����������
* ������� � getRouteRestricted, ������� id ��������� ����
* �� ��� ����������� � �������� getRestricted
**/
function getTargetIdRestricted(idSource, target, restricted, callback){
	getNodeId(target[0], target[1], function(idTarget){
		getRestricted(idSource, idTarget, restricted, callback);
	});
}

/** 
* ��������������� ������� ��� ���������� �����������
* ������� � getRoute, ������� id ��������� ����
* �� ��� ����������� � �������� getRoute
**/
function getTargetId(idSource, target, callback){
	getNodeId(target[0], target[1], function(idTarget){
		getRouteDirect(idSource, idTarget, callback);
	});
}

/** 
* ��������������� ������� ��� ���������� �����������
* ������� � getRouteRestricted, ������� ������ id �����������
* ����� �� �� ����������� � �������� � �������� getRouteExc
**/
function getRestricted(idSource, idTarget, restricted, callback){
	getNodesInRadiusDots(restricted, function(restrictedDots){
		getRouteExc(idSource, idTarget, restrictedDots, callback)
	});
}


/** 
* ������� ������� �� ����� source �� ����� target, �� ���������� ����� �����
* ��������� � ������� ����������� ����� restricted
* @param source, target ��������� � �������� ������, �������� ��� ������� [lat,lng]
* @param restricted ����������� �����, �������� ��� ������ �������� ���� {lat:lat, lng:lng, radius: radius}
* @param callback ������� ��������� ������ � ������� ���������� 
* ������� � ���� ������� ����� ���� [[lat1,lng1],[lat2,lng2]...]
* ���� ������� �� ������ ���������� ������ ������ 
**/
function getRouteRestricted(source, target, restricted, callback){
	getNodeId(source[0], source[1], function(idSource){
		getTargetIdRestricted(idSource, target, restricted, callback);
	});

}

/** 
* ������� ������� �� ����� source �� ����� target
* @param source, target ��������� � �������� ������, �������� ��� ������� [lat,lng]
* @param callback ������� ��������� ������ � ������� ���������� 
* ������� � ���� ������ ����� ���� [[lat1,lng1],[lat2,lng2]...]
* ���� ������� �� ������ ���������� ������ ������ 
**/
function getRoute(source, target, callback){
	getNodeId(source[0], source[1], function(idSource){
		getTargetId(idSource, target, callback);
	});

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
* ������� �������� �� ����� source �� ���������� ����� targets, �� ���������� ����� �����
* ��������� � ������� ����������� ����� restricted
* @param source ��������� ����� �������� ��� ������ [lat,lng]
* @param targets ������ �������� �����, �������� ��� ������ ������ ����� [[lat1,lng1],[lat2,lng2]...]
* @param restricted ����������� �����, �������� ��� ������ �������� ���� {lat:lat, lng:lng, radius: radius}
* @param callback ������� ��������� ������ � ������� ���������� 
* ������� � ���� ������� ����� ���� [[lat1,lng1],[lat2,lng2]...]
* ���� ������� �� ������ ���������� ������ ������ 
**/
function getSeveralRoutesRestricted(source, targets, restricted, callback){
	getNodeId(source[0], source[1], function(idSource){
		getSeveralTargetIdRestricted(idSource, targets, restricted, callback);
	});

}

/** 
* ��������������� ������� ��� ���������� �����������
* ������� � getSeveralRoutesRestricted, ������� id �������� �����
* �� �� ����������� � �������� getSeveralRestricted
**/
function getSeveralTargetIdRestricted(idSource, targets, restricted, callback){
	getSeveralNodeId(targets, function(idsTarget){
		getSeveralRectricted(idSource,idsTarget,restricted,callback);
	});
}

/** 
* ��������������� ������� ��� ���������� �����������
* ������� � getSeveralRoutesRestricted, ������� ������ id �����������
* ����� �� �� ����������� � �������� � �������� getSeveralRouteExc
**/
function getSeveralRectricted(idSource, idsTarget, restricted, callback){
	getNodesInRadiusDots(restricted, function(restrictedDots){
		getSeveralRouteExc(idSource, idsTarget, restrictedDots, callback);
	});
}

/** 
* ������� �������� �� ���� � id = from �� ����� � id = to, �� ���������� ����� ����
* ��������� � ������� ����������� ����� exc
* @param from  id ���� ����� ��������� �����
* @param to ������ id ����� ����� �������� �����
* @param exc ������ id ����������� �����
* @param callback ������� ��������� ������ � ������� ���������� 
* �������� � ���� ������� �������� ����� ���� [[lat1,lng1],[lat2,lng2]...]
* ���� �������� �� ������ ���������� ������ ������ 
**/
function getSeveralRouteExc(from, to, exc, callback){
	var sql = "SELECT AsGeoJSON(geometry) AS geometry FROM roads_net WHERE ";
	sql += "NodeFrom=" + from + " AND ("; 
	
	var toLen = to.length;
	var toStr = '';
	for ( i = 0; i < toLen; i++ ){
		sql += "NodeTo=" + to[i];
		if ( i < toLen - 1 ) sql += " OR ";
	}
	sql += ")";
	
	var excLen = exc.length;
	if ( excLen > 0 ){
		var excStr = '';
		for ( var i = 0; i < excLen; i++ ){
			excStr += exc[i];
			if ( i < excLen - 1 ) excStr += ',';
		}
		sql += " AND NodeTo NOT IN (" + excStr + ") AND NodeFrom NOT IN (" + excStr + ")";
	}
	sql += " AND geometry NOT NULL"
	debug.log(sql);
	db.spatialite(function(err) {
		db.all(sql, function(err, rows) {
			routes = [];
			if ( rows != undefined ){
				if ( rows != null ){
					for ( var i = 0; i < rows.length; i++ ){
						var obj = JSON.parse(rows[i].geometry);
						routes.push(obj.coordinates);
					}
					
				}
			}
			callback(reverse2(routes));
		});
	});
}

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

exports.getNodeId = getNodeId;
exports.getNodesInRadius = getNodesInRadius;
exports.getNodesInRadiusDots = getNodesInRadiusDots;
exports.getRoute = getRoute;
exports.getRouteRestricted = getRouteRestricted;
exports.getSeveralNodeId = getSeveralNodeId;
exports.getSeveralRoutesRestricted = getSeveralRoutesRestricted;
exports.query = query;