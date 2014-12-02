/**модуль для записи высотных данных из файла в базу sqlite**/
var sqlite3 = require('sqlite3');
var buffer = require('buffer');
var fs = require('fs');
var db = new sqlite3.cached.Database('el.sqlite');
var util = require('util');
var Debug= require('./debug');

var sql = "PRAGMA journal_mode = PERSIST";
db.run(sql);

/**
* вставка данных из массива data вида [lng1, lat2, el1, lng2, lat2, el2, ...]
* в базу sqlite  
* @param data массив распарсеных данных вида [lng1, lat2, el1, lng2, lat2, el2, ...]
* @param callback функция обратного вызова, вызываесая по завершении операции
**/
function insertRows(data,callback){
	
	var sql = "INSERT INTO elevation (lat,lng,el) VALUES ";
	for ( var i = 0; i < data.length-2; i += 3 ){
		sql += "("+data[i]+","+data[i+1]+","+data[i+2]+")";
		if ( i < data.length-3 ) sql += ",";
	}
	
	db.run(sql, function(err){
		if ( err != null ){
			console.log(err);
		}
		callback();
	});
}

/**
* чтение высотных данных из файла 
* в базу sqlite  
* @param filename имя файла с высотными данными
* @param buffer_size размер буфера для чтения в байтах
**/
function loadFileToDb(filename, buffer_size){
	
	var fd = fs.openSync(filename,'r');
	util.print('progress: ');
	var offset = 0;
	var position = 0;
	var count = 0;
	var lastOutputLen = 0;
	var portion = [];
	var readBuf = new Buffer(buffer_size);
	var file_size = fs.statSync(filename).size;
	/**пока файл не кончится читаем частями в буфер (функция рекурсивно вызывает саму себя пока не кончится файл)**/
	loadBufferToDb(fd, portion, readBuf, offset, buffer_size, position, lastOutputLen, file_size);
	//fs.closeSync(fd);
}

/**
* чтение данных из буфера, парсинг и запись 
* в базу sqlite  
* @param fd дескриптор файла с высотными данными
* @param portion временнный буфер(массив) для хранения символов содержащих данные для одной точки
* @param readBuf буфер для чтения из файла (экземпляр класса buffer)
* @param offset смещение в буфере для чтения
* @param buffer_size размер буфера для чтения в байтах
* @param position позиция начала чтения в файле
* @param lastOutputLen  количество символов последнего вывода
* @param file_size размер исходного файла с высотными данными
**/
function loadBufferToDb(fd, portion, readBuf, offset, buffer_size, position, lastOutputLen, file_size){
	
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
	var progress = (position/file_size * 100).toFixed(6)+'%';
	for ( var i = 0; i < lastOutputLen; i++ ){
		util.print('\b');
	}
	util.print(progress);
	lastOutputLen = progress.length;
	insertRows(data, function(){
		data=[];  
		loadBufferToDb(fd, portion, readBuf, offset, buffer_size, position, lastOutputLen, file_size); 
	});
}

loadFileToDb('ETOPO1_Ice_g_int.xyz', 4096);


