<?php
  
  function passCrypt($psw)
  {
     $psw=md5($psw);
     $salt=substr($psw,1,5);
     $psw=crypt($psw,$salt);
     return $psw;
  }
  
?>