var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('el.sqlite');

function createTable(callback){
	var sql = "CREATE TABLE IF NOT EXISTS elevation (lat REAL, lng REAL, el REAL)";
	db.run(sql,function(err){
		if ( err != null ) console.log(err);
		callback();
	});
}

createTable(function(){console.log('table created')});

