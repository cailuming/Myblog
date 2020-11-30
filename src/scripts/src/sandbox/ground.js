import {glUtils} from "../framework/glUtils.js"
import {Mesh} from '../framework/mesh.js';
import {MeshShader} from '../../shader/shader_mesh.js';
import {CommonShader} from '../../shader/shader_common.js';
import { Resource } from "../framework/resource.js";
import { math3D } from "../framework/math.js";
class Ground
{
   constructor(v){
     this.matTrans =[];
     this.matRotate=[]; 
     this.matModel =[];

     math3D.identityMatrix(this.matModel);
     this.uTexture =glUtils.gl.createTexture();
     this.normTexture =glUtils.gl.createTexture();
     this.roughTexture =glUtils.gl.createTexture();
     this.aoTexture =glUtils.gl.createTexture();

     this.vertexBuffer  =null;
 
   }
   //screen just specify the fragment shader,it is not neccessary to change the vertexshader
   init(){
       this.mesh = new Mesh();
       this.mesh.initByData({vs:CommonShader.vertexShader_3d_es,ps:CommonShader.pbr_pixelShader+MeshShader.pixelShader},Resource.resourceList.ground);
    
       glUtils.loadTextureByData(this.uTexture,Resource.resourceList.ground_base);
       glUtils.loadTextureByData(this.normTexture,Resource.resourceList.ground_norm);
       glUtils.loadTextureByData(this.roughTexture,Resource.resourceList.ground_rough);
       glUtils.loadTextureByData(this.aoTexture,Resource.resourceList.ground_ao);
   
       this.mesh.setTexture(this.uTexture);
       this.mesh.setNormTexture(this.normTexture);
       this.mesh.setRoughTexture(this.roughTexture);
       this.mesh.setAOTexture(this.aoTexture);
       this.mesh.setMaterialColor([5,5,6],[0.31,0.31,0.32],0.1,120);
       this.mesh.trans([0,-1,0]);
       this.mesh.scale3(1,2,1);
   }

   setModelMatrices(mat){
       this.mesh.setParentTransform(mat);    
   }

   render(timestamp,isdepth){
       this.setModelMatrices(this.matModel);
       this.mesh.render(timestamp,isdepth);
   }
  
}
export { Ground };