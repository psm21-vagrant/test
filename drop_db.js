/**удаление файла базы sqlite**/
var fs = require('fs');
var filename = process.argv[2];
if ( filename == undefined ){
	console.log('db_file not defined; Usage: drop_db <db_file>');
	process.exit(0);
}

if ( fs.existsSync(filename) ) fs.unlinkSync(filename);