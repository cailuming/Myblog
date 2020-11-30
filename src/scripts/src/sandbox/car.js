 
import {math3D} from "../framework/math.js"
import {MeshShader} from '../shader/shader_mesh.js';
import {CommonShader} from '../shader/shader_common.js';
import {Mesh} from "./mesh.js.js"
import { Resource } from "./resource.js.js";
class Car
{
   constructor(v){
     this.matTrans =[];
     this.matRotate=[]; 
     this.matScale=[];
     this.matInter=[];
      
     this.matModel =[];
     this.vertexBuffer  =null;
     this.alphaLimit = 1; 
     this.moveSpeed  = 0.15;
     this.LimitSpeed = 0.3;
     this.AccSpeed = 0.01;
     this.BreakState = 0;
     this.turnSpeed =this.moveSpeed/13;
     this.pos = [0, 0, -3];
     this.rot =0;
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
       this.mesh_tire_FLA = new Mesh();
       this.mesh_tire_FRA = new Mesh();
       this.mesh_tire_FLB = new Mesh();
       this.mesh_tire_FRB = new Mesh();
       
       this.mesh_tire_BackA = new Mesh();
       this.mesh_tire_BackB = new Mesh();
       this.mesh_glass = new Mesh();
       this.mesh_light = new Mesh();
       this.mesh_body    = new Mesh();
 
       this.mesh_tire_FLA.setMaterialColor([3.9, 3.9, 3.9], [0.01, 0.01, 0.01], 0.08, 1);
       this.mesh_tire_FRA.setMaterialColor([3.9, 3.9, 3.9], [0.01, 0.01, 0.01], 0.08, 1);
       this.mesh_tire_FLB.setMaterialColor([0.9, 0.9, 0.9], [0.1, 0.1, 0.1], 0.85, 1);
       this.mesh_tire_FRB.setMaterialColor([0.9, 0.9, 0.9], [0.1, 0.1, 0.1], 0.85, 1);
       
       this.mesh_tire_BackA.setMaterialColor([3.9, 3.9, 3.9], [0.01, 0.01, 0.01], 0.08, 1);
       this.mesh_tire_BackB.setMaterialColor([0.9, 0.9, 0.9], [0.1, 0.1, 0.1], 0.85, 1);
       this.mesh_light.setMaterialColor([1, 1, 1], [0.1, 0.1, 0.1], 0.45, 1);
       this.mesh_body.setMaterialColor([3.9, 1.9, 1.3], [0.11, 0.05, 0.01], 0.15, 1);
       this.mesh_glass.setMaterialColor([1, 1, 1], [0.1, 0.1, 0.1], 0.45, 1);

       this.shaderObj = {vs:CommonShader.vertexShader_3d_es, ps:CommonShader.pbr_pixelShader+MeshShader.pixelShader};
       this.mesh_tire_FLA.initByData( this.shaderObj, Resource.resourceList.car_tire_LF_A);
       this.mesh_tire_FRA.initByData( this.shaderObj, Resource.resourceList.car_tire_RF_A);
       this.mesh_tire_FLB.initByData( this.shaderObj, Resource.resourceList.car_tire_LF_B);
       this.mesh_tire_FRB.initByData( this.shaderObj, Resource.resourceList.car_tire_RF_B);
       
       this.mesh_tire_BackA.initByData( this.shaderObj, Resource.resourceList.car_back_tiresA);
       this.mesh_tire_BackB.initByData( this.shaderObj, Resource.resourceList.car_back_tiresB);
       this.mesh_light.initByData( this.shaderObj, Resource.resourceList.car_light);
       this.mesh_body.initByData( this.shaderObj, Resource.resourceList.car_body);
       this.mesh_glass.initByData( this.shaderObj, Resource.resourceList.car_glass);
       this.setModelTransform(this.pos, this.rot);
   }
   setCollisionTarget(target){
       this.screenList = target;
   }
   setModelTransform(pos, rot){
      math3D.scaleMatrix(this.matScale, [0.5, 0.5, 0.5]);
      math3D.transMatrix(this.matTrans, pos);
      math3D.rotateYMatrix(this.matRotate, rot);
      math3D.mul_Matrix_Matrix(this.matInter, this.matRotate, this.matScale);
      math3D.mul_Matrix_Matrix(this.matModel, this.matTrans, this.matInter);
     
      this.mesh_tire_FLA.trans([3.09, 0.43, -1.1]); 
      this.mesh_tire_FRA.trans([3.09, 0.43, 1.1]); 
      this.mesh_tire_FLB.trans([3.09, 0.43, -1.1]); 
      this.mesh_tire_FRB.trans([3.09, 0.43, 1.1]); 
      this.mesh_tire_BackA.trans([0, 0.43, 0]); 
      this.mesh_tire_BackB.trans([0, 0.43, 0]); 
      this.mesh_body.trans([1.54, 0, 0]); 
      this.mesh_glass.trans([1.54, 0, 0]); 
      this.mesh_light.trans([1.54, 0, 0]); 
     
      this.mesh_tire_FLA.setParentTransform(this.matModel); 
      this.mesh_tire_FRA.setParentTransform(this.matModel); 
      this.mesh_tire_FLB.setParentTransform(this.matModel); 
      this.mesh_tire_FRB.setParentTransform(this.matModel); 
      
      this.mesh_tire_BackA.setParentTransform(this.matModel); 
      this.mesh_tire_BackB.setParentTransform(this.matModel); 
      this.mesh_glass.setParentTransform(this.matModel); 
      this.mesh_light.setParentTransform(this.matModel); 
      this.mesh_body.setParentTransform(this.matModel); 

   }
 
   moveWithCollision(strait){
      this.centerPos[0] = this.pos[0]+this.dir[0]*1.5;
      this.centerPos[1] = this.pos[1]+this.dir[1]*1.5;
      this.centerPos[2] = this.pos[2]+this.dir[2]*1.5;
      
      this.screenList.matModelsArray.forEach((element, index) => {
         if(math3D.len([
            this.centerPos[0]+this.dir[0]*this.moveSpeed*strait-element[3], 
            this.centerPos[1]+this.dir[1]*this.moveSpeed*strait-element[7], 
            this.centerPos[2]+this.dir[2]*this.moveSpeed*strait-element[11], 
         ])<1.6){
            strait = 0;
            this.screenList.toggleSelect(index);
         }
      });
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
   
   rollTires(t){
      if(this.key.up){
         this.mesh_tire_FLA.rotateZ(-t/60); 
         this.mesh_tire_FRA.rotateZ(-t/60); 
         this.mesh_tire_FLB.rotateZ(-t/60); 
         this.mesh_tire_FRB.rotateZ(-t/60); 
         this.mesh_tire_BackA.rotateZ(-t/60); 
         this.mesh_tire_BackB.rotateZ(-t/60); 
      }else if(this.key.down){
         this.mesh_tire_FLA.rotateZ(t/60); 
         this.mesh_tire_FRA.rotateZ(t/60); 
         this.mesh_tire_FLB.rotateZ(t/60); 
         this.mesh_tire_FRB.rotateZ(t/60); 
         this.mesh_tire_BackA.rotateZ(t/60); 
         this.mesh_tire_BackB.rotateZ(t/60); 
      }
   }
   turnTire(off){
      
      if(this.tireRot<off-this.tireTurnSpeed){
         this.tireRot+=this.tireTurnSpeed;
      }

      if(this.tireRot>off+this.tireTurnSpeed){
         this.tireRot-=this.tireTurnSpeed;
      }

      this.mesh_tire_FLA.rotateY(this.tireRot); 
      this.mesh_tire_FRA.rotateY(this.tireRot); 
      this.mesh_tire_FLB.rotateY(this.tireRot); 
      this.mesh_tire_FRB.rotateY(this.tireRot); 
   }

   resetKey(){
      this.key.up=false;
      this.key.down=false;
      this.key.left=false;
      this.key.right=false;
   }
   onKey()
   {
      //this.moveDelay();
      if(this.key.up){
         this.moveWithCollision(1); 
         // this.move(1);
      }else if(this.key.down){
         this.moveWithCollision(-1)
      //     this.move(-1);
      }
       
      if(this.key.left){
         if(this.key.up){
            this.turn(1)
         }else if(this.key.down){
            this.turn(-1)
         } 
         this.turnTire(Math.PI/4);
      }else if(this.key.right){
         if(this.key.up){
            this.turn(-1) 
            
         }else if(this.key.down){
            this.turn(1)
         } 
         this.turnTire(-Math.PI/4);
      }

      if(!this.key.left&&!this.key.right){
         this.turnTire(0);
      }
   }
   
   dragCamera(){ 
      this.Camera.follow(this.pos, 15, 0.1);
   }

   render(timestamp, isdepth){
      this.onKey();
     
      this.dragCamera();
      
      this.rollTires(timestamp);
      this.setModelTransform(this.pos, this.rot+ Math.PI*0.5);
      this.mesh_tire_FLA.render(timestamp, isdepth); 
      this.mesh_tire_FRA.render(timestamp, isdepth); 
      this.mesh_tire_FLB.render(timestamp, isdepth); 
      this.mesh_tire_FRB.render(timestamp, isdepth); 
      
      this.mesh_tire_BackA.render(timestamp, isdepth); 
      this.mesh_tire_BackB.render(timestamp, isdepth); 
      this.mesh_glass.render(timestamp, isdepth); 
      this.mesh_light.render(timestamp, isdepth); 
      this.mesh_body.render(timestamp, isdepth); 
    
   }
}
export { Car };