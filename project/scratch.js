
function initializeMap() {
	var mapOptions = {
		center: {lat: 39.8282, lng: -98.5795},
		zoom: 6,
	}
	var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions)
}

google.maps.event.addDomListener(window, 'load', initializeMap)


