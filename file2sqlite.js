var sqlite3 = require('sqlite3');
var buffer = require('buffer');
var fs = require('fs');
var db = new sqlite3.Database('el.sqlite');
var util = require('util');

function insertRow(row,callback){
	var sql = "INSERT INTO elevation (lat,lng,el) VALUES ("+row.lat+","+row.lng+","+row.el+")";
	db.run(sql,function(err){
		if ( err != null ) console.log(err);
		callback();
	});
}

function loadFileToDb(filename, buffer_size){
	
	fs.open(filename,'r', function(err,fd){
		if ( err != null ) console.log(err);
		var string = '';
		var data = [];
		var portion = [];
		var offset = 0;
		var position = 0;
		var count = 0;
		var first = true;
		var readBuf = new Buffer(buffer_size);
		var file_size = fs.statSync(filename).size;
		/**пока файл не кончится читаем частями в буфер**/
		while( fs.readSync(fd, readBuf, offset, buffer_size, position) != 0 ){ 	
			/**читаем побайтно в массив**/
			for ( var i = 0; i < buffer_size; i++ ){ 
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
					count++;
					//insertRow({lat:data[0], lng:data[1], el:data[2]}, function(){});
					//fs.appendFileSync('./log.txt',data[0]+':'+data[1]+':'+data[2]+'\n');
					portion = [];
					data = [];
				}	
			}
			position += buffer_size;
			if ( first ){
				first = false;
			}else{
				util.print('\b\b\b\b\b\b');
			}
			util.print((position/file_size * 100).toFixed(3)+'%');
			
		}
		fs.closeSync(fd);
		console.log('rows: '+count);
	});
	
}

loadFileToDb('ETOPO1_Ice_g_int.xyz', 1048576);


