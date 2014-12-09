/**����� ������� �����**/
var sqlite3 = require('sqlite3');


/**
*����� ������� �����
* @param order ���� ��� ����������
* @param limit ����������� ������
* @param offset �������� � ����� ������ ��������
**/
function printTable(db_file, order, limit, offset){
	var sql = "SELECT * FROM elevation";
	if ( db_file == undefined ){
		console.log('db_file not defined');
		process.exit(0);
	}
	var db = new sqlite3.Database(db_file);
	if ( order != undefined ) sql += " ORDER BY " + order;
	if ( limit != undefined ) sql += " LIMIT " + limit;
	if ( offset != undefined ) sql += " OFFSET " + offset;
	db.all(sql, function(err,rows){
		for ( var i = 0; i < rows.length; i++ ){
			console.log(JSON.stringify(rows[i]));
		}
	});
}

/**
* �������� ���������� ��������� ������
* � ����� printTable
**/
function wrapPrintTable(){
	var argv = process.argv;
	if ( argv.length == 2 ){
		printTable();
	}else if ( argv.length == 3 ){
		if ( argv[2] == '-h' || argv[2] == '--help' ){
			console.log('Usage: node print_table <db_file> <sort_by> <limit offset');
			process.exit(0);
		}
		printTable(argv[2]);
		
	}else if ( argv.length == 4 ){
		printTable(argv[2], argv[3]);
	}else if( argv.length == 5 ){
		printTable(argv[2], argv[3], argv[4]);
	}
	else if ( argv.length > 5 ){
		printTable(argv[2], argv[3], argv[4], argv[5]);
	}
}

wrapPrintTable();