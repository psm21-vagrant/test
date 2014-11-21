var sqlite = require('spatialite');
var db = new sqlite.Database('RU-ME.sqlite');

//var sql = "SELECT AsGeoJSON(ST_MakeValid(Centroid(GeomFromText('POLYGON ((30 10, 10 20, 20 40, 40 40, 30 10))')))) AS geojson;";
var sql = "SELECT AsGeoJSON(geometry) AS geometry FROM roads_net WHERE NodeFrom=23513 AND NodeTo=22036 AND NodeTo NOT IN (23014,22960,22883,23448,23206) AND NodeFROM NOT IN (23014,22960,22883,23448,23206) LIMIT 1;"
db.spatialite(function(err) {
  db.each(sql, function(err, row) {
    
	var obj = JSON.parse(row.geometry);
	console.log(obj.coordinates);
  });
});
