//*************************************************************//
//  name: Class - Helpers                                      //
//  desc: These functions will help interaction with spotify   //
//        or audio                                             //
//*************************************************************//

MC.Helpers = {
  audioEl: $('.audio'),
  ctx: new webkitAudioContext(),

  // play any playlist tracks given to this function
  PlayTrack: function(trackSrc){
    MC.Helpers.audioEl[0].src = trackSrc;
    MC.Helpers.audioEl[0].play();
    MC.Helpers.audioEl[0].loop = true;
  },

  // Gets the tracks from the requested playlist and pushes them in a callback function
  SetTracks: function(tracks){
    var allTracksArray = [];
    for(i=0;i < tracks.length;i++){
      var obj = {
        url: tracks[i].track.preview_url,
        name: tracks[i].track.name,
        artist:tracks[i].track.artists[0].name
      }
      allTracksArray.push(obj);
    }
    MC.playlistTracks = allTracksArray;
  },

  RandomTrack: function(tracks, limit){
    var randomArray = [];
    for(i=0; i < limit; i++){
      randomNumber()
    }

    function randomNumber(){
      var random =  Math.floor(Math.random() * tracks.length )
      if(randomArray.indexOf(random) > -1){
        randomNumber();
      }else{
        randomArray.push(random);
      }
    }
    return randomArray;
  }
}