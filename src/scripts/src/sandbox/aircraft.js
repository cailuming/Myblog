 
import {math3D} from "../framework/math.js"
import {MeshShader} from '../../shader/shader_mesh.js';
import {CommonShader} from '../../shader/shader_common.js';
import {Mesh} from "../framework/mesh.js"
import { Resource } from "../framework/resource.js";
class Aircraft
{
   constructor(v){
     this.matTrans =[];
     this.matRotate=[]; 
     this.matRotate1=[]; 
     this.matRotate2=[]; 
     this.matScale=[];
     this.matInter=[];
      
     this.matModel =[];
     this.vertexBuffer  =null;
     this.alphaLimit = 1; 
     this.moveSpeed  = 0.1;
     this.LimitSpeed = 0.3;
     this.AccSpeed = 0.01;
     this.BreakState = 0;
     this.turnSpeed =this.moveSpeed/13;
     this.pos = [0, 5, -8];
     this.rot =0;
     this.rotp =0;
     this.tireRot=0;
     this.tireTurnSpeed=0.1;
     this.dir = [0, 0, 1];
     this.anchor_dir = [0, 0, 1];
     this.centerPos = [0, 0, 2.5, 0];
     this.centerPosAnchor = [0, 0, 2.5, 0];
     this.key = {up:false, down:false, left:false, right:false, state:0};
   }
  
   init(camera){
       this.Camera = camera;
       this.mesh   = new Mesh();
       this.mesh.setMaterialColor([3, 4, 5], [0.1, 0.1, 0.3], 0.45, 1);
       this.shaderObj = {vs:CommonShader.vertexShader_3d_es, ps:CommonShader.pbr_pixelShader+MeshShader.pixelShader};
       this.mesh.initByData( this.shaderObj, Resource.resourceList.aircraft);
       this.setModelTransform(this.pos, this.rot);
   }
   setCollisionTarget(target){
       this.screenList = target;
   }
   setModelTransform(pos, rot, rotp){
      math3D.scaleMatrix(this.matScale, [1.5, 1.5, 1.5]);
      math3D.transMatrix(this.matTrans, pos);
      math3D.rotateYMatrix(this.matRotate1, rot);
      math3D.rotateZMatrix(this.matRotate2, rotp);
      math3D.mul_Matrix_Matrix(this.matRotate, this.matRotate1, this.matRotate2);
      math3D.mul_Matrix_Matrix(this.matInter, this.matRotate, this.matScale);
      math3D.mul_Matrix_Matrix(this.matModel, this.matTrans, this.matInter);
     
      this.mesh.setParentTransform(this.matModel); 
   }
 
   moveWithCollision(strait){
      
      this.pos[0]+=this.dir[0]*this.moveSpeed*strait;
      this.pos[1]+=this.dir[1]*this.moveSpeed*strait;
      this.pos[2]+=this.dir[2]*this.moveSpeed*strait;
   }
   move(strait){
      this.pos[0]+=this.dir[0]*this.moveSpeed*strait;
      this.pos[1]+=this.dir[1]*this.moveSpeed*strait;
      this.pos[2]+=this.dir[2]*this.moveSpeed*strait;
   }

   turn(off){
      this.rot+=Math.PI*this.turnSpeed*off;
      this.dir[0]=this.anchor_dir[0]*Math.cos(this.rot)-this.anchor_dir[2]*Math.sin(this.rot); 
      this.dir[2]=this.anchor_dir[0]*Math.sin(this.rot)+this.anchor_dir[2]*Math.cos(this.rot);
   }

   pitch(off){
      if(this.rotp<off){
         this.rotp+= Math.abs(this.rotp-off)*0.1;
      }else if(this.rotp>off){
         this.rotp-= Math.abs(this.rotp-off)*0.1;
      }
   }
    
    
   float(timestamp){
      this.pos[1]+=Math.sin(timestamp*0.005)*0.003;
   }
 
   resetKey(){
      this.key.up=false;
      this.key.down=false;
      this.key.left=false;
      this.key.right=false;
   }
   onKey(timestamp)
   {
      //this.moveDelay();
      if(this.key.up){
         this.moveWithCollision(3); 
         // this.move(1);
      }else if(this.key.down){
         this.moveWithCollision(-3)
      //     this.move(-1);
      }
       
      if(this.key.left){
         if(this.key.up||this.key.down){
            this.turn(0.3);
            this.pitch(1);
         }
         
      }else if(this.key.right){
         if(this.key.up||this.key.down){
            this.turn(-0.3);
            this.pitch(-1);
         }
      }

      if(!this.key.left&&!this.key.right){
         this.float(timestamp);
         if(this.rotp>0){
            this.rotp-=this.rotp*0.05;
         }else if(this.rotp<0){
            this.rotp-=this.rotp*0.05;
         }
      }
   }
   
   dragCamera(){ 
      this.Camera.follow(this.pos, 5, 0.1);
   }

   render(timestamp, isdepth){
      this.onKey(timestamp);
      this.dragCamera();
      this.setModelTransform(this.pos, this.rot, this.rotp);
      this.mesh.render(timestamp, isdepth); 
   }
}
export { Aircraft };