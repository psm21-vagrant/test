/**������ ��� ��������� ��������**/
var Route =
{
	/** ��������� ��������: 'osrm','google','spatialite_query','spatialite_dijkstra',
	* 'spatialite_dijkstra3','spatialite_dijkstra_enemy','routebypassingwide'
	**/
	service: 'spatialite_query', 
    
	/**������ directionsService**/
    directionsService: new google.maps.DirectionsService(),
	
	/**��������� �������� � ��������� ��������
    * @param start, end ����� ������ � ����� ����, �������������� ��� ������� [lat,lng]
    * @param callback ������ � ������� ���������� ������� � ���� ������� ����� � ������ �����
    **/
    getRoute: function(start,end,enemies,callback){
        if ( Route.service == 'google' ){
            Route.getRouteGoogle(start,end,callback);
        }else if ( Route.service == 'spatialite_query'  ){
            Route.getRouteSpatialiteQuery(start,end,callback);
        }else if ( Route.service == 'osrm' ){
            Route.getRouteOSRM(start,end,callback);
        }else if ( Route.service == 'spatialite_dijkstra' ){
            Route.getRouteSpatialiteDijkstra(start,end,callback);
        }else if ( Route.service == 'spatialite_dijkstra3' ){
            Route.getRouteSpatialiteDijkstra3(start,end,callback);
        }else if( Route.service == 'spatialite_dijkstra_enemy' ){
			Route.getRouteSpatialiteDijkstraEnemy(start,end,enemies,callback);
		}else if( Route.service == 'spatialite_routebypassingwide' ){
			Route.getRouteSpatialitebypassingWide(start,end,callback);
		}else{
            Route.getRouteSpatialiteQuery(start,end,callback);
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
    * ��������� �������� �� ������ OSRM
    * @param start, end ����� ������ � ����� ����, �������������� ��� ������� [lat,lng]
    * @param callback ������� ��������� ������ � ������� ���������� ������� � ������ �����
    **/
    
    getRouteOSRM: function(start,end,callback){
		var start = [start[0], start[1]];
		var end = [end[0], end[1]];
		var params = 'data=' + JSON.stringify([start,end]);
		Ajax.sendRequest('GET', '/routeosrm', params, function(route) {
			console.log(JSON.stringify(route));
            callback(route);
		});
	},
    
    
    /**
    * ��������� �������� �� ������ Spatialite ����� routeQuery
    * @param start, end ����� ������ � ����� ����, �������������� ��� ������� [lat,lng]
    * @param callback ������� ��������� ������ � ������� ���������� ������� � ������ �����
    **/
    
    getRouteSpatialiteQuery: function(start,end,callback){
		var start = [start[0], start[1]];
		var end = [end[0], end[1]];
		var params = 'data=' + JSON.stringify([start,end]);
		console.log(params);
		Ajax.sendRequest('GET', '/routequery', params, function(route) {
			//console.log(JSON.stringify(route));
            callback(route);
		});
	},
    
    /**
    * ��������� �������� �� ������ Spatialite ����� routeDijkstra
    * @param start, end ����� ������ � ����� ����, �������������� ��� ������� [lat,lng]
    * @param callback ������� ��������� ������ � ������� ���������� ������� � ������ �����
    **/
    
    getRouteSpatialiteDijkstra: function(start,end,callback){
		var start = [start[0], start[1]];
		var end = [end[0], end[1]];
		var params = 'data=' + JSON.stringify([start,end]);
		console.log(params);
		Ajax.sendRequest('GET', '/routedijkstra', params, function(route) {
			//console.log(JSON.stringify(route));
            callback(route);
		});
	},
	
	/**
    * ��������� �������� ������� ������� ��� ���� ���������� �� ������ Spatialite ����� routeDijkstraEnemy 
    * @param start, end ����� ������ � ����� ����, �������������� ��� ������� [lat,lng]
    * @param callback ������� ��������� ������ � ������� ���������� ������� � ������ �����
    **/
    
    getRouteSpatialiteDijkstraEnemy: function(start,end,enemies,callback){
		console.log(enemies);
		var start = [start[0], start[1]];
		var end = [end[0], end[1]];
		var params = 'data=' + JSON.stringify([start,end])+'&enemy='+JSON.stringify(enemies);
		console.log(params);
		Ajax.sendRequest('GET', '/routedijkstraenemy', params, function(route) {
			//console.log(JSON.stringify(route));
            callback(route);
		});
	},
	
	/**
    * ��������� �������� �� ������ Spatialite ����� bypassingWide'
    * @param start, end ����� ������ � ����� ����, �������������� ��� ������� [lat,lng]
    * @param callback ������� ��������� ������ � ������� ���������� ������� � ������ �����
    **/
    
    getRouteSpatialitebypassingWide: function(start,end,callback){
		console.log(enemies);
		var start = [start[0], start[1]];
		var end = [end[0], end[1]];
		var params = 'data=' + JSON.stringify([start,end]);
		console.log(params);
		Ajax.sendRequest('GET', '/routebypassingwide', params, function(route) {
			//console.log(JSON.stringify(route));
            callback(route);
		});
	},
	
	
	/**
    * ��������� �������� �� ������ Spatialite ����� routeDijkstra3
    * @param start, end ����� ������ � ����� ����, �������������� ��� ������� [lat,lng]
    * @param callback ������� ��������� ������ � ������� ���������� ������� � ������ �����
    **/
    
    getRouteSpatialiteDijkstra3: function(start,end,callback){
		var start = [start[0], start[1]];
		var end = [end[0], end[1]];
		var params = 'data=' + JSON.stringify([start,end]);
		console.log(params);
		Ajax.sendRequest('GET', '/routedijkstra3', params, function(route) {
			//console.log(JSON.stringify(route));
            callback(route);
		});
	}
    
}