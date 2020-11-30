<?php
 
   require("sqlconnect.php");
   header('Content-Type:application/json');
   header('Access-Control-Allow-Origin:*'); // *代表允许任何网址请求
   header('Access-Control-Allow-Methods:POST,GET,OPTIONS,DELETE'); // 允许请求的类型
   header('Access-Control-Allow-Credentials: false'); // 设置是否允许发送 cookies
   header('Access-Control-Allow-Headers: Content-Type,Content-Length,Accept-Encoding,X-Requested-with, Origin'); // 设置允许自定义请求头的字段

   function isLogin($uname){
        init_sql();
        $result = doSql(sprintf('select * from user where username = \'%s\' and islogin =\'%s\'',$uname,'true'));
        return $result;
   }
   
   function getChannelCount(){
        init_sql();
        $count = 0;
        
        $retJson = array();
        $result = doSql('select * from channels');
        if ($result&&$result->num_rows>0) {
            $retJson['data']=array();
            while($row = $result->fetch_assoc()) {
                $retJson['data'][$count] = array();
                $retJson['data'][$count]['id']    = $row['id'];
                $retJson['data'][$count]['url']   = $row['url'];
                $retJson['data'][$count]['title'] = $row['title'];
                $retJson['data'][$count++]['type']  = $row['type'];
            }
            $retJson['size'] = count($retJson['data']);
            $retJson['code']=200;
        }
        echo json_encode($retJson);
   }

   function getCaseCount(){
        init_sql();
        $count = 0;
        $retJson = array();
        $result = doSql('select * from cases where publish=\'true\'');
        if ($result->num_rows>0) {
            $retJson['data']=array();
            while($row = $result->fetch_assoc()) {
                $retJson['data'][$count] = array();
                $retJson['data'][$count]['id'] = $row['id'];
                $retJson['data'][$count]['cover_url'] = $row['cover_url'];
                $retJson['data'][$count]['viewcount'] = $row['viewcount'];
                $retJson['data'][$count]['author'] = $row['author'];
                $retJson['data'][$count]['createtime'] = $row['createtime'];
                $retJson['data'][$count++]['title'] = $row['title'];
            }
            $retJson['size'] = count($retJson['data']);
           
        }
        echo json_encode($retJson);
   }
   function getAllShaders(){
        init_sql();
        $count = 0;
        $retJson = array();
        $result = doSql('select * from shaders');
        if ($result->num_rows>0) {
            while($row = $result->fetch_assoc()) {
              $retJson[$count] = array();
              $retJson[$count]['id'] = $row['id'];
              $retJson[$count]['content'] = $row['content'];
              $retJson[$count]['creator'] = $row['creator'];
              $retJson[$count]['publish'] = $row['publish'];
              $retJson[$count]['createtime'] = $row['createtime'];
              $retJson[$count++]['title'] = $row['title'];
           }
           $retJson['size'] = count($retJson);
        }
        echo json_encode($retJson);
   }

   function updateShader(){
        $data =json_decode(file_get_contents('php://input'),true); 
        $content = $data['content'];
        $channels = $data['channels'];
        $username = $data['username'];
        $id = $data['id'];
        init_sql();

        $retJson = array();
        if(isLogin($username)){
         
            $result =doSql(sprintf('update cases set content = \'%s\',channels = \'%s\' where id=%d',$content,$channels,$id));
            if ($result) {
                $retJson['code']=200;
                $retJson['msg']= "update successfully!";
            }else{
                $retJson['code']=400;
                $retJson['msg']= "failed to save,please contact the administrator!";
            }
        }else{
            $retJson['code']=400;
            $retJson['msg']= "you are not login,please login first!";
        }
        echo json_encode($retJson);
   }

   function loadShaderByID(){
        init_sql();
     
        $id   = $_GET['id'];
        $retJson = array();
        $result = doSql(sprintf('select * from cases where id =%d',$id));
      
        if ($result) {
            $retJson['code']=200;
            $retJson['msg']= "load successfully!";
            $row = $result->fetch_assoc();
            $retJson['content']= $row['content'];
            $retJson['channels']= $row['channels'];
            $idArr = explode('_',$retJson['channels']);
           
            $result1 = doSql(sprintf('select * from channels where id =%d or id =%d or id =%d or id =%d'
            ,intval($idArr[0]),intval($idArr[1]),intval($idArr[2]),intval($idArr[3])));
            if($result1){
                $count = 0;
                $retJson['channelData'] = array();
                while($row = $result1->fetch_assoc()) {
                    $retJson['channelData'][$count] = array();
                    $retJson['channelData'][$count]['id'] = $row['id'];
                    $retJson['channelData'][$count]['type'] = $row['type'];
                    $retJson['channelData'][$count++]['url'] = $row['url'];
                 }    
            }     
        }else{
            $retJson['code']=400;
            $retJson['msg']= "failed to load shader,please retry!";
        }
        echo json_encode($retJson);
   }

   function addVisitCount(){
        init_sql();
        $id   = $_GET['id'];
        $retJson   = array();
        $result =doSql(sprintf('update cases set viewcount = viewcount + 1 where id=%d',$id));
        if ($result) {
            $retJson['code']=200;
            $retJson['msg']= "add successfully!";
        }else{
            $retJson['code']=400;
            $retJson['msg']= "failed to add view count";
        }
        echo json_encode($retJson);
   }
   
   function addShader(){
        $data =json_decode(file_get_contents('php://input'),true); 
        $username = $data['username'];
        $content = $data['content'];
        $channels = $data['channels'];
        $title = $data['title'];
        init_sql();
        $retJson = array();
        $loginData = isLogin($username);
        $createtime = date("Y-m-d");
        if($loginData&& $loginData->num_rows>0){
            $row = $loginData->fetch_assoc();

            $sql = sprintf('insert into cases(viewcount,content,author,publish,createtime,title,channels) values(%d,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')',1,$content,$row['nickname'],'true',$createtime,$title,$channels);
            $result = doSql($sql);
            $lastID = doSql('SELECT LAST_INSERT_ID() as shaderID');
            if ($result) {
                $retJson['code']=200;
                $retJson['shaderID']=$lastID->fetch_assoc()['shaderID'];
                $retJson['msg']= "add successfully!";
            }else{
                $retJson['code']=400;
                $retJson['msg']= "failed to save,please contact the administrator!";
            }
        }else{
            $retJson['code']=400;
            $retJson['msg']= "you are not login,please login first!";
        }
    
        echo json_encode($retJson);
  }
  
?>