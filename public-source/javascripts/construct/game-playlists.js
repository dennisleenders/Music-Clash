
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