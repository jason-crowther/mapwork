document.addEventListener('DOMContentLoaded', () => {
	const searchInput = document.querySelector('[data-role="location-search-input"]');
	const searchBtn = document.querySelector('[data-role="location-search-button"]');
	const searchSuggestions = document.querySelector('[data-role="location-suggestions"]');
	let marker;

	const map = L.map('mapContainer').setView([-33.9249, 18.4241], 13);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);


	function onMapClick(e) {
		// Remove any existing marker from the map
		if (marker) { 
        	map.removeLayer(marker); 
    	}
		// Add the new marker
	    marker = new L.Marker(e.latlng);
	    marker.addTo(map);
	    // recenter the map
	    map.setView(e.latlng);
	    
	    // Reverse geocode to get the address
	    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json`)
	    .then((response) => response.json())
	    .then(data => {
	    	// Log the address
	    	console.log('This address is: ', data.display_name)
	    });
	}

	// map click event
	map.on('click', onMapClick);

	// search button event
	searchBtn.addEventListener('click', () => {

		// empty any existing location suggestions
		while(searchSuggestions.firstChild){
			searchSuggestions.removeChild(searchSuggestions.firstChild);
		}

		// Search for the address
		fetch(`https://nominatim.openstreetmap.org/search?q=${searchInput.value}&format=json`)
		    .then((response) => response.json())
		    .then(data => {
		    	console.log(data);
		    	if(data.length > 0){
		    		// Add the suggestions to the display
		    		data.forEach(location => {
		    			const template = document.createElement('template');

		    			template.innerHTML = `<p data-lat="${location.lat}" data-lng="${location.lon}">${location.display_name}</p>`;

						searchSuggestions.append(template.content);
		    		})

		    		searchSuggestions.style.display = 'block';

		    		// add click event for each suggestion
		    		searchSuggestions.querySelectorAll('p').forEach(suggestion => {
		    			suggestion.addEventListener('click', () => {
		    				// Remove any existing marker from the map
							if (marker) { 
					        	map.removeLayer(marker); 
					    	}
							// Add the new marker
						    marker = new L.Marker({lat: suggestion.getAttribute('data-lat'), lng: suggestion.getAttribute('data-lng')});
						    marker.addTo(map);
						    // center the map
						    map.setView({lat: suggestion.getAttribute('data-lat'), lng: suggestion.getAttribute('data-lng')});

						    // remove suggestions
						    while(searchSuggestions.firstChild){
				                searchSuggestions.removeChild(searchSuggestions.firstChild);
				            }

				            searchSuggestions.style.display = 'none';
		    			});
		    		})
		    	}

		    });
		});

});