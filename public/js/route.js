/*������ ��� ��������� ��������*/
var Route =
{
	service: 'spatialite', /*��������� ��������: 'osrm','google','spatialite'*/
    
    /**��������� �������� � ��������� ��������
    * @param start, end ����� ������ � ����� ����, �������������� ��� ������� [lat,lng]
    * @param callback ������ � ������� ���������� ������� � ���� ������� ����� � ������ �����
    **/
	/*������ directionsService*/
    directionsService: new google.maps.DirectionsService(),
	
    getRoute: function(start,end,callback){
        if ( Route.service == 'google' ){
            Route.getRouteGoogle(start,end,callback);
        }else if ( Route.service == 'spatialite'  ){
            Route.getRouteSpatialite(start,end,callback);
        }else if ( Route.service == 'osrm' ){
            Route.getRouteOSRM(start,end,callback);
        }else if ( Route.service == 'spatialite2' ){
            Route.getRouteSpatialite2(start,end,callback);
        }       
        else{
            Route.getRouteSpatialite(start,end,callback);
        }
    },
    
    /**��������� �������� � ������� ��������� Google ����� JS API
    * @param start, end ����� ������ � ����� ����, �������������� ��� ������� [lat,lng]
    * @param callback ������ � ������� ���������� ������� � ���� ������� ����� � ������ �����
    **/
	getRouteGoogle: function(start,end,callback){
		var start = new google.maps.LatLng(start[0], start[1]);
		var end = new google.maps.LatLng(end[0], end[1]);
		var request = {
					  origin: start,
					  destination: end,
					  //������� ������� �����
					  //waypoints: [{location: new google.maps.LatLng(56.64,47.82 ), stopover: false}],
					  travelMode: google.maps.TravelMode.DRIVING
					};
		Route.directionsService.route(request, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				var points = response.routes[0].overview_path;
                var route = [];
    			for ( var i = 0; i < points.length; i++ ){
    				route.push([points[i]['k'],points[i]['B']]);
    			}
                callback(route);
			}
		});
	},
    
    
    /**
    * ��������� �������� �� ������ Spatialite
    * @param start, end ����� ������ � ����� ����, �������������� ��� ������� [lat,lng]
    * @param callback ������� ��������� ������ � ������� ���������� ������� � ������ �����
    **/
    
    getRouteSpatialite: function(start,end,callback){
		var start = [start[0], start[1]];
		var end = [end[0], end[1]];
		var params = 'data=' + JSON.stringify([start,end]);
		console.log(params);
		Ajax.sendRequest('GET', '/route', params, function(route) {
			//console.log(JSON.stringify(route));
            callback(route);
		});
	},
    
    /**
    * ��������� �������� �� ������ OSRM
    * @param start, end ����� ������ � ����� ����, �������������� ��� ������� [lat,lng]
    * @param callback ������� ��������� ������ � ������� ���������� ������� � ������ �����
    **/
    
    getRouteOSRM: function(start,end,callback){
		var start = [start[0], start[1]];
		var end = [end[0], end[1]];
		var params = 'data=' + JSON.stringify([start,end]);
		Ajax.sendRequest('POST', '/osrmroute', params, function(route) {
			console.log(JSON.stringify(route));
            callback(route);
		});
	},
    
    /**
    * ��������� �������� �� ������ spatialite2
    * @param start, end ����� ������ � ����� ����, �������������� ��� ������� [lat,lng]
    * @param callback ������� ��������� ������ � ������� ���������� ������� � ������ �����
    **/
    
    getRouteSpatialite2: function(e,regiment,callback){
		var start = [regiment.marker.type.getLatLng().lat, regiment.marker.type.getLatLng().lng];
		var end = [e.latlng.lat, e.latlng.lng];
		var params = 'data=' + JSON.stringify([start,end]);
		Ajax.sendRequest('POST', '/route2', params, function(route) {
			console.log(JSON.stringify(route));
            callback(route,regiment);
		});
	},
    

}