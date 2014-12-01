var sqlite3 = require('sqlite3');
var helper = require('./helper');
var db = new sqlite3.Database('el.sqlite');

function deleteFromTable(callback){
	var sql = "DELETE FROM elevation";
	db.run(sql,function(err){
		if ( err != null ) console.log(err);
		callback();
	});
}

deleteFromTable(function(){
	console.log('table clear');
});