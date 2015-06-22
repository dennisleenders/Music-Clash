<?php 

  header("Access-Control-Allow-Origin: *");

  $file_name = "test.json";
  $score = $_REQUEST["score"];
  $id = $_REQUEST["id"];
  $name = $_REQUEST["name"];
  $profile_pic = $_REQUEST["profilePic"];
  $song_name = $_REQUEST["songName"];
  $song_artist = $_REQUEST["songArtist"];
  $song_album = $_REQUEST["songAlbum"];
  $song_uri = $_REQUEST["songUri"];
  $song_duration = $_REQUEST["songDuration"];

  if(!$id){
    $id = time().rand();
  }

  $txt = "";
  if($score)
    $txt = json_encode( array( "id" => $id, "score" => $score, "name" => $name, "profilePic" => $profile_pic, "songName" => $song_name, "songArtist" => $song_artist, "songAlbum" => $song_album, "songUri" => $song_uri, "songDuration" => $song_duration) );
  else
    $txt = json_encode( array( "id"=> $id, "joined" => 1, "name" => $name, "profilePic" => $profile_pic) );

  // LOCK_EX 
  file_put_contents($file_name, $txt.',', FILE_APPEND | LOCK_EX);

  echo $id;
?>