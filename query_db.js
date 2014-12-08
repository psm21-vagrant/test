var elevation = require('./elevation');
var time = require('./time');

var argv = process.argv;
if ( argv.length < 3 ){
	console.log('not find argument: sql');
}else{ 
	var sql = argv[2];
	time.start();
	elevation.query_exec(sql, function(res){
		console.log('Executing time: '+time.stop());
		console.log(JSON.stringify(res));
	});
} 