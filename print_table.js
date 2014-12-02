/**����� ������� �����**/
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('el.sqlite');

/**
*����� ������� �����
* @param order ���� ��� ����������
* @param limit ����������� ������
* @param offset �������� � ����� ������ ��������
**/
function printTable(order, limit, offset){
	var sql = "SELECT * FROM elevation";
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
* ������� ���������� ��������� ������
* � ����� printTable
**/
function wrapPrintTable(){
	var argv = process.argv;
	if ( argv.length == 2 ){
		printTable();
	}else if ( argv.length == 3 ){
		if ( argv[2] == '-h' || argv[2] == '--help' ){
			console.log('Usage: node print_table sort_by limit offset');
			return true;
		}
		printTable(argv[2]);
	}else if ( argv.length == 4 ){
		printTable(argv[2], argv[3]);
	}else if ( argv.length > 4 ){
		printTable(argv[2], argv[3], argv[4]);
	}
}

wrapPrintTable();