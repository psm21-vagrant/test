var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('el.sqlite');


function printTable(){
	var sql = "SELECT * FROM elevation";
	db.all(sql, function(err,rows){
		for ( var i = 0; i < rows.length; i++ ){
			console.log(JSON.stringify(rows[i]));
		}
	});
}

printTable();

