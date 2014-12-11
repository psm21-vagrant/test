/**��������� ����� �� ���� �����**/
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('el2.sqlite');
var delta = 0.01;
var resultArr = [];

/**
* ��������� ����� ������� �� �����
* @param index �����
* @return string ��� �������
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
* ��������� ������ ����� �� ���� � ���������� ������ �� ��������� ������
* @param dot ����� � ���� ������� [lat,lng]
* @param callback ������� ��������� ������ � ������� ���������� 
* ���������� � ����: {lat_origin: lat, lng_origin: lng, lat:lat, lng:lng, elevation: elevation} 
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
* ��������� ����� ���������� ����� �� ���� � ���������� ������ �� ��������� ������
* @param dots ������ ����� � ����  [[lat1,lng1], [lat2,lng2],...]
* @param callback ������� ��������� ������ � ������� ���������� 
* ���������� � ���� ������� ��������: [{lat_origin: lat, lng_origin: lng, lat:lat, lng:lng, elevation: elevation},...] 
**/
function getElevations(dots, callback){
	resultArr = [];
	var group = groupDots(dots);
	
	var arrSQL = prepSQLArray(group);
	console.log(arrSQL);
	queryArrayRun(0, arrSQL, callback);
}

/**
* ���������� ������ ������� �� ������� � �������
* @param dots ������ ����� ���� [[lng1, lat1], [lng2, lat2], ...]
* @return sql ������ �������
**/
function prepSQL(table, dots){
	var sql = "";
	if ( dots.length > 0 ){
		sql = "SELECT lat, lng, el FROM " + table + " WHERE ";
		for ( var i = 0; i < dots.length; i++ ){
			var latMin = dots[i][0] - delta;
			var latMax = dots[i][0] + delta;
			var lngMin = dots[i][1] - delta;
			var lngMax = dots[i][1] + delta;
			sql += " ( lat > " + latMin + " AND lat < " + latMax + " AND ";
			sql += "lng > " + lngMin + " AND lng < " + lngMax +" ) ";
			if ( i < dots.length-1 ) sql += " OR ";
		}
	}
	return sql;
} 


/**
* ���������� ������� ����� � ��������� �� ������� �� ���������������� �������
* @param group ������ ���� {tablename1:[[lat1,lng1],[lat2,lng2]], tablename2:[[lat3,lng3],[lat4,lng4]], ...}
* @return arrSQL ������ ����� �������
**/
function prepSQLArray(group){
	var arrSQL = [];
	for ( var table in group ){
		arrSQL.push(prepSQL(table, group[table]));
	}
	return arrSQL;
}

/**
* ���������� ���������� �������� ��������������� (������������� ��������)
* @param index ������ ������� � ������� ��������
* @param arrSQL ������ �������� (������ �����)
* @param callback ������� ��������� ������, ���������� ����� ���������� ���� ��������
**/
function queryArrayRun(index, arrSQL, callback){
	db.all(arrSQL[index], function(err, rows){
		if ( err == null ){
			for ( var i = 0; i < rows.length; i++ ){
				resultArr.push(rows[i]);
			}
		}
		index++;
		if ( index < arrSQL.length ){
			queryArrayRun(index, arrSQL, callback);
		}else{
			callback(resultArr);
		}
	});
}

/**
* �������������� ������� dots � ������  
* ������������ �����  ������� ��������� � �������������� ��������
* @param dots ������ ����� ���� [[lng1, lat1], [lng2, lat2], ...]
* @return group ������ ���� {tablename1:[[lat1,lng1],[lat2,lng2]], tablename2:[[lat3,lng3],[lat4,lng4]], ...}
**/
function groupDots(dots){
	var group = {};
	for ( var i = 0; i < dots.length; i++ ){
		var tableName = number2tablename(dots[i][0]);
		if ( group[tableName] == undefined ){
			group[tableName] = [dots[i]];
		}else{
			group[tableName].push(dots[i]);
		}
	}
	return group;
}

/**
* ��������� ����� ������� �� �����
* @param index �����
* @return string ��� �������
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


exports.getElevation = getElevation;
exports.getElevations = getElevations;