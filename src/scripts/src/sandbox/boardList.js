import {glUtils} from "../framework/glUtils.js"
import {math3D} from "../framework/math.js"
 
import {LavaShader} from '../../shader/shader_lava.js';
import {CommonShader} from '../../shader/shader_common.js';
import {ObjectModel} from "../framework/model_obj.js"

import { Resource } from "../framework/resource.js";
import { Board } from "./board.js";

class BoardList
{
   constructor(v){
     this.matTrans =[];
     this.matRotate=[]; 
     this.matScale =[];
     this.matInter =[];
     this.matModels =[];
     this.matObjects=[];
     this.vertexBuffer  =null;
     this.isCompleted=false;
    
     math3D.identityMatrix(this.matScale);
   }
   
   initTextures(){
      this.uTexture =glUtils.gl.createTexture();
      
      glUtils.loadTextureByData(this.uTexture, Resource.resourceList.ground_base);
       
      this.shellInstance.setTexture(this.uTexture);
      
   }

   init(){
     
       this.quadModel = new ObjectModel();
      // we just use our transform information of additional object, instance do not have any transform data 
       this.numInstances = 100;
       this.sliceMatrix();
     
       this.particle = new Board();
       this.quadModel.loadDirectData(Resource.resourceList.board);
       this.particle.init({vs:CommonShader.vertexShader_3d_2I, ps: glUtils.packQuadShader(LavaShader.pixelShader)}, this.quadModel);
       this.particle.createInstanceData(this.numInstances, this.matModels);
 
      // this.initTextures();
  }

  sliceMatrix(){
    this.matModels = new ArrayBuffer(this.numInstances*64);
    this.matModelsArray = [];
    for(var i=0;i<this.numInstances;i++){
         this.matModelsArray.push(new Float32Array(this.matModels, i*64, 16));
         this.matObjects[i] = {matTrans:[], matScale:[], matRotate:[]};
         math3D.identityMatrix(this.matObjects[i].matScale);
         math3D.identityMatrix(this.matModelsArray[i]);
         math3D.transMatrix(this.matObjects[i].matTrans, 
          [
            Math.random()*20, 
            Math.random()*50, 
            Math.random()*20+30]); 
    }
    this.updateMatrixs();
  }
  
  updateMatrixs(timestamp){
      this.matModelsArray.forEach((element, index) => {
        math3D.rotateXMatrix(this.matObjects[index].matRotate, Math.PI*0.5);
        math3D.transMatrix(this.matObjects[index].matTrans, 
          [
            this.matObjects[index].matTrans[3], 
            this.matObjects[index].matTrans[7], 
            this.matObjects[index].matTrans[11]]); 
        math3D.mul_Matrix_Matrix(this.matInter, this.matObjects[index].matRotate, this.matObjects[index].matScale);
        math3D.mul_Matrix_Matrix(element, this.matObjects[index].matTrans, this.matInter);
      });
  }
  
  render(timestamp, isdepth){
   
     //this.updateMatrixs(timestamp);
    
     this.particle.render(timestamp, isdepth);
    
  }
}
export { BoardList };