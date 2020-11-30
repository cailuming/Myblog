<?php

   require("controller.php");
  
   $router =  $_GET['router_key'];
  
   switch($router){
       case 'getCaseCount':
         getCaseCount();
         break;
       case 'addShader':
         addShader();
         break;
       case 'updateShader':
         updateShader();
         break;
       case 'loadShaderByID':
         loadShaderByID();
         break;
       case 'addVisitCount':
         addVisitCount();
         break;
       case 'getChannelCount':
         getChannelCount();
         break;
   }
?>