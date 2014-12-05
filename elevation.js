/**получение высот из базы высот**/
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('el.sqlite');
var delta = 0.01;
var time = require('./time');

/**
* получение высоты точки из базы
* @param dot точка в виде массива [lat,lng]
* @param callback функция обратного вызова в которую передается 
* результата в виде: {lat_origin: lat, lng_origin: lng, lat:lat, lng:lng, elevation: elevation} 
**/
function getElevation(dot, callback){
	var latMin = dot[0] - delta;
	var latMax = dot[0] + delta;
	var lngMin = dot[1] - delta;
	var lngMax = dot[1] + delta;
	
	var sql = "SELECT lat, lng, el FROM elevation WHERE ";
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

var argv = process.argv;
if ( argv.length < 4 ){
	console.log('not find arguments lat, lng');
}else if ( argv[2] < -90 || argv[2] > 90 || argv[3] < -180 || argv[3] > 180 ){
	console.log('not correct arguments lat, lng');
}else{
	var lat = parseFloat(argv[2]);
	var lng = parseFloat(argv[3]);
	time.start();
	getElevation([lat, lng], function(res){
		console.log('Executing time: '+time.stop());
		console.log(JSON.stringify(res));
	});
} 