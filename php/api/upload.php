<?php
    require("sqlconnect.php");
    header('Content-Type:application/json');
    header('Access-Control-Allow-Origin:*'); // *代表允许任何网址请求
    header('Access-Control-Allow-Methods:POST,GET,OPTIONS,DELETE'); // 允许请求的类型
    header('Access-Control-Allow-Credentials: false'); // 设置是否允许发送 cookies
    header('Access-Control-Allow-Headers: Content-Type,Content-Length,Accept-Encoding,X-Requested-with, Origin'); // 设置允许自定义请求头的字段
    
    $data = file_get_contents('php://input');
    $id = $_GET['id'];
    $base_url = $_GET['base_url'];
   
    $ret = array();
    if($data!=null){
        $myfile = fopen(sprintf("../img/shader_cover_%d.jpg",$id), "w") or die("Unable to open file!");
        fwrite($myfile,$data);
        fclose($myfile);
        trun_y(sprintf("../img/shader_cover_%d.jpg",$id));
        init_sql();
        $result = doSql(sprintf('update cases set cover_url=\'%s../img/shader_cover_%d.jpg\' where id=%d', $base_url,$id,$id));
        if(!$result){
           $ret['code'] = 400;
           $ret['msg'] = "failed to create the screenshot!";
           echo json_encode($ret);  
        }
    }

    function trun_y($filename){
        $back = imagecreatefromjpeg($filename);
  
         $width = imagesx($back); 
         $height = imagesy($back);
  
         //创建一个新的图片资源，用来保存沿Y轴翻转后的图片
         $new = imagecreatetruecolor($width, $height);
         //沿y轴翻转就是将原图从右向左按一个像素宽度向新资源中逐个复制
         for($y=0 ;$y<$height; $y++){
             //逐条复制图片本身高度，1个像素宽度的图片到薪资源中
            imagecopy($new, $back,0, $height-$y-1, 0, $y, $width,1);
         }
  
         //保存翻转后的图片
         imagejpeg($new,$filename);
         imagedestroy($back);
         imagedestroy($new);
    }
?>
 
