/*объект для получения маршрута*/
var Route =
{
	service: 'spatialite', /*возможные варианты: 'osrm','google','spatialite'*/
    
    /**получение маршрута с различных сервисов
    * @param start, end точки начала и конца пути, представленные как массивы [lat,lng]
    * @param callback объект в который передается маршрут в виде массива точек и объект полка
    **/
	/*объект directionsService*/
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
    
    /**получение маршрута с сервиса маршрутов Google через JS API
    * @param start, end точки начала и конца пути, представленные как массивы [lat,lng]
    * @param callback объект в который передается маршрут в виде массива точек и объект полка
    **/
	getRouteGoogle: function(start,end,callback){
		var start = new google.maps.LatLng(start[0], start[1]);
		var end = new google.maps.LatLng(end[0], end[1]);
		var request = {
					  origin: start,
					  destination: end,
					  //задание путевой точки
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
    * получение маршрута от модуля Spatialite
    * @param start, end точки начала и конца пути, представленные как массивы [lat,lng]
    * @param callback функция обратного вызова в которую передается маршрут и объект полка
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
    * получение маршрута от модуля OSRM
    * @param start, end точки начала и конца пути, представленные как массивы [lat,lng]
    * @param callback функция обратного вызова в которую передается маршрут и объект полка
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
    * получение маршрута от модуля spatialite2
    * @param start, end точки начала и конца пути, представленные как массивы [lat,lng]
    * @param callback функция обратного вызова в которую передается маршрут и объект полка
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