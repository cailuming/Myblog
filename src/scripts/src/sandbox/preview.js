import {glUtils} from "./glUtils.js.js"
import {Quad} from './quad.js';
import {MeshShader} from '../shader/shader_mesh.js';
import { math3D } from "../framework/math.js";
//显示在正交投影上的图片
class Preview
{
   constructor(){
     this.matTrans =[];
     this.matScale=[]; 
     this.matModel =[];
     this.matInter=[]; 
     this.matRotate=[];
     this.matIdentity=[];
     this.posX = 0;
     this.scale = 0;
     this.state =0;
     math3D.identityMatrix(this.matTrans);
     math3D.identityMatrix(this.matScale);
     math3D.identityMatrix(this.matModel);
     math3D.identityMatrix(this.matIdentity);
   }
   //screen just specify the fragment shader,it is not neccessary to change the vertexshader
   init(){
       this.quad = new Quad();
       this.quad.init("../media/textures/prompt.png");
       this.quad.trans([0,-0.4,0]);
    }

   show(){
      if(this.scale<=1.0){
        this.scale+=0.05;
      }else{
        this.state=2; 
      }
   } 

   hide(){
      if(this.scale>=0.05){
        this.scale-=0.05;
      }else{
        this.state=0; 
        this.scale=0;
      }
   }
   updateState(){
        if(this.state==1){
            this.show();
        }else if(this.state>=2 &&this.state<=100){
            this.state++;
        }else if(this.state==101){
            this.hide();
        }
       
       this.quad.scale2(0.6*this.scale,-0.08*this.scale);
   }

   showTips(){
      this.state =1;
      this.scale =0;
   }

   render(timestamp){
      
       this.updateState();
       glUtils.gl.disable(glUtils.gl.DEPTH_TEST);
       this.quad.render(timestamp);
       glUtils.gl.enable(glUtils.gl.DEPTH_TEST);
   }
  
}
export { Preview };