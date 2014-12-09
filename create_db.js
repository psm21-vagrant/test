/**модуль для создания базы sqlite с пустой таблицей высот**/
var sqlite3 = require('sqlite3');


/**
* удаление таблицы высот если она существует
* @param callback функция обратного вызова, вызываемая по окончании операции
**/
function dropTable(db_file, callback){
	var db = new sqlite3.Database(db_file);
	var sql = "DROP TABLE IF EXISTS elevation";
	db.run(sql,function(err){
		if ( err != null ) console.log(err);
		callback();
	});
}

/**
* создание таблицы высот если она не существует
* @param callback функция обратного вызова, вызываемая по окончании операции
**/
function createTable(db_file, callback){
	var db = new sqlite3.Database(db_file);
	var sql = "CREATE TABLE IF NOT EXISTS elevation (id INTEGER PRIMARY KEY AUTOINCREMENT, lat REAL, lng REAL, el REAL)";
	db.run(sql,function(err){
		if ( err != null ) console.log(err);
		callback();
	});
}

/**удаляем и создаем пустую таблицу**/
var db_file = process.argv[2];
if ( db_file == undefined ){
	console.log('db_file not defined; Usage create_db <db_file>');
	process.exit(0);
}
dropTable(db_file, function(){
	createTable(db_file, function(){
		console.log('db ' + db_file+ ' and table was created');
	});

});

