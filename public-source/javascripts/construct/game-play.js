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