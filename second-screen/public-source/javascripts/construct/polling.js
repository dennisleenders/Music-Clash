
var secondScreen = {
  polling: {
    timelinePosition: 0
  },
  sessionTime: null,
  fillerNumber:0,
  leaderboardArray: [
    {score:0,name:"none"},
    {score:0,name:"none"},
    {score:0,name:"none"},
    {score:0,name:"none"}
  ],
};

secondScreen.init = function(){
  this.polling.init()
}

secondScreen.polling.init = function(){
  var _this = this;
  var sessionPostLength = 0;

  setInterval(function(){
    $.ajax({
      url:"http://musicclash.nl/second-screen/read-score.php",
    }).done(function(data){
      // parse the data into JSON after the 
      data = JSON.parse(data);

      if(data.length != sessionPostLength){
        // ALWAYS USE VAR ON FOR LOOPS ( Thanks 2 hour waste of time )
        for(var i = sessionPostLength; i < data.length; i++){
          if(data[i].joined){
            _this.postJoined(data[i].name,data[i].profilePic);
          }else{
            _this.postScore(data[i].name,data[i].profilePic,data[i].score,data[i].songAlbum,data[i].songArtist,data[i].songDuration,data[i].songName,data[i].songUri)
          }
        }
        sessionPostLength = data.length;
      }
    }).error(function(data){
      console.log(data)
    })
  },1000)

  this.sessionLoop(4773)
},

secondScreen.polling.sessionLoop = function(time){
  var _this = this;

  setTimeout(function() {
    _this.newSession()
  }, (time + 6000));

  // The + 5 is so that we know for sure the song has ended playing on spotify
  var minutes = Math.floor((time/60000));
  var seconds = ((time - (minutes*60000)) / 1000);

  var timeEl = $('.track-time');
  var timeDisplay = {
    minutes: minutes,
    seconds: Math.floor(seconds),
  }

  timeEl.text(timeDisplay.minutes+":"+timeDisplay.seconds)

  sessionTime = setInterval(function(){
    // split time
    var splitTime = timeEl.text().split(":");
    timeDisplay.minutes = parseInt(splitTime[0],10);
    timeDisplay.seconds = parseInt(splitTime[1],10);

    // check if seconds are below 0 or 10, change accordingly
    timeDisplay.seconds--;
    if(timeDisplay.seconds < 1 && timeDisplay.minutes != 0){
      timeDisplay.seconds = 59;
      timeDisplay.minutes--;
    }else if(timeDisplay.seconds < 10) {
      timeDisplay.seconds = "0" + timeDisplay.seconds
    }
    // redisplay time
    timeEl.text(timeDisplay.minutes+":"+timeDisplay.seconds)
    
    if(timeDisplay.minutes == 0 && timeDisplay.seconds == "00"){
      clearInterval(sessionTime)
    }
  },1000)
},

secondScreen.polling.newSession = function(){
  if(secondScreen.highscore){
  console.log(secondScreen.highscore);
  // start new session loop
  this.sessionLoop(parseInt(secondScreen.highscore.duration,10))

  // screen overlay
  $('.overlay-winner .name').text(secondScreen.highscore.name);
  $('.overlay-winner .profile-picture').css("background-image","url("+secondScreen.highscore.picture+")");
  $('.overlay-winner .album-art').css("background-image","url("+secondScreen.highscore.albumCover+")");
  $('.overlay-winner .song-name').html(secondScreen.highscore.songName+"<br/><span>"+secondScreen.highscore.songArtist+"</span>");
  $('.overlay-winner').fadeIn();

  setTimeout(function() {
    $('.overlay-winner').fadeOut();
  }, 10000);

  // Play new song
  $('iframe').attr("src",secondScreen.highscore.songUri);

  // clear database
  $.ajax({url:"http://musicclash.nl/second-screen/clear-score.php"})

  // reset values
  secondScreen.leaderboardArray = [
    {score:0,name:"none"},
    {score:0,name:"none"},
    {score:0,name:"none"},
    {score:0,name:"none"}
  ]

  $('.leaderboard .profile').each(function(i,e){
    $(e).css("background-image","none")
  })

  $('.leaderboard .score-container').each(function(i,e){
    $(e).find('.score').text("Claim")
    $(e).find('span').text("deze plek")
  })

  // adjust current playing track
  $('.current-track').html('<p>Huidige track : <span>'+secondScreen.highscore.songArtist+' - '+secondScreen.highscore.songName+'</span></p>')

  secondScreen.highscore = undefined;
  }else {
    this.fillerSession();
  }
},

secondScreen.polling.fillerSession = function(){
  
  //filler songs
  var fillerSongs = [
    {
      uri:"spotify:track:0BF6mdNROWgYo3O3mNGrBc",
      artist:"Major Lazer",
      name:"Lean on(feat. MO & DJ Snake)",
      duration:176561
    },
    {
      uri:"spotify:track:3v8aPisqoGRZEwwf2rCeXQ",
      artist:"Fatrat",
      name:"Timelapse",
      duration:185314
    }
  ]

  // start new session loop
  this.sessionLoop(fillerSongs[secondScreen.fillerNumber].duration)

  // Play new song
  $('iframe').attr("src",fillerSongs[secondScreen.fillerNumber].uri);

  // adjust current playing track
  $('.current-track').html('<p>Huidige track : <span>'+fillerSongs[secondScreen.fillerNumber].artist+' - '+fillerSongs[secondScreen.fillerNumber].name+'</span></p>')

  if(secondScreen.fillerNumber == 0){
    secondScreen.fillerNumber = 1;
  }else {
    secondScreen.fillerNumber = 0;
  }

},

secondScreen.polling.postJoined = function(name,picture){
  $('.timeline').append('<div class="post"><div class="content"><div class="profile" style="background-image:url('+picture+')"></div><p class="message">'+name+'<br/>Speelt mee</p></div><div class="vinyl"><img src="public/media/img/vinyl.png"></div></div>')
  this.moveTimeline();
},

secondScreen.polling.postScore = function(name,picture,score,album,artist,duration,songName,uri){
  // show on the timeline a player scored points.
  $('.timeline').append('<div class="post"><div class="content"><div class="profile" style="background-image:url('+picture+')"></div><p class="message">'+name+'<br/>heeft een score van '+ score +'</p></div><div class="vinyl"><img src="public/media/img/vinyl.png"></div></div>')
  this.moveTimeline();

  // check of the score is a highscore
  this.checkHighscore(name,picture,score,album,artist,duration,songName,uri);
},

secondScreen.polling.checkHighscore = function(name,picture,score,album,artist,duration,songName,uri){
  // new score entry
  var entry = {
    name:name,
    picture:picture,
    score:parseInt(score,10),
    songName:songName,
    artist:artist,
    albumCover:album,
    songDuration:duration,
    songUri:uri
  }
  // re-sort the score array 
  secondScreen.leaderboardArray.push(entry)
  secondScreen.leaderboardArray.sort(function(a, b){
    return b.score - a.score
  });

  console.log(secondScreen.leaderboardArray);

  // if anything changed in the leaderboard, refresh it
  for(var i = 0; i <= 3; i++){
    // setting up rank variables
    var rank = $('.leaderboard').find("[data-rank='" + (i+1) + "']");
    var currentScore = rank.find('.score').text();
    var currentPlayer = rank.find('.profile').attr('data-name');  

    if(secondScreen.leaderboardArray[i].score != parseInt(currentScore,10)){
      if(secondScreen.leaderboardArray[i].score != 0){
        newScore(rank,i)
        if((i+1) == 1){
          // set current highscore
          secondScreen.highscore = {
            name:secondScreen.leaderboardArray[i].name,
            score:secondScreen.leaderboardArray[i].score,
            picture:secondScreen.leaderboardArray[i].picture,
            songName:secondScreen.leaderboardArray[i].songName,
            songArtist:secondScreen.leaderboardArray[i].artist,
            albumCover:secondScreen.leaderboardArray[i].albumCover,
            songUri:secondScreen.leaderboardArray[i].songUri,
            duration:secondScreen.leaderboardArray[i].songDuration
          }
          console.log("new highscore",secondScreen.highscore)

        }
      }
    }
  }

  function newScore (rank,i) {
    rank.css("opacity","0");
    var timeout = setTimeout(function() {
      rank.find('.profile').css('background-image','url('+secondScreen.leaderboardArray[i].picture +')');
      rank.find('.profile').attr('data-name',secondScreen.leaderboardArray[i].name)
      rank.find('.score-container').html('<p class="score">'+secondScreen.leaderboardArray[i].score+'</p><span>points</span>');
      rank.css("opacity","1");
    }, 500);
  }

  // // check if the score is an highscore
  // if(secondScreen.leaderboardArray[0].name == name && secondScreen.leaderboardArray[0].score == score){
  //   return true;
  // }else {
  //   return false;
  // }
},

secondScreen.polling.moveTimeline = function(){
  this.timelinePosition += 260;
  $('.timeline').css({'transform':'translateX(-'+ this.timelinePosition +'px)'})
}

secondScreen.init();