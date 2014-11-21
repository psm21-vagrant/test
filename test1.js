/*
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('RU-ME.sqlite');
*/
/*
db.serialize(function() {
  db.run("CREATE TABLE lorem (info TEXT)");

  var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  for (var i = 0; i < 10; i++) {
      stmt.run("Ipsum " + i);
  }
  stmt.finalize();

  db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
      console.log(row.id + ": " + row.info);
  });
});

*/
/*
var sql = "SELECT * FROM roads LIMIT 10";
db.each( sql, function(err, row) {
      console.log(row.name + ": " + row.geometry);
  });

db.close();
*/
/*
var prev = 0;
for ( var i = 0; i < 20; prev = i, i++ ){
	console.log(i+':'+prev);
}

*/
console.log(Math.abs(-12));