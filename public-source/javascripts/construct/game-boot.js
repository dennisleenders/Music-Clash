
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