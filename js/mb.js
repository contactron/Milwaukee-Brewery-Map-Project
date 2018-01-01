var map = null;
var largeInfowindow = "";
var iwcontent = [];
// Model Section
var model = {
  // JSON data for breweries
  // includes Lat/Lng for Google Map call
  // includes yelpid for Yelp api call

  initialBreweries: [
    {
        breweryName: "Big Head Brewing Co.",
        location: {lat: 43.044613, lng: -87.990269},
        yelpid: "big-head-brewing-wauwatosa-2",
        breweryid: 0
    },
    {
        breweryName: "Brenner Brewing Co.",
        location: {lat: 43.023950, lng: -87.916604},
        yelpid: "brenner-brewing-co-milwaukee-3",
        breweryid: 1
    },
    {
        breweryName: "Good City Brewing",
        location: {lat: 43.057820, lng: -87.887510},
        yelpid: "good-city-brewing-milwaukee",
        breweryid: 2
    },
    {
        breweryName: "Lakefront Brewery",
        location: {lat: 43.054726, lng: -87.905287},
        yelpid: "lakefront-brewery-milwaukee",
        breweryid: 3
    },
    {
        breweryName: "Milwaukee Brewing Company",
        location: {lat: 43.024902, lng: -87.913027},
        yelpid: "milwaukee-brewing-company-milwaukee",
        breweryid: 4
    },
    {
        breweryName: "Mob Craft Brewery",
        location: {lat: 43.026082, lng: -87.917236},
        yelpid: "mobcraft-beer-milwaukee",
        breweryid: 5
    },
    {
        breweryName: "Sprecher Brewing Co.",
        location: {lat: 43.099650, lng: -87.919663},
        yelpid: "sprecher-brewing-company-milwaukee",
        breweryid: 6
    },
    {
        breweryName: "Third Space Brewing",
        location: {lat: 43.03437, lng: -87.932197},
        yelpid: "third-space-brewing-milwaukee",
        breweryid: 7
    },
    {
        breweryName: "Black Husky Brewing",
        location: {lat: 43.0710951, lng: -87.9002127},
        yelpid: "black-husky-brewing-milwaukee",
        breweryid: 8
    },
    {
        breweryName: "Great Lakes Distillery",
        location: {lat: 43.026675, lng: -87.918649},
        yelpid: "great-lakes-distillery-milwaukee",
        breweryid: 9
    }
  ]
};

// View model

var viewmodel = function(){

  self = this;
  // Array to hold map markers
  self.markers= [];
  // KO array to hold the list of breweries
  self.breweryList= ko.observableArray([]);
  // KO variable to hold filter value for text type-ahead
  self.filterKeyword = ko.observable('');

  self.initModel = function() {
    // Populate the KO array of breweries from the JSON
    for(var i=0; i < model.initialBreweries.length; i++){
      self.breweryList().push(model.initialBreweries[i]);
    }
  };

// Slideout menu functions
  self.openNav = function() {
    document.getElementById("mySidenav").style.width = "250px";
  };

  self.closeNav = function() {
      document.getElementById("mySidenav").style.width = "0";
  };

  // Create the map.
  self.initMap = function() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
      // Milwaukee lat lngs for initial map
      center: {lat: 43.038902, lng: -87.906471},
      zoom: 13,
      mapTypeControl: false
    });
    // Have the map center and resize when the window is resized.
    google.maps.event.addDomListener(window, "resize", function() {
     var center = map.getCenter();
     google.maps.event.trigger(map, "resize");
     map.setCenter(center);
    });
    // Creat infowindow to be applied to markers
    largeInfowindow = new google.maps.InfoWindow();

    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = vm.makeMarkerIcon('0091ff');

    // Create a highlighted marker color for when the user mouses over the marker.
    var highlightedIcon = vm.makeMarkerIcon('FFFF24');

    // Create markers for breweries
    for (var i = 0; i < vm.breweryList().length; i++) {
      // Get the position from the location array.
      var position = vm.breweryList()[i].location;
      var title = vm.breweryList()[i].breweryName;
      var yelpid = vm.breweryList()[i].yelpid;
      //Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
        id: i,
        yelpid: yelpid
      });

      // Create an onclick event to open the large infowindow for each marker.
      marker.addListener('click', function() {
        vm.populateInfoWindow(this, largeInfowindow);
      });
      // Add two event listeners to the markers to highlight markers on rollover
      marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
      });
      marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
      });
      // Push the marker to our array of markers.
      vm.markers.push(marker);
    }
    // Call the showMarkers function to display the markers on the map
    vm.showMarkers();
  };

  // Filter the list using the input value. Create a KO array to hold the filtered list
  self.filteredBreweryList = ko.computed(function(){
    // If no value is entered default to the full list
    if (self.filterKeyword().length === 0) {
      return self.breweryList();
    // Otherwise, filter the list
    } else {
      var filteredList = self.breweryList().filter(function(brewery) {
        return (brewery.breweryName.toLowerCase().indexOf(self.filterKeyword().toLowerCase())>-1);
      });
      return filteredList;
    }
  });

  // This function takes in a COLOR, and then creates a new marker
  // icon of that color.
  self.makeMarkerIcon=function(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21,34));
    return markerImage;
  };

  // Display the markers. Use the filteredBreweryList to keep markers in sync with the list
  self.showMarkers = function() {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < self.filteredBreweryList().length; i++) {
      // Get the breweryid for each brewery as this matches the markerid
      breweryid = self.filteredBreweryList()[i].breweryid;
      self.markers[breweryid].setMap(map);
      // Determine the new bounds of the map based on the current set of markers
      bounds.extend(self.markers[breweryid].position);
    }
    // Redisplay the map/markers zoomed based on the bounds
    map.fitBounds(bounds);
  };

  // Make the marker bounce, wait 1.5 sec and stop the bounce
  self.animateMarker = function(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){ marker.setAnimation(null); }, 1500);
  };

  // When a brewery is clicked in the list get its marker based on
  // the breweryid and call the populateInfoWindow.
  self.listpopulatesInfoWindow = function(data) {
    var marker = self.markers[data.breweryid];
    vm.populateInfoWindow(marker, largeInfowindow);
  };

  // Toggle between the main content and secondary content when clicking view more/less
  self.toggleInfoWindowContents = function(newcontent, infoWindow) {
    $(".infobox").fadeOut(250, function() {
      infoWindow.setContent(newcontent);
      $(".infobox").fadeIn(250);
      });
  };

  // Populate the infowindow when the marker is clicked
  // or when a brewery is clicked in the list.
  self.populateInfoWindow = function(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });

      // Make call to Yelp to get business info
      var yelpInfo = function() {
        // Setup for authentication
        var cors_anywhere_url = 'https://cors-anywhere.herokuapp.com/';
        var yelp_auth_url = cors_anywhere_url + "https://api.yelp.com/oauth2/token";
        // Yelp key
        var bearerToken = 'wd9ppcEop7IrcIlrunswsXspkD4DV0XczDE3CEROUQHEasc26pnMhxBn253Vpcsr0ilhGGQHGyVC2xVowzVdTTwoUHFbYj8CC5usRh7Ud2YvxJahU7mbegbIppQuWnYx';
        //Setup for call to get business info
        var yelpbase_url = cors_anywhere_url + 'https://api.yelp.com/v3/businesses/';
        var business = marker.yelpid;
        var yelp_url = yelpbase_url + business;
        // Ajax call
        $.ajax({
          url: yelp_url,
          beforeSend: function(xhr){
            xhr.setRequestHeader('Authorization', 'Bearer '+ bearerToken);
          },
          // Populate info window with business name and image
          }).done(function(response){
            // Build content for initial infobox
            iwcontent[0] = '<div class="infobox"><span class="infotitle">' + marker.title + '</span><div class="otherinfo"><img class="infopicture" src="' + response.image_url + '"></div><span class="infobutton" onclick="vm.toggleInfoWindowContents(iwcontent[1],largeInfowindow)">More Info</span></div>'
            // Build content for more infobox
            // Create url for correct star review image
            var ystars = 'small_' + response.rating;
            ystars = ystars.replace(".", "") + '.png';
            // Build the address to display
            var yaddressphone = response.location.display_address[0] + '<br>' + response.location.display_address[1] + '<br>' + response.display_phone;
            // Build full content for moreinfobox
            iwcontent[1] = '<div class="infobox"><span class="infotitle">' + marker.title + '</span><div class="otherinfo"><img class="inforating" src="img/yelpstars/' + ystars + '"><address>' + yaddressphone + '</address><a class="bizurl" href="' + response.url + '">website</a></div><span class="infobutton" onclick="vm.toggleInfoWindowContents(iwcontent[0],largeInfowindow)">Less Info</span></div>';
            infowindow.setContent(iwcontent[0]);
          }).fail(function(error, textStatus, errorThrown){
            // Display error message if yelp call fails.
            infowindow.setContent('<div> Sorry, Yelp! appears to be down.</div>');
        });
      };

      // Make the marker bounce onclick
      vm.animateMarker(marker);
      // Load the infowindow content with a spinner until Yelp returns data
      infowindow.setContent('<div class="infobox"><div class="otherinfo"><img src="img/loading_spinner.gif" class="spinner"></div></div>');
      // Make call to Yelp for business name and image
      yelpInfo();
      // Open the infowindow for the marker
      infowindow.open(map, marker);
    }
  };

};

// Get this thing started!
var vm = new viewmodel();
vm.initModel();
ko.applyBindings(vm);

