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
        yelpid: 'big-head-brewing-wauwatosa-2',
        visible: true
    },
    {
        breweryName: 'Brenner Brewing Co.',
        location: {lat: 43.023950, lng: -87.916604},
        placeid: 'ChIJaXyDNJQZBYgRvh2nJNFu0wA',
        yelpid: 'brenner-brewing-co-milwaukee-3',
        visible: true
    },
    {
        breweryName: 'Good City Brewing',
        location: {lat: 43.057820, lng: -87.887510},
        placeid: 'ChIJH3PwhwwZBYgRCTpXjHjAuAo',
        yelpid: 'good-city-brewing-milwaukee',
        visible: true
    },
    {
        breweryName: 'Lakefront Brewery',
        location: {lat: 43.054726, lng: -87.905287},
        placeid: 'ChIJkWA1FRcZBYgR7F7GEpN_rno',
        yelpid: 'lakefront-brewery-milwaukee',
        visible: true
    },
    {
        breweryName: 'Milwaukee Brewing Company',
        location: {lat: 43.024902, lng: -87.913027},
        placeid: 'ChIJj3pG4L0ZBYgRo0K6RMvwvYU',
        yelpid: 'milwaukee-brewing-company-milwaukee',
        visible: true
    },
    {
        breweryName: 'Mob Craft Brewery',
        location: {lat: 43.026082, lng: -87.917236},
        placeid: 'ChIJlwhWk5YZBYgRFnUdoyba-_Q',
        yelpid: 'mobcraft-beer-milwaukee',
        visible: true
    },
    {
        breweryName: 'Sprecher Brewing Co.',
        location: {lat: 43.099650, lng: -87.919663},
        placeid: 'ChIJeVHsipYeBYgR4WMnS3-jVN4',
        yelpid: 'sprecher-brewing-company-milwaukee',
        visible: true
    }
  ],

// Brewery Constructor - takes brewery json and creates object with ko observables
  Brewery: function (data) {
    this.breweryName = ko.observable(data.breweryName);
    this.placeid = ko.observable(data.placeid);
    this.yelpid = ko.observable(data.yelpid);
    this.visible = ko.observable(data.visible);
  }
};


// View model

var viewmodel = {
  map: null,
  markers: [],
  // Create placemarkers array to have control over the number of places that show.
  placeMarkers: [],

  init: function() {
    // Use constructor to build brewery list
    var self = this;
    // Create array of breweries instances. Uses the initialBreweries json and
    // Brewery constructor to create
    this.breweryList = ko.observableArray([]);
    model.initialBreweries.forEach(function(breweryItem) {
      self.breweryList.push(new model.Brewery(breweryItem));
      });
    console.log(self.breweryList());  //works
    console.dir('self = ' + self);
    console.dir('this = ' + this);
  },

  initMap: function() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
      // Milwaukee lat lngs
      center: {lat: 43.038902, lng: -87.906471},
      zoom: 13,
      mapTypeControl: false
    });

    var largeInfowindow = new google.maps.InfoWindow();

    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = this.makeMarkerIcon('0091ff');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = this.makeMarkerIcon('FFFF24');

    // Create markers for breweries
    for (var i = 0; i < model.initialBreweries.length; i++) {
      // Get the position from the location array.
      var position = model.initialBreweries[i].location;
      var title = model.initialBreweries[i].breweryName;
      var yelpid = model.initialBreweries[i].yelpid;
      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
        id: i,
        yelpid: yelpid
      });

      // Push the marker to our array of markers.
      this.markers.push(marker);
      // Create an onclick event to open the large infowindow at each marker.
      marker.addListener('click', function() {
        viewmodel.populateInfoWindow(this, largeInfowindow);
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
    // Call the showlisting functions to display the markers on the map
    this.showListings();

  },

  // This function will loop through the markers array and display them all.
  showListings: function() {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < viewmodel.markers.length; i++) {
      viewmodel.markers[i].setMap(map);
      bounds.extend(viewmodel.markers[i].position);
    }
    map.fitBounds(bounds);
  },

  // THIS  IS IN PROGRESS
  filterListings: function() {
    var input, filtervalue, i;
    input = document.getElementById("searchInput");
    console.log(input);
    filtervalue = input.value.toUpperCase(); //working
    itemcount = this.breweryList().length;  // broken

    for (i = 0; i < itemcount; i++) {
    //   td = tr[i].getElementsByTagName("td")[0];
    //   if (td) {
    //     if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
    //       tr[i].style.display = "";
    //     } else {
    //       tr[i].style.display = "none";
    //     }
    //   }
    }
  },

// Populate the infowindow when the marker is clicked.
  populateInfoWindow: function(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      // Clear the infowindow content to give the streetview time to load.
      infowindow.setContent('');
      infowindow.marker = marker;
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });

      // Make call to yelp to get star rating
      function yelpInfo() {
        var cors_anywhere_url = 'https://cors-anywhere.herokuapp.com/';
        var yelp_auth_url = cors_anywhere_url + "https://api.yelp.com/oauth2/token";
        var bearerToken = 'wd9ppcEop7IrcIlrunswsXspkD4DV0XczDE3CEROUQHEasc26pnMhxBn253Vpcsr0ilhGGQHGyVC2xVowzVdTTwoUHFbYj8CC5usRh7Ud2YvxJahU7mbegbIppQuWnYx';
        var yelpbase_url = cors_anywhere_url + 'https://api.yelp.com/v3/businesses/';
        // var yelp_search_url = cors_anywhere_url + "https://api.yelp.com/v3/businesses/lakefront-brewery-milwaukee";
        var business = marker.yelpid;
        var yelp_url = yelpbase_url + business;
        console.log(yelp_url);
        $.ajax({
          url: yelp_url,
          beforeSend: function(xhr){
    //          xhr.setRequestHeader('Access-Control-Allow-origin', 'true');
              xhr.setRequestHeader('Authorization', 'Bearer '+ bearerToken);
          },
          }).done(function(response){
              infowindow.setContent('<div><span class="infotitle">' + marker.title + '</span><div class="infobox"><img class="infopicture" src="' + response.image_url +'" width="250">');
          }).fail(function(error, textStatus, errorThrown){
            // Display error message if yelp call fails.
            infowindow.setContent('<div> Sorry, Yelp! appears to be down.</div>');
        });
      };
      // infowindow.setContent('<div>' + marker.title + '</div><div> Remove this and do it in the yelp function.</div>');
      infowindow.setContent('<div class="infobox"><img src="img/loading_spinner.gif" class="spinner"></div>');
      yelpInfo();
      infowindow.open(map, marker);
    }
  },

// This function will loop through the listings and hide them all.
  hideMarkers: function(markers) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
  },

  // This function takes in a COLOR, and then creates a new marker
  // icon of that color.
  makeMarkerIcon: function(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21,34));
    return markerImage;
  }
}

// Get this thing started!
ko.applyBindings(new viewmodel.init());
