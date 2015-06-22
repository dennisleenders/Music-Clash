
// LiveWall: 51.558291999999994 - 5.0905039

// Lat & Long settings
var setLocationLatitude = 51.558291999999994;
var setLocationLongitude = 5.0905039;

// Min - Max values
var setLocationLatitudeMax = setLocationLatitude + 0.0002;
var setLocationLatitudeMin = setLocationLatitude - 0.0002;
var setLocationLongitudeMax = setLocationLongitude + 0.0002;
var setLocationLongitudeMin = setLocationLongitude - 0.0002;

function checkGeolocation() {
  if (!navigator.geolocation){
    return;
  }

  function success(position) {
    var userLatitude  = position.coords.latitude;
    var userLongitude = position.coords.longitude;

    if(userLatitude <= setLocationLatitudeMax && userLatitude >= setLocationLatitudeMin ){
      console.log("Latitude in range")
    } else{
      $('.gps-tracker').show();
    }

    if(userLongitude <= setLocationLongitudeMax && userLongitude >= setLocationLongitudeMin ){
      console.log("Longitude in range")
    } else{
     $('.gps-tracker').show();
    }
  };

  function error() {
    console.log('error');
  };
  navigator.geolocation.getCurrentPosition(success, error);
}

// checkGeolocation()