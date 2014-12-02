/**удаление файла базы sqlite**/
var fs = require('fs');
var filename = 'el.sqlite';

if ( fs.existsSync(filename) ) fs.unlinkSync(filename);