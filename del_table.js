/**модуль для удаления записей из таблицы высот**/
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('el.sqlite');

/**
* удаление записей из таблицы высот
* @param callback функция обратного вызова, вызываемая по окончании операции
**/
function deleteFromTable(callback){
	var sql = "DELETE FROM elevation";
	db.run(sql,function(err){
		if ( err != null ) console.log(err);
		callback();
	});
}

deleteFromTable(function(){
	console.log('table clear');
})