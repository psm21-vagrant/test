/**получение высот из базы высот**/
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('el2.sqlite');
var delta = 0.01;
var resultArr = [];

/**
* получение имени таблицы из числа
* @param index число
* @return string имя таблицы
**/
function number2tablename(index){
	var tableName = "";
	if ( index < 0 ){
		tableName += "n";
	}else{
		tableName += "p";
	}
	tableName += Math.floor(Math.abs(index)) + '_elevation';
	return tableName;
}

/**
* получение высоты точки из базы с разбиением данных на множество таблиц
* @param dot точка в виде массива [lat,lng]
* @param callback функция обратного вызова в которую передается 
* результата в виде: {lat_origin: lat, lng_origin: lng, lat:lat, lng:lng, elevation: elevation} 
**/
function getElevation(dot, callback){
	var latMin = dot[0] - delta;
	var latMax = dot[0] + delta;
	var lngMin = dot[1] - delta;
	var lngMax = dot[1] + delta;
	
	var tableName = number2tablename(dot[0]);
	var sql = "SELECT lat, lng, el FROM " + tableName + " WHERE ";
	sql += "lat > " + latMin + " AND lat < " + latMax + " AND ";
	sql += "lng > " + lngMin + " AND lng < " + lngMax;
	sql += " LIMIT 1";
	console.log(sql);
	db.get(sql, function(err, row){
		if ( err == null ){
			callback({lat_origin:dot[0], lng_origin:dot[1], lat:row.lat, lng:row.lng, elevation: row.el});
		}else{
			console.log(err);
			callback(null);
		} 
	});
}

/**
* получение высот нескольких точек из базы с разбиением данных на множество таблиц
* @param index ндекс тоски в массиве точек
* @param dots массив точек в виде  [[lat1,lng1], [lat2,lng2],...]
* @param callback функция обратного вызова в которую передается 
* результата в виде массива объектов: [{lat_origin: lat, lng_origin: lng, lat:lat, lng:lng, elevation: elevation},...] 
**/
function getElevations(index, dots, callback){
	if ( index == null || index == undefined ){
		index = 0;
		resultArr = [];
	}
	var latMin = dots[index][0] - delta;
	var latMax = dots[index][0] + delta;
	var lngMin = dots[index][1] - delta;
	var lngMax = dots[index][1] + delta;
	
	var tableName = number2tablename(dots[index][0]);
	var sql = "SELECT lat, lng, el FROM " + tableName + " WHERE ";
	sql += "lat > " + latMin + " AND lat < " + latMax + " AND ";
	sql += "lng > " + lngMin + " AND lng < " + lngMax;
	sql += " LIMIT 1";
	console.log(sql);
	db.get(sql, function(err, row){
		if ( err == null ){
			resultArr.push({lat_origin:dots[index][0], lng_origin:dots[index][1], lat:row.lat, lng:row.lng, elevation: row.el});
		}else{
			resultArr.push({lat_origin:dots[index][0], lng_origin:dots[index][1], lat:undefined, lng:undefined, elevation: undefined});	
		}
		index++;
		if ( index < dots.length ){
			getElevations(index, dots, callback);
		}else{
			callback(resultArr);
		}
	});
}

function query_exec(sql, callback){
	db.all(sql, function(err, rows){
		var result = [];
		if ( err == null ){
			for ( var i = 0; i < rows.length; i++ ){
				result.push(rows[i]);
			}
			callback(result);
		}else{
			console.log(err);
			callback(null);
		} 
	});
}

exports.getElevation = getElevation;
exports.getElevations = getElevations;
exports.query_exec = query_exec;