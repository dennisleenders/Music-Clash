<?php 

  header("Access-Control-Allow-Origin: *");

  $txt = file_get_contents("test.json");
  if($txt)
      $txt = substr($txt, 0, strlen($txt)-1);
  echo "[".$txt."]";
?>