<?php
 
   static  $servername = "localhost";
   static  $db_username = "webuser";
   static  $db_password = "cailuming518";
   static  $dbname = "webuser";
   //static  $servername = "localhost";
   // static  $db_username = "root";
   // static  $db_password = "123456";
   // static  $dbname = "blog";
   static  $conn = null;
   function init_sql(){
   // 创建连接
      global $conn;
      global $servername;
      global $db_username;
      global $db_password;
      global $dbname;
      if($conn==null){
         $conn = new mysqli($servername, $db_username, $db_password,$dbname);
      }
   // 检测连接
      if ($conn->connect_error) {
         die("连接失败: " . $conn->connect_error);
      }
      $conn->query("set names utf8");
     
      // printf("连接成功");
   }

   function doSql($sql){
      global $conn;
      $result = $conn->query($sql);
      if(!$result) { $retJson['error'] = $conn->error; return $retJson;}
      return $result; 
   }

   function deinit(){
      global $conn;
      mysqli_close($conn);
   }
 
?>