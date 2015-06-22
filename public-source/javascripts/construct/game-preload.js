
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