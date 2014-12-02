var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('el.sqlite');


function dropTable(callback){
	var sql = "DROP TABLE IF EXISTS elevation";
	db.run(sql,function(err){
		if ( err != null ) console.log(err);
		callback();
	});
}

function createTable(callback){
	var sql = "CREATE TABLE IF NOT EXISTS elevation (id INTEGER PRIMARY KEY AUTOINCREMENT, lat REAL, lng REAL, el REAL)";
	db.run(sql,function(err){
		if ( err != null ) console.log(err);
		callback();
	});
}

dropTable(function(){
	createTable(function(){
		console.log('db and table was created');
	});

});

