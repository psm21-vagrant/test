var sqlite3 = require('sqlite3');
var helper = require('./helper');
var buffer = require('buffer');
var fs = require('fs');
var Debug = require('./debug');
var db = new sqlite3.Database('el.sqlite');
var row = {lat:56.3546,lng:47.3646,el:17};
var filename = 'ETOPO1_Ice_g_int.xyz';
var buffer_size = 1024;//1048576;
var buffer = new Buffer(buffer_size);

function createTable(callback){
	var sql = "CREATE TABLE IF NOT EXISTS elevation (lat REAL, lng REAL, el REAL)";
	db.run(sql,function(err){
		if ( err != null ) console.log(err);
		callback();
	});
}

function insertRow(row,callback){
	var sql = "INSERT INTO elevation (lat,lng,el) VALUES ("+row.lat+","+row.lng+","+row.el+")";
	db.run(sql,function(err){
		console.log(err);
		callback();
	});
}

function printTable(){
	var sql = "SELECT * FROM elevation";
	db.all(sql, function(err,rows){
		for ( var i = 0; i < rows.length; i++ ){
			console.log(JSON.stringify(rows[i]));
		}
	});
}

/*
fs.open(filename,'r', function(err,fd){
	if ( err != null ) console.log(err);
	var string = '';
	var data = [];
	var portion = [];
	var offset = 0;
	var position = 0;
	var count = 0;
	/**пока файл не кончится читаем частями в буфер**/
	while( fs.readSync(fd, buffer, offset, buffer_size, position) != 0 ){ 	
		/**читаем побайтно в массив**/
		for ( var i = 0; i < buffer_size; i++ ){ 
			portion.push(buffer[i]);
			/**если встречаем байт 0A, то парсим строку из массива и записываем координаты и высоту в базу**/
			/** потом очищаем массив**/
			if ( buffer[i] == 10 ){
				for ( j = 0; j < portion.length; j++ ){
					string += String.fromCharCode(portion[j]);
					if ( portion[j] == 32 || portion[j] == 10 ){
						data.push(parseFloat(string.slice(0,string.length-1)));
						string = '';
					}
				}
				fs.appendFileSync('./log.txt',data[0]+':'+data[1]+':'+data[2]+'\n');
				portion = [];
				data = [];
			}	
		}
		position += buffer_size;
	}
	
	fs.closeSync(fd);
});


/*
createTable(function(){
	row.el = helper.getRandomInt(0,1000);
	insertRow(row, printTable);
});
*/

