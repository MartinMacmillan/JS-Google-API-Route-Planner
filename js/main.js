(function ($, window, document, undefined) {
	'use strict';
	var form,
		start,
		destination,
		errors,
		mapObject,
		mapOptions,
		geocodeService,
		directionsDisplay,
		directionsService,
		LatLngStart,
		LatLngDestination,
		defaults = {
			startLat: 52.23324789999999,
			startLong: -0.8809271999999737 
		};

	function validateForm() {
		$(start).removeClass('invalid');
		$(destination).removeClass('invalid');

		if (start.value === '') {
			$(start).addClass('invalid');
		} else if (destination.value === '') {
			$(destination).addClass('invalid');
		} else {
			initGeocodeAPI();
		}
	}

	function setupDOM() {
		form = document.getElementById('calculate-route');
		start = document.getElementById('from');
		destination = document.getElementById('to');
		errors = document.getElementById('errors');

		if (window.addEventListener) {
			form.addEventListener('submit', function (e) {
				e.preventDefault();
				validateForm();
			}, true);
		}
	}

	function initMapAPI() {
		mapOptions = {
			zoom: 10,
			center: new google.maps.LatLng(defaults.startLat, defaults.startLong),
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		mapObject = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	}

	function initGeocodeAPI() {
		geocodeService = new google.maps.Geocoder();

		geocodeResult();
	}

	function geocodeResult() {
		var checkingData;

		geocodeService.geocode( { 'address': start.value }, function (results, status) {
		    if (status === google.maps.GeocoderStatus.OK) {
		    	mapObject.setCenter(results[0].geometry.location);
		    	
		        LatLngStart = results[0].geometry.location;
		    } else {
		    	window.alert('Geocode was not successful for the following reason: ' + status);
		    }
	  	});

	  	geocodeService.geocode({ 'address': destination.value }, function (results, status) {
	  		if (status === google.maps.GeocoderStatus.OK) {
	  			LatLngDestination = results[0].geometry.location;
	  		} else {
		    	window.alert('Geocode was not successful for the following reason: ' + status);
		    }
	  	});

	  	function checkData() {
		  	if (LatLngStart !== undefined && LatLngDestination !== undefined) {
		  		window.clearInterval(checkingData);
		  		initDirectionsAPI();
		  	}
	  	}

	  	checkingData = window.setInterval(checkData, 250);
	}

	function initDirectionsAPI() {
		directionsService = new google.maps.DirectionsService();
		directionsDisplay = new google.maps.DirectionsRenderer();

		directionsDisplay.setMap(mapObject);
  		directionsDisplay.setPanel(document.getElementById('directions-panel'));

  		calculateRoute();
	}

	function calculateRoute() {
		var panel = document.getElementById('directions-panel'),
			request;

		if (panel !== null) {
			panel.innerHTML = '';
		}

		request = {
			origin: LatLngStart,
			destination: LatLngDestination,
			travelMode: google.maps.TravelMode.DRIVING
		};

		directionsService.route(request, function (response, status) {
			if (status === google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(response);
			} else {
				window.alert('Error with directions service. ' + response);
			}
		});
	}

	function initialize() {
		setupDOM();
		initMapAPI();
	}
	
	$(document).ready(function () {
		if (typeof navigator.geolocation === 'undefined') {
			errors.text('Your browser doesn\'t the Geolocaions API');
			return false;
		}
		google.maps.event.addDomListener(window, 'load', initialize);
	});
}(jQuery, window, window.document));