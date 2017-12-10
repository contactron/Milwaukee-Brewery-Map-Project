// Model Section
var model = {
  // Set the current list of breweries to null
  currentBreweryList: [],
  // JSON data for breweries
  initialBreweries: [
    {
        breweryName: 'Big Head Brewing Co.',
        location: {lat: 43.044613, lng: -87.990269},
        placeid: 'ChIJGQGhIx8bBYgRKKgwMcNyCqE',
        beer_id: "BeerID",
        visible: true
    },
    {
        breweryName: 'Brenner Brewing Co.',
        location: {lat: 43.023950, lng: -87.916604},
        placeid: 'ChIJaXyDNJQZBYgRvh2nJNFu0wA',
        beerid: 'BeerID',
        visible: true
    },
    {
        breweryName: 'Water Street Brewery',
        location: {lat: 43.044783, lng: -87.911197},
        placeid: 'ChIJH3PwhwwZBYgRCTpXjHjAuAo',
        beerid: 'BeerID',
        visible: true
    },
    {
        breweryName: 'Lakefront Brewery',
        location: {lat: 43.054726, lng: -87.905287},
        placeid: 'ChIJkWA1FRcZBYgR7F7GEpN_rno',
        beerid: 'BeerID',
        visible: true
    },
    {
        breweryName: 'Milwaukee Brewing Company',
        location: {lat: 43.024902, lng: -87.913027},
        placeid: 'ChIJj3pG4L0ZBYgRo0K6RMvwvYU',
        beerid: 'BeerID',
        visible: true
    },
    {
        breweryName: 'Mob Craft Brewery',
        location: {lat: 43.026082, lng: -87.917236},
        placeid: 'ChIJlwhWk5YZBYgRFnUdoyba-_Q',
        beerid: 'BeerID',
        visible: true
    },
    {
        breweryName: 'Sprecher Brewing Co.',
        location: {lat: 43.099650, lng: -87.919663},
        placeid: 'ChIJeVHsipYeBYgR4WMnS3-jVN4',
        beerid: 'BeerID',
        visible: true
    }
  ],

// Brewery Constructor - takes brewery json and creates object with ko observables
  Brewery: function (data) {
    this.breweryName = ko.observable(data.breweryName);
    this.placeid = ko.observable(data.placeid);
    this.beerid = ko.observable(data.beerid);
    this.visible = ko.observable(data.visible);
  }
};


// View model

var viewmodel = {

  init: function() {
    // Use constructor to build brewery list
    var self = this;
    // Create array of breweries instances. Uses the initialBreweries json and
    // Brewery constructor to create
    this.breweryList = ko.observableArray([]);
    model.initialBreweries.forEach(function(breweryItem) {
      self.breweryList.push(new model.Brewery(breweryItem));
      });
    // Need to add an unclicked state. No brewery selected.
    // this.currentBrewery = ko.observable(this.breweryList()[0]);
    // this.changeBrewery = function (clickedBrewery) {
    //   self.currentCat(clickedcat);
    // };
  }
}


// Google Map Section

var map;

// Create a new blank array for all the listing markers.
var markers = [];

// Create placemarkers array to use in multiple functions to have control
// over the number of places that show.
var placeMarkers = [];

function initMap() {

    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
      // Milwaukee lat lngs
      center: {lat: 43.038902, lng: -87.906471},
      zoom: 13,
      mapTypeControl: false
    });

var largeInfowindow = new google.maps.InfoWindow();

// Style the markers a bit. This will be our listing marker icon.
var defaultIcon = makeMarkerIcon('0091ff');

// Create a "highlighted location" marker color for when the user
// mouses over the marker.
var highlightedIcon = makeMarkerIcon('FFFF24');

// Create markers for breweries
for (var i = 0; i < model.initialBreweries.length; i++) {
  // Get the position from the location array.
  var position = model.initialBreweries[i].location;
  var title = model.initialBreweries[i].breweryName;
  // Create a marker per location, and put into markers array.
  var marker = new google.maps.Marker({
    position: position,
    title: title,
    animation: google.maps.Animation.DROP,
    icon: defaultIcon,
    id: i
  });


  // Push the marker to our array of markers.
  markers.push(marker);
  // Create an onclick event to open the large infowindow at each marker.
  marker.addListener('click', function() {
    populateInfoWindow(this, largeInfowindow);
  });
  // Two event listeners - one for mouseover, one for mouseout,
  // to change the colors back and forth.
  marker.addListener('mouseover', function() {
    this.setIcon(highlightedIcon);
  });
  marker.addListener('mouseout', function() {
    this.setIcon(defaultIcon);
  });
}
document.getElementById('show-listings').addEventListener('click', showListings);

}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
// Check to make sure the infowindow is not already opened on this marker.
if (infowindow.marker != marker) {
  // Clear the infowindow content to give the streetview time to load.
  infowindow.setContent('');
  infowindow.marker = marker;
  // Make sure the marker property is cleared if the infowindow is closed.
  infowindow.addListener('closeclick', function() {
    infowindow.marker = null;
  });
  var streetViewService = new google.maps.StreetViewService();
  var radius = 50;
  // In case the status is OK, which means the pano was found, compute the
  // position of the streetview image, then calculate the heading, then get a
  // panorama from that and set the options
  function getStreetView(data, status) {
    if (status == google.maps.StreetViewStatus.OK) {
      var nearStreetViewLocation = data.location.latLng;
      var heading = google.maps.geometry.spherical.computeHeading(
        nearStreetViewLocation, marker.position);
        infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
        var panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 30
          }
        };
      var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), panoramaOptions);
    } else {
      infowindow.setContent('<div>' + marker.title + '</div>' +
        '<div>No Street View Found</div>');
    }
  }
  // Use streetview service to get the closest streetview image within
  // 50 meters of the markers position
  streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
  // Open the infowindow on the correct marker.
  infowindow.open(map, marker);
}
}

// This function will loop through the markers array and display them all.
function showListings() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

// This function will loop through the listings and hide them all.
function hideMarkers(markers) {
for (var i = 0; i < markers.length; i++) {
  markers[i].setMap(null);
}
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
var markerImage = new google.maps.MarkerImage(
  'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
  '|40|_|%E2%80%A2',
  new google.maps.Size(21, 34),
  new google.maps.Point(0, 0),
  new google.maps.Point(10, 34),
  new google.maps.Size(21,34));
return markerImage;
}


// This function creates markers for each place found in either places search.
function createMarkersForPlaces(places) {
var bounds = new google.maps.LatLngBounds();
for (var i = 0; i < places.length; i++) {
  var place = places[i];
  var icon = {
    url: place.icon,
    size: new google.maps.Size(35, 35),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(15, 34),
    scaledSize: new google.maps.Size(25, 25)
  };
  // Create a marker for each place.
  var marker = new google.maps.Marker({
    map: map,
    icon: icon,
    title: place.name,
    position: place.geometry.location,
    id: place.place_id
  });
  // Create a single infowindow to be used with the place details information
  // so that only one is open at once.
  var placeInfoWindow = new google.maps.InfoWindow();
  // If a marker is clicked, do a place details search on it in the next function.
  marker.addListener('click', function() {
    if (placeInfoWindow.marker == this) {
      console.log("This infowindow already is on this marker!");
    } else {
      getPlacesDetails(this, placeInfoWindow);
    }
  });
  placeMarkers.push(marker);
  if (place.geometry.viewport) {
    // Only geocodes have viewport.
    bounds.union(place.geometry.viewport);
  } else {
    bounds.extend(place.geometry.location);
  }
}
map.fitBounds(bounds);
}

ko.applyBindings(new viewmodel.init());