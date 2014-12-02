var sqlite3 = require('sqlite3');
var buffer = require('buffer');
var fs = require('fs');
var db = new sqlite3.cached.Database('el.sqlite');
var util = require('util');
var Debug= require('./debug');

var sql = "PRAGMA journal_mode = PERSIST";
db.run(sql);

function insertRows(data,callback){
	
	var sql = "INSERT INTO elevation (lat,lng,el) VALUES ";
	for ( var i = 0; i < data.length-2; i += 3 ){
		sql += "("+data[i]+","+data[i+1]+","+data[i+2]+")";
		if ( i < data.length-3 ) sql += ",";
	}
	
	db.run(sql, function(err){
		if ( err != null ){
			Debug.log(err);
		}
		callback();
	});
}

function loadFileToDb(filename, buffer_size){
	
	var fd = fs.openSync(filename,'r');
	util.print('progress: ');
	var offset = 0;
	var position = 0;
	var count = 0;
	var first = true;
	var portion = [];
	var readBuf = new Buffer(buffer_size);
	var file_size = fs.statSync(filename).size;
	/**пока файл не кончится читаем частями в буфер**/
	loadBufferToDb(fd, portion, readBuf, offset, buffer_size, position, first, file_size);
	//fs.closeSync(fd);
}

function loadBufferToDb(fd, portion, readBuf, offset, buffer_size, position, first, file_size){
	
	var string = '';
	var data = [];
	var readed = fs.readSync(fd, readBuf, offset, buffer_size, position);	
	if ( readed == 0 ) return true;
	/**читаем побайтно в массив**/
	for ( var i = 0; i < readed; i++ ){ 
		portion.push(readBuf[i]);
		/**если встречаем байт 0A, то парсим строку из массива и записываем координаты и высоту в базу**/
		/** потом очищаем массив**/
		if ( readBuf[i] == 10 ){
			for ( j = 0; j < portion.length; j++ ){
				string += String.fromCharCode(portion[j]);
				if ( portion[j] == 32 || portion[j] == 10 ){
					data.push(parseFloat(string.slice(0,string.length-1)));
					string = '';
				}
			}
			portion = [];
		}	
	}
	position += buffer_size;
	/**вывод прогресса**/
	if ( first ){
		first = false;
	}else{
		util.print('\b\b\b\b\b\b\b\b\b');
	}
	util.print((position/file_size * 100).toFixed(6)+'%');
	insertRows(data, function(){
		data=[];  
		loadBufferToDb(fd, portion, readBuf, offset, buffer_size, position, first, file_size); 
	});
}

loadFileToDb('ETOPO1_Ice_g_int.xyz', 4096);


