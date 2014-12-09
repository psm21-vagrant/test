/**
* модуль для создания базы sqlite с разбиением
* данных по разным таблицам в зависимости от широты
**/
var sqlite3 = require('sqlite3');


var db_file = process.argv[2];
if ( db_file == undefined ){
	console.log('db_file not defined; Usage: create_db2 <db-file>');
	process.exit(0);
}
var db = new sqlite3.Database(db_file);

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
* создание таблиц высот с именем зависящим от входного индекса
* функция вызывается рекурсивно пока не достигнет максимального индекса
* @param index текущий индекс
* @param min, max минимальный и максимальный индексы
* @param callback функция обратного вызова, вызываемая по окончании операции
**/
function createTable(index, min, max ){
	if ( index == null || index == undefined ) index = min;
	var tableName = number2tablename(index);
	var sql = "CREATE TABLE IF NOT EXISTS " + tableName + " (id INTEGER PRIMARY KEY AUTOINCREMENT, lat REAL, lng REAL, el REAL)";
	//console.log(sql);
	db.run(sql,function(err){
		if ( err != null ){
			console.log(err);
		} else{
			console.log('table ' + tableName + ' has created');
		}
		index++;
		if ( index <= max ){
			createTable(index, min, max);
		}
	});
}

/**создаем пустые таблицы**/
createTable(null,-90,90);


