var time = require('./time');
var sqlite3 = require('sqlite3');

var db = new sqlite3.Database('el.sqlite');
var argv = process.argv;
if ( argv.length < 4 ){
	console.log("Usage: node query_db <db_file> <'SQL expression'>");
	process.exit(0);
}else{ 
	var db = new sqlite3.Database(argv[2]);
	var sql = argv[3];
	time.start();
	db.all(sql, function(err, rows){
		console.log('Executing time: '+time.stop());
		for ( var i = 0; i < rows.length; i++ ){
			console.log(JSON.stringify(rows[i]));
		}
		
	});
} 