//*************************************************************//
//  name: Class - Game                                         //
//  desc: This class will trigger after the site has loaded.   //
//        it contains the user's playlist and the ability the  //
//        start the game with the chosen playlist              //
//*************************************************************//

// if there is a callback url from a redirect login, this will trigger
OAuth.callback(function(error,result){
  // make cookie of the token and expire it after 60min ( same time as token expires )
  var date = new Date();
  var minutes = 60;
  date.setTime(date.getTime() + (minutes * 60 * 1000));
  $.cookie("access_token", result.access_token, { expires: date });
  $('.spotify-login .btn-text').text("LOGGING IN..");

  // this will take a while, and will trigger the playlists state on its own. 
  result.me().done(function(data) {
    $.cookie("userID", data.id, {expires:date});
     if(data.raw.display_name && data.raw.images[0].url){
        $.cookie("userName",data.raw.display_name);
        $.cookie("userPhoto",data.raw.images[0].url);
      }
  })
})

// setting canvas size
var w = $(window).width(); // window.innerWidth * window.devicePixelRatio;
var h = $(window).height(); //window.innerHeight * window.devicePixelRatio;

// initiating Music Clash game object
// set Phaser to CANVAS, AUTO can decrease fps
MC.game = new Phaser.Game(w,h,Phaser.CANVAS,'game-container');

MC.game.state.add('boot', MC.Boot);
MC.game.state.add('preload', MC.Preload);
MC.game.state.add('playlists', MC.Playlists);
MC.game.state.add('play', MC.Play);

MC.game.state.start('boot');