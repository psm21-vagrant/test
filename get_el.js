var elevation = require('./elevation');
var time = require('./time');

var argv = process.argv;
if ( argv.length < 4 ){
	console.log('not find arguments lat, lng');
}else if ( argv[2] < -90 || argv[2] > 90 || argv[3] < -180 || argv[3] > 180 ){
	console.log('not correct arguments lat, lng');
}else{
	var lat = parseFloat(argv[2]);
	var lng = parseFloat(argv[3]);
	time.start();
	elevation.getElevation([lat, lng], function(res){
		console.log('Executing time: '+time.stop());
		console.log(JSON.stringify(res));
	});
} 
