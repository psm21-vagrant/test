var sqlite = require('spatialite');
var db = new sqlite.Database('RU-ME.sqlite');
var debug = require('./debug.js');

/** 
* находим id узла графа ближайшего а точке с заданными координатами
* @param lat,lng координаты
* @param callback функция обратного вызова в которую передается id узла 
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
* находим id узлов графа ближайших а точкам с заданными координатами
* @param dots массив точек [[lat1,lng1],[lat2,lng2]...]
* @param callback функция обратного вызова в которую передается id узла 
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
* находим узлы графа лежащих не дальше указанного радиуса
* от точки с заданными координатами
* @param lat,lng координаты
* @param radius радиус
* @param callback функция обратного вызова в которую передается 
* массив объектов вида {node_id:<id узла>, x: <широта>, y: <долгота>} 
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
* находим узлы графа лежащих не дальше указанного радиуса
* от массива точек заданными в виде объекта {lat:lat, lng:lng, radius: radius}
* @param dots массив объектов, задающих точки вида {lat:lat, lng:lng, radius: radius}
* @param callback функция обратного вызова в которую передается 
* массив id узлов
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
* находим маршрут от узла с id = from до узла с id = to, не проходящий через узлы
* указанные в массиве запрещенных узлов exc
* @param from, to id узлов графа начальной и конечной точек
* @param exc массив id запрещенных узлов
* @param callback функция обратного вызова в которую передается 
* маршрут в виде массива точек вида [[lat1,lng1],[lat2,lng2]...]
* если маршрут не найден передается пустой массив 
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
* находим маршрут от узла с id = from до узла с id = to
* @param from, to id узлов графа начальной и конечной точек
* @param callback функция обратного вызова в которую передается 
* маршрут в виде массива точек вида [[lat1,lng1],[lat2,lng2]...]
* если маршрут не найден передается пустой массив 
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
* вспомогательная функция для сокращения вложенности
* вызовов в getRouteRestricted, находим id конечного узла
* по его координатам и вызываем getRestricted
**/
function getTargetIdRestricted(idSource, target, restricted, callback){
	getNodeId(target[0], target[1], function(idTarget){
		getRestricted(idSource, idTarget, restricted, callback);
	});
}

/** 
* вспомогательная функция для сокращения вложенности
* вызовов в getRoute, находим id конечного узла
* по его координатам и вызываем getRoute
**/
function getTargetId(idSource, target, callback){
	getNodeId(target[0], target[1], function(idTarget){
		getRouteDirect(idSource, idTarget, callback);
	});
}

/** 
* вспомогательная функция для сокращения вложенности
* вызовов в getRouteRestricted, находим массив id запрещенных
* узлов по их координатам и радиусам и вызываем getRouteExc
**/
function getRestricted(idSource, idTarget, restricted, callback){
	getNodesInRadiusDots(restricted, function(restrictedDots){
		getRouteExc(idSource, idTarget, restrictedDots, callback)
	});
}


/** 
* находим маршрут от точки source до точки target, не проходящий через точки
* указанные в массиве запрещенных точек restricted
* @param source, target начальная и конечная точеки, заданные как массивы [lat,lng]
* @param restricted запрещенные точки, заданные как массив объектов вида {lat:lat, lng:lng, radius: radius}
* @param callback функция обратного вызова в которую передается 
* маршрут в виде массива точек вида [[lat1,lng1],[lat2,lng2]...]
* если маршрут не найден передается пустой массив 
**/
function getRouteRestricted(source, target, restricted, callback){
	getNodeId(source[0], source[1], function(idSource){
		getTargetIdRestricted(idSource, target, restricted, callback);
	});

}

/** 
* находим маршрут от точки source до точки target
* @param source, target начальная и конечная точеки, заданные как массивы [lat,lng]
* @param callback функция обратного вызова в которую передается 
* маршрут в виде масива точек вида [[lat1,lng1],[lat2,lng2]...]
* если маршрут не найден передается пустой массив 
**/
function getRoute(source, target, callback){
	getNodeId(source[0], source[1], function(idSource){
		getTargetId(idSource, target, callback);
	});

}

/**
* меняем местами широту и долготу в массиве точек
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
* меняем местами широту и долготу в массиве массивов точек
**/
function reverse2(route){
    var reverse_route = [];
    for (var i = 0; i < route.length; i++){
        reverse_route.push(reverse(route[i]));
    }
    return reverse_route;
}

/** 
* находим маршруты от точки source до нескольких точек targets, не проходящий через точки
* указанные в массиве запрещенных точек restricted
* @param source начальная точка заданная как массив [lat,lng]
* @param targets массив конечных точек, заданные как массив массив точек [[lat1,lng1],[lat2,lng2]...]
* @param restricted запрещенные точки, заданные как массив объектов вида {lat:lat, lng:lng, radius: radius}
* @param callback функция обратного вызова в которую передается 
* маршрут в виде массива точек вида [[lat1,lng1],[lat2,lng2]...]
* если маршрут не найден передается пустой массив 
**/
function getSeveralRoutesRestricted(source, targets, restricted, callback){
	getNodeId(source[0], source[1], function(idSource){
		getSeveralTargetIdRestricted(idSource, targets, restricted, callback);
	});

}

/** 
* вспомогательная функция для сокращения вложенности
* вызовов в getSeveralRoutesRestricted, находим id конечных узлов
* по их координатам и вызываем getSeveralRestricted
**/
function getSeveralTargetIdRestricted(idSource, targets, restricted, callback){
	getSeveralNodeId(targets, function(idsTarget){
		getSeveralRectricted(idSource,idsTarget,restricted,callback);
	});
}

/** 
* вспомогательная функция для сокращения вложенности
* вызовов в getSeveralRoutesRestricted, находим массив id запрещенных
* узлов по их координатам и радиусам и вызываем getSeveralRouteExc
**/
function getSeveralRectricted(idSource, idsTarget, restricted, callback){
	getNodesInRadiusDots(restricted, function(restrictedDots){
		getSeveralRouteExc(idSource, idsTarget, restrictedDots, callback);
	});
}

/** 
* находим маршруты от узла с id = from до узлов с id = to, не проходящий через узлы
* указанные в массиве запрещенных узлов exc
* @param from  id узла графа начальной точки
* @param to массив id узлов графа конечных точек
* @param exc массив id запрещенных узлов
* @param callback функция обратного вызова в которую передаются 
* маршруты в виде массива массивов точек вида [[lat1,lng1],[lat2,lng2]...]
* если маршруты не найден передается пустой массив 
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