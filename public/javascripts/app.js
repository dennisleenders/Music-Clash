(function() {
  
function browserDetection() {  
  //Check if browser is IE or not
  if (navigator.userAgent.search("MSIE") >= 0) {
      $("html").addClass("MSIE");
  }
  //Check if browser is Chrome or not
  else if (navigator.userAgent.search("Chrome") >= 0) {
      $("html").addClass("chrome");
  }
  //Check if browser is Firefox or not
  else if (navigator.userAgent.search("Firefox") >= 0) {
      $("html").addClass("firefox");
  }
  //Check if browser is Safari or not
  else if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) {
      $("html").addClass("safari");
  }
  //Check if browser is Opera or not
  else if (navigator.userAgent.search("Opera") >= 0) {
      $("html").addClass("opera");
  }

  if(navigator.userAgent.search("CriOS") >= 0){
    $('html').addClass("iosChrome");
  }

  //Mobile check
  if (navigator.userAgent.search("iPhone") >= 0) {
      $("html").addClass("iphone");
  }
   if (navigator.userAgent.search("Android") >= 0) {
      $("html").addClass("android");
  } 
}

browserDetection();


// iphone needs a diff chrome check, since chrome IOS is seen as safari
// if($('html').hasClass("android")){
//   if(!$('html').hasClass("Chrome")){
//     $('.chrome-boys').show();
//   }
// }else if($('html').hasClass("iphone")){
//   if(!$('html').hasClass("iosChrome")){
//     $('.chrome-boys').show();
//   }
// }


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


// initialize Oauth servers
OAuth.initialize('U019DsER1m6CQwinN1bczGM55sY');

var MC = {
  playlistTracks: null,
  apiPlaylistUser: '1130021698',
  apiPlaylistId: '0YLBPVQjLsO3KQl87UyWyh',
  chosenSong: {}
};

var canvasHammer = document.getElementById('game-container');
var playlistContainer = document.getElementById('playlists');
var tutorialContainer = document.getElementById('tutorials');
var tutorialControl = new Hammer(tutorialContainer);
var navOrbControl = new Hammer(playlistContainer);
var hammertime = new Hammer(canvasHammer);

MC.Boot = function(){};

MC.Boot.prototype = {

  preload: function(){
    console.log("BOOTING");
    this.load.image('preload_logo','public/media/img/mc_logo_small.png');
  },

  create: function(){

    this.game.stage.backgroundColor = 'black'; //ecf0f1
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.game.state.start('preload');
  }
}


MC.Preload = function(){}

MC.Preload.prototype = {

  preload: function(){
    console.log("PRELOADING")

    // show loading screen
    this.preloadBar = this.add.sprite(this.game.width/2,this.game.height/2, 'preload_logo');
    this.preloadBar.anchor.setTo(0.5,0.5);

    // backgrounds
    this.load.image('stars_small','public/media/img/stars_white_static.png');
    this.load.image('stars_medium','public/media/img/stars_white.png');

    this.load.image('bg','public/media/img/stars_white_static.png');
    this.load.image('bg_medium','public/media/img/stars_white.png');

    this.load.image('warpgate','public/media/img/warpgate.png');

    // logo
    this.load.image('mc_logo','public/media/img/mc_logo.png');
    this.load.image('mc_logo_small','public/media/img/mc_logo_small.png');

    // player
    this.load.image('vinyl_big','public/media/img/vinyl.png');
    this.load.image('vinyl_small','public/media/img/vinyl_small.png');

    // enemy's
    this.load.spritesheet('square','public/media/img/squares@x2.png',80,80,2);
    this.load.spritesheet('circle','public/media/img/circle.png',88,88,2);

    // life
    this.load.spritesheet('life','public/media/img/life_spritesheet.png',77,23,3);

    // sounds
    this.load.audio('sound1',"public/media/audio/sound1.mp3");
    this.load.audio('sound2',"public/media/audio/sound2_stretch.mp3");
  },

  create: function(){
    var _this = this;
    setTimeout(function() {
      _this.game.state.start('playlists');
    }, 1000);
  }
}


MC.Playlists = function(){}

MC.Playlists.prototype = {

  create: function(){
    console.log("PLAYLIST")
    var _this = this;

    // Show tutorials if the user, hasent seen it before.
    this.showTutorials()

    // check if the access token is still active, otherwise get a new one. change button style/text accordingly
    if (!$.cookie("access_token")){
      $('.spotify-login').show();
      $('.spotify-login').on("click", {object:this}, this.Login);
    }else {
      $('.spotify-login').hide();
      this.setPlaylists();
      // send a message to the second screen that you joined the game;
      this.sendJoinMessageToSecondScreen()
    }

    // stars background
    this.bg = this.game.add.tileSprite(0,0,this.game.width,this.game.height,'bg');
    this.bgMedium = this.game.add.tileSprite(0,0,this.game.width,this.game.height,'bg_medium');
  },

  update: function(){

    // keep the background stars looping
    this.bg.tilePosition.y += 10 * 0.02;
    this.bgMedium.tilePosition.y += 10 * 0.05;
  },

  Login: function(e){
    var _this = e.data.object;

    if(navigator.userAgent.search("iPhone") <= 0){
      OAuth.popup('spotify').done(function(result) {
        // make cookie of the token and expire it after 60min ( same time as token expires )
        var date = new Date();
        var minutes = 60;
        date.setTime(date.getTime() + (minutes * 60 * 1000));
        $.cookie("access_token", result.access_token, { expires: date });
        // check the user id and put that in a cookie
        result.me().done(function(data) {
          $.cookie("userID", data.id, {expires:date});
          if(data.raw.display_name && data.raw.images[0].url){
            $.cookie("userName",data.raw.display_name);
            $.cookie("userPhoto",data.raw.images[0].url);
          }
          $('.spotify-login').hide();
          _this.setPlaylists();
          // send a message to the second screen that you joined the game;
          _this.sendJoinMessageToSecondScreen()
        })
      });
    }else {
      // OAuth.redirect('spotify', 'http://localhost:8080/06_Spotify_audio/'); 
      OAuth.redirect('spotify', 'http://musicclash.nl'); 
    }
  },

  showTutorials: function(){
    
    // show tutorials and tutorial controls if the user hasnt seen the tutorials yet
    if(!$.cookie("seenTutorials")){
      $('.tutorials').show();
      var isNavAnimated = 0;
      var navTimeout;
      tutorialControl.on('panleft panright', function(e){
        if(e.type == 'panright' && isNavAnimated == false && !$('.tutorial:first-child').hasClass('active')){
          $('.tutorials .nav-orbs .orb.selected').prev().addClass('selected');
          $('.tutorials .nav-orbs .orb.selected').last().removeClass('selected');
          $('.tutorial.active').prev().addClass('active');
          $('.tutorial.active').last().removeClass('active');
          isNavAnimated = true;
        }else if(e.type == 'panleft' && isNavAnimated == false && !$('.tutorial:last-child').hasClass('active')){
          $('.tutorials .nav-orbs .orb.selected').next().addClass('selected');
          $('.tutorials .nav-orbs .orb.selected').first().removeClass('selected');
          $('.tutorial.active').next().addClass('active');
          $('.tutorial.active').first().removeClass('active');
          isNavAnimated = true;
        }else if(e.type == 'panleft' && isNavAnimated == false && $('.tutorial:last-child').hasClass('active')){
          $('.tutorials').hide();
          $.cookie("seenTutorials",true)
        }
        navTimeout = setTimeout(function() {
          isNavAnimated = false;
        }, 200);
      })
    }
  },

  sendJoinMessageToSecondScreen: function(){
    $.ajax({
        type:"POST",
        url:"http://musicclash.nl/second-screen/receive-score.php",
        data: {name:$.cookie("userName"),profilePic:$.cookie("userPhoto")},
    }).done(function(data){
      console.log("message send");
    })
  },

  setPlaylists: function(){
    var _this = this;

    // show logo 
    $('.logo').show();

    // Get the playlist using the User ID
    $.ajax({
      url: 'https://api.spotify.com/v1/users/'+MC.apiPlaylistUser+'/playlists/'+MC.apiPlaylistId+'/tracks',
      headers: {'Authorization': 'Bearer ' + $.cookie("access_token")}
    }).done(function(data){
      var tracks = data.items;
      var trackLimit = 10;
      var randomTracks = MC.Helpers.RandomTrack(tracks,trackLimit);
      // we limit the songs in the for loop so the setTracks will get all the song in the playlist available for the game.
      // tracks[i] for a set lineup, but if we want randomised songs everytime we do track[randomTracks[i]].
      for(var i = 0; i < trackLimit; i++){
        // Starred playlists have a ID of "null"
        if (tracks[randomTracks[i]].track.id != null){
         // QUESTION = To append or to fill in preset html elements
         $('.playlists-container').append('<div class="playlist" data-pos="'+i+'" data-url="'+tracks[randomTracks[i]].track.preview_url+'"><div class="cover-image" style="background-image:url('+tracks[randomTracks[i]].track.album.images[1].url+')"></div><h2>'+tracks[randomTracks[i]].track.name.substring(0,105)+'</h2><h3>'+tracks[randomTracks[i]].track.artists[0].name.substring(0,105)+'</h3></div>');
         $('.my-playlists .nav-orbs').append('<div class="orb"></div>');
        }
      }
      $('.vinyl').show();
      $('.playlist:last-child').addClass('selected');
      $('.my-playlists .nav-orbs .orb:first-child').addClass('selected');
      // setting all the tracks of the playlist in an url
      MC.Helpers.SetTracks(tracks);
      MC.Helpers.PlayTrack($('.playlist.selected').attr('data-url'));
      _this.loadSong($('.playlist.selected').attr('data-url'));

      // playlist overlay layer
      // The first time the user needs to click on the playlist twice to "UNLOCK" the audio 
      // for IOS devices.
      if($.cookie("access_token")){
        if($.cookie("userName")){
          $('.choose-playlist p').html($.cookie("userName")+"!<br/><br/>Klik hier om de track te kiezen die jij wilt horen!")
        }
        $('.choose-playlist').show();
        $('.choose-playlist').on('click',function(e){
          MC.Helpers.audioEl[0].play()
          $('.choose-playlist').hide();
          MC.audioUnlocked = true;
        })
      }

      // playlist events
      var isNavAnimated = false;
      var navTimeout;
      navOrbControl.on('panleft panright', function(e) {
        clearTimeout(navTimeout)
        if(e.type == 'panleft' && isNavAnimated == false && !$('.playlist:first-child').hasClass('selected')){
          $('.my-playlists .nav-orbs .orb.selected').next().addClass('selected');
          $('.my-playlists .nav-orbs .orb.selected').first().removeClass('selected');
          $('.playlist.selected').fadeOut();
          $('.playlist.selected').prev().addClass('selected');
          $('.playlist.selected').last().removeClass('selected');
          $('.playlist.selected').fadeIn();
          
          // play the preview of the selected song.
          MC.Helpers.PlayTrack($('.playlist.selected').attr('data-url'));
          isNavAnimated = true;

        }else if(e.type == 'panright' && isNavAnimated == false && !$('.playlist:last-child').hasClass('selected')){
          $('.my-playlists .nav-orbs .orb.selected').prev().addClass('selected');
          $('.my-playlists .nav-orbs .orb.selected').last().removeClass('selected');
          $('.playlist.selected').fadeOut();
          $('.playlist.selected').next().addClass('selected');
          $('.playlist.selected').first().removeClass('selected');
          $('.playlist.selected').fadeIn();
          
          // play the preview of the selected song.
          MC.Helpers.PlayTrack($('.playlist.selected').attr('data-url'));
          isNavAnimated = true;
        }
        navTimeout = setTimeout(function() {
          isNavAnimated = false;
        }, 200);
      });


      $('.playlist').on("click", function(e){
        if($(this).is('.selected')){
          // stop the music and hide the elements so the game can continue
          // set a chosenSong
          var songPosition = parseInt($('.playlist.selected').attr('data-pos'),10);
          MC.chosenSong.name = tracks[randomTracks[songPosition]].track.name
          MC.chosenSong.artist = tracks[randomTracks[songPosition]].track.artists[0].name
          MC.chosenSong.albumCover = tracks[randomTracks[songPosition]].track.album.images[0].url
          MC.chosenSong.duration = tracks[randomTracks[songPosition]].track.duration_ms
          MC.chosenSong.songUri = tracks[randomTracks[songPosition]].track.uri

          MC.Helpers.audioEl[0].pause();

          // preload audio for mobile audio initiation
          _this.mobileInitiation.start(0);

          // animation to transition into play state
          $('.my-playlists').addClass('animated');
          _this.vinylOffset = _this.game.height/2 - 234;
          $('.vinyl').css({
            "-webkit-transform":"translate(-50%,"+_this.vinylOffset+"px) scale(1,1)"
          });

          // start play state
          _this.startGame();
        }
      });
    })
  },

  loadSong: function(url){
    var _this = this;
    var request = new XMLHttpRequest();
    request.open('GET',url,true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      MC.Helpers.ctx.decodeAudioData(request.response, function(buffer){
        _this.mobileInitiation = MC.Helpers.ctx.createBufferSource();
        _this.mobileInitiation.buffer = buffer;
      })
    }
    request.send();
  },

  startGame: function(){
    var _this = this;

    setTimeout(function() {
      $('.spotify-login').hide();
      $('.my-playlists').hide();
      $('.logo').hide();
      _this.vinylScale();
      _this.tilePositionStatic = _this.bg.tilePosition.y;
      _this.tilePositionAnimated = _this.bgMedium.tilePosition.y;
      _this.game.state.start('play');
    }, 800);
  },

  vinylScale: function(){
    $('.vinyl').css({
      "-webkit-transform":"translate(-50%,"+this.vinylOffset+"px) scale(0.37,0.37) rotate(48deg)"
    });
    setTimeout(function() {
      $('.vinyl').hide();
    }, 800);
  },

  shutdown: function(){
    this.bg.destroy(true)
    this.bgMedium.destroy(true)
  }
}

// Things to know 
//// Only adjust full caps variables to influence the game, all camelcase variables are hands off
//// TRAIL_DRAW_SIZE will influence the speed that the trial renders ( making the vinyl look like it goes faster )
//// Y movement of objects needs to go faster if they are diagonal, since the vinyl moves faster than object
//// Some tracks from the spotify API have NULL for preview URL. Manually check all songs before releasing game
//// Never make a playlist with less than the suggest track list. Otherwise the random number function will infinite loop
MC.Play = function(){}

MC.Play.prototype = {

  create: function(){
    var _this = this;

  /////////////////////////////////////////////////////////////////////////////////////////////
  // SETTINGS /////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////

    this.audio = new Audio();

    this.analyser = MC.Helpers.ctx.createAnalyser();
    this.gain = MC.Helpers.ctx.createGain();
    this.gain.gain.value = 0;
    this.biquadAnalyser = MC.Helpers.ctx.createAnalyser();

    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.biquadData = new Uint8Array(this.biquadAnalyser.frequencyBinCount);

    this.biquadFilter = MC.Helpers.ctx.createBiquadFilter();
    this.biquadFilter.type = "lowpass";

    this.averageVolume = null;
    this.averageBass = null;
    this.lastBeat = 100; // treshold for bass

    this.currentTrack = 0;
    this.maxTrackList = 5;
    this.randomTracks = MC.Helpers.RandomTrack(MC.playlistTracks,this.maxTrackList) // set if randomtrack are wanted over set playlist
    this.musicBuffer = null;

    this.scoreCounter = 0;
    this.scoreMultiplier = 1;
    this.playerLife = 3;

    this.PLAYERSPEED = 0;
    this.PLAYER_ANGLE = {angle:2}
    this.STARS_SPEED = {speed: 0.02};
    this.STARS_MEDIUM_SPEED = {speed: 0.05};
    this.game.add.tween(this.STARS_SPEED).to({ speed: 0.2 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, false );
    this.game.add.tween(this.STARS_MEDIUM_SPEED).to({ speed: 0.4 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, false );
    this.MAX_OBJECTS = 10;

    this.TRAIL_MAX = 30; // default: 30
    this.TRAIL_DRAW_SIZE = {size: 8}; // default: 8
    this.TRAIL_LINE_WIDTH = 10; // default: 10
    this.TRAIL_PROPULSION_SPEED = 50; // default: 50
    this.TRAIL_OFFSET_Y = 15; // default: 10
    this.TRAIL_OFFSET_X = 30; // default: 31

    this.isMoving = false;
    this.isTrailBig = false;
    this.isTransitionPhase = false;
    this.isBeatDetected = false;

    this.fifoArray = [];

    this.startPosX = this.game.width/2;
    this.startPosY = this.game.height - 150;

    this.juicy = this.game.plugins.add(new Phaser.Plugin.Juicy(this));

  ///////////////////////////////////////////////////////////////////////////////////////////
  // CONTROLS ///////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////

    // Touch controls
    hammertime.on('panleft panright', function(e){
      clearTimeout(_this.isMoving)
      if(_this.playerLife != 0){
      if(e.type == 'panleft'){
        _this.PLAYERSPEED = - ((Math.abs(e.velocityX)*15) + 0.0);
      }else{
        _this.PLAYERSPEED = ((Math.abs(e.velocityX)*15)+0.0);
      }
      _this.isMoving = setTimeout(function() {
        _this.PLAYERSPEED = 0;
      }, 200);
      }
    });
    
  ///////////////////////////////////////////////////////////////////////////////////////////
  // CREATE /////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////

    // stars
    // takes the tileposition saved in the menu state
    this.stars = this.game.add.tileSprite(0,0,this.game.width,this.game.height,'stars_small');
    this.stars.tilePosition.y = this.game.state.states['playlists'].tilePositionStatic;
    this.starsMedium = this.game.add.tileSprite(0,0,this.game.width,this.game.height,'stars_medium');
    this.starsMedium.tilePosition.y = this.game.state.states['playlists'].tilePositionAnimated;

    // warpgate ( for transition phase )
    this.warpgate = this.game.add.sprite(0,0,'warpgate');
    this.warpgate.x = -this.warpgate.width
    this.warpgate.y = -this.warpgate.height
    this.warpgate.checkWorldBounds = true;
    this.warpgate.events.onOutOfBounds.add(function(){
      _this.isTransitionPhase = false;
      _this.killSprite(this.warpgate);
      _this.insertNewSong();
    },this)

    // the trail behind the player vinyl
    this.trail = this.game.add.graphics(this.TRAIL_OFFSET_X,this.TRAIL_OFFSET_Y);

    // the player
    this.player = this.game.add.sprite(this.startPosX,this.startPosY,'vinyl_small');
    this.player.anchor.setTo(0.5,0.5);
    this.game.physics.arcade.enable(this.player);
    this.player.body.collideWorldBounds = true;

    // objects
    this.objects = this.game.add.group();
    this.objects.name = 'objects';
    this.squares = this.game.add.group();
    this.squares.name = 'squares';
    // this.circles = this.game.add.group();
    // this.circles.name = 'circles';

    // set profile picture
    if($.cookie("userPhoto")){
      $('.profile-orb .photo').css({"background-image":"url("+$.cookie("userPhoto")+")"})
      $('.profile-orb').fadeIn()
    }

    // score
    this.score = this.game.add.text(25, 13, '', {
        font: '20px Montserrat',
        fill: '#ffffff',
        align: 'right'
    });
    this.points = this.game.add.text(25,38,'p o i n t s',{
      font: '100 12px Lato',
      fill: '#ffffff',
      align: 'right'
    })

    // life
    this.life = this.game.add.sprite(this.game.width - 140,22,'life');

    // sounds
    this.playerHitSound = this.game.add.audio('sound1');
    this.playerGameOver = this.game.add.audio('sound2');

    // first music initiation
    setTimeout(function() {
      _this.insertNewSong();
    }, 800);
  },

///////////////////////////////////////////////////////////////////////////////////////////
// UPDATE /////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

  update: function(){
    var _this = this;
    /////////////
    // SOUND ////
    /////////////

    // volume detection, adjusts the trail width of the player
    if(this.freqData != null){
      this.analyser.getByteFrequencyData(this.freqData);
      this.averageVolume = this.getAverage(this.freqData,"volume");

      this.TRAIL_LINE_WIDTH = this.averageVolume * this.averageVolume / 600;
    }

    // beat detection spawner
    if(this.biquadData != null){
      this.biquadAnalyser.getByteFrequencyData(this.biquadData);
      this.averageBass = this.getAverage(this.biquadData,"bass");

      // detects the bass beat, and will spawn an obstacle every time a beat has been registered.
      if(this.averageBass >= this.lastBeat && this.isBeatDetected == false){
        this.lastBeat = this.averageBass;
        this.isBeatDetected = true;
        //console.log("beat detected")
        
        // spawns a obstacle at a random X location ( this can be changed to an array of spawn locations)
        if(this.playerLife != 0){
          var random = (Math.random() * (this.game.width - 30) + 30);
          this.spawnSquare(random, 0);
        } 
        // if(this.playerLife != 0){
        //   var random = (Math.random() * (this.game.width - 30) + 30);
        //   var randomNum = (Math.random());
        //   if(randomNum <= 0.5){
        //     this.spawnSquare(random, 0);
        //   } else {
        //     this.spawnCircle(random,0);
        //   }
        // } 

        // will scale and descale the objects to function as beat visualisation
        this.squares.children.forEach(function(e){
          if(e.exists){
            _this.game.add.tween(e.scale).to({ x: 0.5, y: 0.5}, 20, Phaser.Easing.Linear.None, true, 0, 0, false )            
          }
          setTimeout(function(){
            _this.game.add.tween(e.scale).to({ x: 0.4, y: 0.4}, 50, Phaser.Easing.Linear.None, true, 0, 0, false )
          },200)          
        })

        // this.circles.children.forEach(function(e){
        //   if(e.exists){
        //     _this.game.add.tween(e.scale).to({ x: 0.8, y: 0.8}, 20, Phaser.Easing.Linear.None, true, 0, 0, false )            
        //   }
        //   setTimeout(function(){
        //     _this.game.add.tween(e.scale).to({ x: 0.7, y: 0.7}, 50, Phaser.Easing.Linear.None, true, 0, 0, false )
        //   },200)          
        // })

        // timeout to skip the bass peak, so it won't register it every 24/second
        setTimeout(function() {       
          _this.isBeatDetected = false;
        }, 500);

      }else {
        // lower the saved beat every 24/second to keep registering now lower volume beats
        this.lastBeat -= 0.1;
      }
    }

    /////////////
    // SCORE ////
    /////////////

    this.score.setText(this.scoreCounter);
    if(this.playerLife != 0){
      this.scoreCounter = this.scoreCounter + this.scoreMultiplier;
    }

    /////////////////
    // COLLISION ////
    /////////////////

    this.game.physics.arcade.overlap(this.player, this.squares.children,this.playerHit,null,this);
    // this.game.physics.arcade.overlap(this.player, this.circles.children,this.playerHit,null,this);
    /////////////
    // TRAIL ////
    /////////////

    // register trail movement
    this.trailX = this.player.body.x;
    this.fifoArray.push(this.trailX);

    // save positions and shift out [0] for a new entry when array is full, cycling trough the rest
    if(this.fifoArray.length > this.TRAIL_MAX){
      this.fifoArray.shift();
    }
    // draw trail
    this.trail.clear()
    this.trail.lineStyle(this.TRAIL_LINE_WIDTH, 0xFFFFFF, 1);
    this.trail.lineCap = "round";
    this.trail.moveTo(this.fifoArray[0], this.startPosY + this.fifoArray.length * this.TRAIL_DRAW_SIZE.size);
    for(var t = 1; t < this.fifoArray.length; t++) {
      this.trail.lineTo(this.fifoArray[t], this.startPosY + (this.fifoArray.length - t) * this.TRAIL_DRAW_SIZE.size);
    }

    //////////////////
    // BACKGROUND ////
    //////////////////

    // this switching of the tilePosition might cause a little stutter
    // player angle to rotate the vinyl disk
    if(this.isTransitionPhase == true){
      this.stars.tilePosition.y += 10 * (this.STARS_SPEED.speed + 0.4);
      this.starsMedium.tilePosition.y += 10 * (this.STARS_MEDIUM_SPEED.speed + 0.4);
      this.warpgate.y += 6;
      this.player.angle += 6;
    }else {
      this.player.angle += this.PLAYER_ANGLE.angle;
      this.stars.tilePosition.y += 10 * this.STARS_SPEED.speed;
      this.starsMedium.tilePosition.y += 10 * this.STARS_MEDIUM_SPEED.speed;
    }

    ////////////////////////
    // PLAYER + OBJECTS ////
    ////////////////////////

    this.player.body.x += this.PLAYERSPEED;

    this.squares.children.forEach(function(e){
      if(e.exists){
        e.body.y += 8; //default: 8
      }
    })
    // this.circles.children.forEach(function(e){
    //   if(e.exists){
    //     e.body.y += 8; //default: 8
    //   }
    // })
  },

/////////////////////////////////////////////////////////////////////////////////////////////
// EVENTS ///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
  
  transitionPhase: function(){
    if(this.playerLife != 0){
      // fade out music
      this.game.add.tween(this.gain.gain).to({ value: 0.001 }, 2000, Phaser.Easing.Linear.None, true, 0, 0, false );           
      this.warpgate.reset(0,-this.warpgate.height);
      this.isTransitionPhase = true;
    }
  },

  insertNewSong: function(){
    // fade in music
    this.game.add.tween(this.gain.gain).to({ value: 1 }, 2000, Phaser.Easing.Linear.None, true, 0, 0, false );       
    //check the current track, and load/show and play it
    if(this.maxTrackList != this.currentTrack){
      this.loadSong(MC.playlistTracks[this.randomTracks[this.currentTrack]].url)
      this.showTrack(MC.playlistTracks[this.randomTracks[this.currentTrack]])
      this.currentTrack++;
    }else{
      this.endGame("won");
    }
  },

  spawnSquare: function(x,y){
    var square = this.squares.getFirstDead();
    if(!square){
      square = this.squares.create(0,0,'square');
      square.name = "square";
      this.game.physics.arcade.enable(square);
      square.body.height = 40;
      square.body.width = 40;
      square.events.onOutOfBounds.add(this.killSprite,this);
      square.checkWorldBounds = true;
      square.anchor.setTo(0.5,0.5);
      square.scale.set(0.4,0.4);
      square.frame = 0;
      square.angle = 45;
    }
    square.reset(x,y);
  },

  // spawnCircle: function(x,y){
  //   var circle = this.circles.getFirstDead();
  //   if(!circle){
  //     circle = this.circles.create(0,0,'circle');
  //     circle.name = "circle";
  //     this.game.physics.arcade.enable(circle);
  //     circle.body.height = 89;
  //     circle.body.width = 89;
  //     circle.events.onOutOfBounds.add(this.killSprite,this);
  //     circle.checkWorldBounds = true;
  //     circle.anchor.setTo(0.5,0.5);
  //     circle.frame = 0;
  //     console.log("check");
  //   }
  // circle.reset(x,y);
  // },

  killSprite: function(sprite){
    sprite.kill();
  },

  playerHit: function(player,object){
    if(this.playerLife != 0){
      this.scoreCounter -= 50;
      this.playerLife--;
      this.lostLife();
      this.killSprite(object)
      this.juicy.shake();
      this.playerHitSound.volume = 3;
      this.playerHitSound.play();
    }
  },

  lostLife: function(){
    if(this.playerLife == 2){
      this.life.frame = 1;
    }else if(this.playerLife == 1){
      this.life.frame = 2;
    }else if(this.playerLife == 0){
      this.endGame("lost");
    }
  },

  loadSong: function(url){
    var _this = this;

    var request = new XMLHttpRequest();
    request.open('GET',url,true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      MC.Helpers.ctx.decodeAudioData(request.response, function(buffer){
        _this.setupSong(buffer)
      })
    }
    request.send();
  },

  setupSong: function(buffer){
    var _this = this;
    var musicSource = MC.Helpers.ctx.createBufferSource();
    musicSource.buffer = buffer;

    musicSource.connect(this.gain)
    musicSource.connect(this.analyser);

    musicSource.connect(this.biquadFilter);
    this.biquadFilter.connect(this.biquadAnalyser);

    this.gain.connect(MC.Helpers.ctx.destination);
    musicSource.start(0);

    setTimeout(function(){
      _this.transitionPhase()
    }, 28000);
  },

  showTrack: function(track){
    $('.track-playing').html("<p><span>Vs.</span></br>"+track.artist+" - <span>"+track.name+"</span></p>");
    $('.track-playing ').fadeIn();
    setTimeout(function() {
      $('.track-playing ').fadeOut();
    }, 2000);
  },

  getAverage: function(data,status) {
    var values = 0;
    var average;

    if(status == "volume"){
      var length = data.length;
    }else if(status == "bass"){
      var length = 50;
    }

    // get all the frequency amplitudes
    for (var i = 0; i < length; i++) {
        values += data[i];
    }

    average = values / length;
    return average;
  },

  pauseGame: function(){
    this.game.paused = true;
  },

  endGame: function(state){
      $(".logo").css({"marginTop":"60px"});
      $(".logo").fadeIn();

      // Slow everything down in the game using tweens
      this.game.add.tween(this.STARS_SPEED).to({ speed: 0 }, 2000, Phaser.Easing.Linear.None, true, 0, 0, false );
      this.game.add.tween(this.STARS_MEDIUM_SPEED).to({ speed: 0 }, 2000, Phaser.Easing.Linear.None, true, 0, 0, false );       
      this.game.add.tween(this.TRAIL_DRAW_SIZE).to({ size: 0 }, 2000, Phaser.Easing.Linear.None, true, 0, 0, false );       
      this.game.add.tween(this.PLAYER_ANGLE).to({ angle: 0 }, 2000, Phaser.Easing.Linear.None, true, 0, 0, false );       
      this.game.add.tween(this.gain.gain).to({ value: 0.001 }, 2000, Phaser.Easing.Linear.None, true, 0, 0, false );       

      // Stop the player and remove lives
      this.PLAYERSPEED = 0;
      this.life.alpha = 0;

      //send the score to the second screen
      this.sendScore();

    if("lost"){
      // Logo & Game over panel show
      $(".game-over").fadeIn();
      this.retryGame()

      // sounds
      this.playerGameOver.play();
      this.playerGameOver.volume = 3;
    }else {
      $(".game-won").fadeIn();
      this.retryGame()
    }
  },

  sendScore: function(){
    $.ajax({
        type:"POST",
        url:"http://musicclash.nl/second-screen/receive-score.php",
        data: {
          name:$.cookie("userName"),
          profilePic:$.cookie("userPhoto"),
          score:this.scoreCounter,
          songName:MC.chosenSong.name,
          songArtist:MC.chosenSong.artist,
          songAlbum:MC.chosenSong.albumCover,
          songUri:MC.chosenSong.songUri,
          songDuration:MC.chosenSong.duration,
        },
    }).done(function(data){
      console.log("score send")
    })
  },

  retryGame: function(){
    $(".retry").on("click",function(){
      location.reload();
    })
  },

}

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

;
  window.ym = window.ym || {};

  window.ym.utils = {
    getBrowser: function() {
      var OS, browser, browserInfo, dataBrowser, dataOS, searchString, searchVersion, version, versionSearchString;
      versionSearchString = "";
      searchString = function(data) {
        var dataProp, dataString, i;
        i = 0;
        while (i < data.length) {
          dataString = data[i].string;
          dataProp = data[i].prop;
          versionSearchString = data[i].versionSearch || data[i].identity;
          if (dataString) {
            if (dataString.indexOf(data[i].subString) !== -1) {
              return data[i].identity;
            }
          } else {
            if (dataProp) {
              return data[i].identity;
            }
          }
          i++;
        }
      };
      searchVersion = function(dataString) {
        var index;
        index = dataString.indexOf(versionSearchString);
        if (index === -1) {
          return;
        }
        return parseFloat(dataString.substring(index + versionSearchString.length + 1));
      };
      dataOS = [
        {
          string: navigator.platform,
          subString: "Win",
          identity: "Windows"
        }, {
          string: navigator.platform,
          subString: "Mac",
          identity: "Mac"
        }, {
          string: navigator.userAgent,
          subString: "iPhone",
          identity: "iPhone"
        }, {
          string: navigator.userAgent,
          subString: "iPad",
          identity: "iPad"
        }, {
          string: navigator.userAgent,
          subString: "Android",
          identity: "Android"
        }, {
          string: navigator.platform,
          subString: "Linux",
          identity: "Linux"
        }
      ];
      dataBrowser = [
        {
          string: navigator.userAgent,
          subString: "Chrome",
          identity: "Chrome"
        }, {
          string: navigator.userAgent,
          subString: "OmniWeb",
          versionSearch: "OmniWeb/",
          identity: "OmniWeb"
        }, {
          string: navigator.vendor,
          subString: "Apple",
          identity: "Safari",
          versionSearch: "Version"
        }, {
          prop: window.opera,
          identity: "Opera",
          versionSearch: "Version"
        }, {
          string: navigator.vendor,
          subString: "iCab",
          identity: "iCab"
        }, {
          string: navigator.vendor,
          subString: "KDE",
          identity: "Konqueror"
        }, {
          string: navigator.userAgent,
          subString: "Firefox",
          identity: "Firefox"
        }, {
          string: navigator.vendor,
          subString: "Camino",
          identity: "Camino"
        }, {
          string: navigator.userAgent,
          subString: "Netscape",
          identity: "Netscape"
        }, {
          string: navigator.userAgent,
          subString: "MSIE",
          identity: "Explorer",
          versionSearch: "MSIE"
        }, {
          string: navigator.userAgent,
          subString: "Gecko",
          identity: "Mozilla",
          versionSearch: "rv"
        }, {
          string: navigator.userAgent,
          subString: "Mozilla",
          identity: "Netscape",
          versionSearch: "Mozilla"
        }
      ];
      browser = searchString(dataBrowser) || "browser-unknown";
      version = searchVersion(navigator.userAgent) || searchVersion(navigator.appVersion) || "x";
      OS = searchString(dataOS) || "os-unknown";
      browserInfo = {
        browser: browser,
        version: version,
        OS: OS
      };
      return browserInfo;
    },
    identifyBrowser: function() {
      var browserInfo;
      if (!ym.utils.browserInfo) {
        browserInfo = ym.utils.browserInfo = ym.utils.getBrowser();
        return document.getElementsByTagName("html")[0].className = document.getElementsByTagName("html")[0].className + (" " + (browserInfo.browser.toLowerCase()) + " " + (browserInfo.OS.toLowerCase()) + " " + (browserInfo.browser.toLowerCase()) + "-" + browserInfo.version);
      }
    },
    random: function(min, max) {
      return min + Math.random() * (max - min);
    }
  };

}).call(this);
