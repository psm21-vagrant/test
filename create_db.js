/**модуль для создания базы sqlite с пустой таблицей высот**/
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('el.sqlite');

/**
* удаление таблицы высот если она существует
* @param callback функция обратного вызова, вызываемая по окончании операции
**/
function dropTable(callback){
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
function createTable(callback){
	var sql = "CREATE TABLE IF NOT EXISTS elevation (id INTEGER PRIMARY KEY AUTOINCREMENT, lat REAL, lng REAL, el REAL)";
	db.run(sql,function(err){
		if ( err != null ) console.log(err);
		callback();
	});
}

/**удаляем и создаем пустую таблицу**/
dropTable(function(){
	createTable(function(){
		console.log('db and table was created');
	});

});

