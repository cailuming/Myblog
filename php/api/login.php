<?php
  
   require("sqlconnect.php");
   require("utils.php");
   header('Content-Type:application/json; charset=utf-8');
   header('Access-Control-Allow-Origin:*'); // *代表允许任何网址请求
   header('Access-Control-Allow-Methods:POST,GET,OPTIONS,DELETE'); // 允许请求的类型
   header('Access-Control-Allow-Credentials: false'); // 设置是否允许发送 cookies
   header('Access-Control-Allow-Headers: Content-Type,Content-Length,Accept-Encoding,X-Requested-with, Origin'); // 设置允许自定义请求头的字段
   error_reporting(E_ALL ^ E_NOTICE);
   session_start(); 
    $type   = $_GET["type"];
    $username   = $_GET["username"];
    if($type=='login'){
        $password   = passCrypt($_GET["password"]);
        $verifycode = $_GET["verifycode"];
        login($username,$password,$verifycode);
    }else if($type=='logout'){
        logout($username);
    }else{
        verify($username);
    }

    function verify(){
      $width=200;
      $height=50;
      $string='';//定义变量保存字体，这个一定不能省，不然回报警告
      $img=imagecreatetruecolor($width, $height);//imagecreatetruecolor函数建一个真彩色图像
      $arr=array('a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9');
      //生成彩色像素    
      $colorBg=imagecolorallocate($img,rand(200,255),rand(200,255),rand(200,255));//背景     imagecolorallocate函数为一幅图像分配颜色
      //填充函数，xy确定坐标，color颜色执行区域填充颜色
      imagefill($img, 0, 0, $colorBg);
      /*	可省略
       * $colorBorder=imagecolorallocate($img,rand(200,255),rand(200,255),rand(200,255));//边框
       *imagerectangle($img,0,0,$width-1,$height-1,$colorBorder);
       */
      //该循环,循环画背景干扰的点
      for($m=0;$m<=100;$m++){
          $pointcolor=imagecolorallocate($img,rand(0,255),rand(0,255),rand(0,255));//点的颜色
          imagesetpixel($img,rand(0,$width-1),rand(0,$height-1),$pointcolor);// 水平地画一串像素点
      }
      //该循环,循环画干扰直线
      for ($i=0;$i<=4;$i++){
          $linecolor=imagecolorallocate($img,rand(0,255),rand(0,255),rand(0,255));//线的颜色
          imageline($img,rand(0,$width),rand(0,$height),rand(0,$width),rand(0,$height),$linecolor);//画一条线段
      }
      for($i=0;$i<4;$i++){
             $string.=$arr[rand(0,count($arr)-1)];
      }
      $colorString=imagecolorallocate($img,rand(10,100),rand(10,100),rand(10,100));//文本
      //2种插入字符串字体的方式
      //imgettftext($img,字体大小（数字）,角度（数字）,rand(5,15),rand(30,35),$colorString,'字体样式的路径',$string);
      imagestring($img,5,rand(0,$width-36),rand(0,$height-15),$string,$colorString);
      //输出图片到浏览器
   
      header('Content-Type: image/jpg');
      imagejpeg($img);
      //销毁，释放资源
      imagedestroy($img);
    }
    function login($username,$password,$verifycode){
        init_sql();
        $ret=array();
    
        $result = doSql(sprintf('select * from user where username = \'%s\' and password = \'%s\' and verifycode = \'%s\'',$username,$password,$verifycode));
       
        if ($result&&$result->num_rows>0) {
            $ret['code']=200;
            $ret['msg']="login successfull!";
            doSql(sprintf('update user set islogin = \'%s\' where username = \'%s\'','true',$username));
        }else{
            $ret["code"]=401;
            $ret['msg']="username or password incorrect!";
            $ret['password']= $password;
        }
        echo json_encode($ret) ;
   }

   function logout($username){
      init_sql();
      $ret=array();
      $result = doSql(sprintf('update user set islogin = \'%s\' where username = \'%s\'','false',$username));
      if ($result) {
        $ret['code']=200;
        $ret['msg']="logout successfull!";
      }else{
        $ret["code"]=401;
        $ret['msg']="logout failed!";
      }
      echo json_encode($ret) ;
  }
 
?>