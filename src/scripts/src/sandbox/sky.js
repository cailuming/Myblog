 
import {math3D} from "../framework/math.js"
import {SkyShader} from '../../shader/shader_sky.js';
import {Mesh} from "../framework/mesh.js"
import { Resource } from "../framework/resource.js";
class Sky
{
   constructor(v){
     this.matTrans =[];
     this.matRotate=[]; 
     this.matScale=[];
     this.matInter=[];
     this.matModel =[];
     this.alphaLimit=1; 
   }
  
   init(){
       this.mesh = new Mesh();
       this.mesh.initByData({vs:SkyShader.vertexShader,ps:SkyShader.pixelShader},Resource.resourceList.sky);
       this.setModelTransform([0,0,0],0);
   }
   
   setModelTransform(pos,rot){
      math3D.scaleMatrix(this.matScale,[5000,5000,5000]);
      math3D.transMatrix(this.matTrans,pos);
      math3D.rotateYMatrix(this.matRotate,rot);
      math3D.mul_Matrix_Matrix(this.matInter,this.matRotate,this.matScale);
      math3D.mul_Matrix_Matrix(this.matModel,this.matTrans,this.matInter);
      this.mesh.setParentTransform(this.matModel); 
   }
  
   render(timestamp){
      //this.setModelTransform(this.pos,this.rot+ Math.PI*0.5);
      this.mesh.render(timestamp); 
   }
}
export { Sky };