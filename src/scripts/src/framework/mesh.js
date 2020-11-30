import {glUtils} from "./glUtils.js"
import {math3D} from "./math.js"
 
import {ObjectModel} from "./model_obj.js"
import {DepthShader} from "../../shader/shader_depth.js"
import {global} from './global.js';
class Mesh
{
   constructor(v){
     this.matTrans =[];
     this.matRotateX=[]; 
     this.matRotateY=[];
     this.matRotateZ=[];
     this.matRotateHelper=[];
     this.matRotate=[];
     this.matScaleI=[];
     this.matScale=[];
     this.matTR =[];
     this.matModel =[];
     this.vertexBuffer  =null;
     this.isInstanced = false;
     this.stride = 1;
     this.alphaLimit=1; 
     math3D.identityMatrix(this.matRotate);
     math3D.identityMatrix(this.matRotateX);
     math3D.identityMatrix(this.matRotateY);
     math3D.identityMatrix(this.matRotateZ);
     math3D.identityMatrix(this.matTrans);
     math3D.identityMatrix(this.matModel);
     math3D.identityMatrix(this.matScale);
   
     this.uTexture =null;
     this.normTexture =null;
     this.roughTexture =null;
     this.aoTexture =null;
     this.setMaterialColor([5,5,5],[0.31,0.31,0.32],0.1,60);
   }

   initByData(shader,meshData){
      this.InitRenderShader(shader);
      this.InitDepthShader(DepthShader);
      this.model = new ObjectModel();
      this.model.loadDirectData(meshData);
      this.createBuffer();   
   }

   setParentTransform(mat){
     math3D.mul_Matrix_Matrix(this.matRotateHelper,this.matRotateX,this.matRotateY);
     math3D.mul_Matrix_Matrix(this.matRotate,this.matRotateHelper,this.matRotateZ);
     math3D.mul_Matrix_Matrix(this.matScaleI,this.matRotate,this.matScale);
     math3D.mul_Matrix_Matrix(this.matTR,this.matTrans,this.matScaleI);
    
     math3D.mul_Matrix_Matrix(this.matModel,mat,this.matTR);
   }
   rotateX(off){
      math3D.rotateXMatrix(this.matRotateX,off);
   }

   rotateZ(off){
      math3D.rotateZMatrix(this.matRotateZ,off);
   }

   rotateY(off){
      math3D.rotateYMatrix(this.matRotateY,off);
   }

   trans(pos){
      math3D.transMatrix(this.matTrans,pos);
   }

   scale(s){
      math3D.scaleMatrix(this.matScale,[s,s,s]);
   }

   scale3(s1,s2,s3){
      math3D.scaleMatrix(this.matScale,[s1,s2,s3]);
   }

   setModelMatrix(mat){
     this.matModel = mat;
   }

   setTexture(texture){
      this.uTexture = texture;
   }

   setRoughTexture(tex){
      this.roughTexture =tex;
   }

   setNormTexture(tex){
      this.normTexture =tex;
   }

   setAOTexture(tex){
      this.aoTexture =tex;
   }

   setMaterialColor(diffc,specc,r,stride){
      this.specColor = specc;
      this.diffuseColor = diffc;
      this.roughness = r;
      this.stride = stride;
   }
   createBuffer(){
       this.vertexBuffer =glUtils.gl.createBuffer();
       glUtils.wirteDataBuffer(this.vertexBuffer,this.model.layout);
   }

   setAlphaLimit(a){
       this.alphaLimit = a;
   }

   InitRenderShader(shader){

      const shaderProgram = glUtils.createShaderProgram(shader.vs,shader.ps,function(str){
          console.log("err shader is "+str);
      });
      if(!shaderProgram){
        this.renderShader = null;
        return null;
      }
      
      this.renderShader = {
        program: shaderProgram,
        stride:32,
        attribLocations:
        {
          aVerLocation:glUtils.gl.getAttribLocation(shaderProgram, 'aPos'),
          aTexLocation:glUtils.gl.getAttribLocation(shaderProgram, 'aTex'),
          aNormLocation:glUtils.gl.getAttribLocation(shaderProgram, 'aNorm'),
        },
        uniformLocations:{
          iTime:         glUtils.gl.getUniformLocation(shaderProgram, "iTime"),
          fLimit:        glUtils.gl.getUniformLocation(shaderProgram, 'fLimit'),
          roughness  :   glUtils.gl.getUniformLocation(shaderProgram, 'roughness'),
          texstride  :   glUtils.gl.getUniformLocation(shaderProgram, 'stride'),
          iResolution:   glUtils.gl.getUniformLocation(shaderProgram, 'iResolution'),
          specColor:     glUtils.gl.getUniformLocation(shaderProgram, 'specColor'),
          diffuseColor:  glUtils.gl.getUniformLocation(shaderProgram, 'diffuseColor'),
          lightpos:      glUtils.gl.getUniformLocation(shaderProgram, 'lightpos'),
          
          uTexture:      glUtils.gl.getUniformLocation(shaderProgram, 'uTexture'),
          normTexture:   glUtils.gl.getUniformLocation(shaderProgram,'normTexture'),
          roughTexture:  glUtils.gl.getUniformLocation(shaderProgram,'roughTexture'),
          aoTexture:     glUtils.gl.getUniformLocation(shaderProgram,'aoTexture'),
          depthTexture:  glUtils.gl.getUniformLocation(shaderProgram,'depthTexture'),
         
          camPos:        glUtils.gl.getUniformLocation(shaderProgram, 'camPos'),
          alpha:         glUtils.gl.getUniformLocation(shaderProgram, 'alpha'),
          matProj:       glUtils.gl.getUniformLocation(shaderProgram, 'matProj'),
          matModel :     glUtils.gl.getUniformLocation(shaderProgram, 'matModel'),
          matCamera:     glUtils.gl.getUniformLocation(shaderProgram, 'matCamera'),
          matLightView:  glUtils.gl.getUniformLocation(shaderProgram, 'matLightView'),
        },
      };
  }

  InitDepthShader(shader){

   const shaderProgram = glUtils.createShaderProgram(shader.vertexShader,shader.pixelShader,function(str){
       console.log("err shader is "+str);
   });
   if(!shaderProgram){
     this.depthShader = null;
     return null;
   }
   
   this.depthShader = {
     program: shaderProgram,
     stride:32,
     attribLocations:
     {
       aVerLocation:glUtils.gl.getAttribLocation(shaderProgram, 'aPos'),
       aTexLocation:glUtils.gl.getAttribLocation(shaderProgram, 'aTex'),
       aNormLocation:glUtils.gl.getAttribLocation(shaderProgram, 'aNorm'),
     },
     uniformLocations:{
       matProj:       glUtils.gl.getUniformLocation(shaderProgram, 'matProj'),
       matModel :     glUtils.gl.getUniformLocation(shaderProgram, 'matModel'),
       matLightView:  glUtils.gl.getUniformLocation(shaderProgram, 'matLightView'),
     },
   };
}

renderDepth(){
   glUtils.gl.useProgram(this.depthShader.program);
   glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER, this.vertexBuffer);
   glUtils.gl.vertexAttribPointer(this.depthShader.attribLocations.aVerLocation,3, glUtils.gl.FLOAT,false,this.depthShader.stride,0);
   glUtils.gl.enableVertexAttribArray(this.depthShader.attribLocations.aVerLocation);
   
   glUtils.gl.vertexAttribPointer(this.depthShader.attribLocations.aNormLocation, 3, glUtils.gl.FLOAT, true,this.depthShader.stride, 12);
   glUtils.gl.enableVertexAttribArray(this.depthShader.attribLocations.aNormLocation);

   glUtils.gl.vertexAttribPointer(this.depthShader.attribLocations.aTexLocation, 2, glUtils.gl.FLOAT,true,this.depthShader.stride,24);
   glUtils.gl.enableVertexAttribArray(this.depthShader.attribLocations.aTexLocation);
   

   glUtils.gl.uniformMatrix4fv(this.depthShader.uniformLocations.matModel,false,this.matModel);
   glUtils.gl.uniformMatrix4fv(this.depthShader.uniformLocations.matProj,false,global.matProj);
   glUtils.gl.uniformMatrix4fv(this.depthShader.uniformLocations.matLightView,false,global.matLightView);

   glUtils.gl.drawArrays(glUtils.gl.TRIANGLES, 0, this.model.triangleNum);
}

renderColor(timestamp){
   glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER, this.vertexBuffer);
   glUtils.gl.vertexAttribPointer(this.renderShader.attribLocations.aVerLocation,3, glUtils.gl.FLOAT,false,this.renderShader.stride,0);
   glUtils.gl.enableVertexAttribArray(this.renderShader.attribLocations.aVerLocation);
   
   glUtils.gl.vertexAttribPointer(this.renderShader.attribLocations.aNormLocation, 3, glUtils.gl.FLOAT, true,this.renderShader.stride, 12);
   glUtils.gl.enableVertexAttribArray(this.renderShader.attribLocations.aNormLocation);

   glUtils.gl.vertexAttribPointer(this.renderShader.attribLocations.aTexLocation, 2, glUtils.gl.FLOAT,true,this.renderShader.stride,24);
   glUtils.gl.enableVertexAttribArray(this.renderShader.attribLocations.aTexLocation);

   glUtils.gl.useProgram(this.renderShader.program);

   if(this.uTexture){
      glUtils.gl.activeTexture(glUtils.gl.TEXTURE0);
      glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,this.uTexture);
      glUtils.gl.uniform1i(this.renderShader.uniformLocations.uTexture, 0);
   }

   if(this.normTexture){
      glUtils.gl.activeTexture(glUtils.gl.TEXTURE1);
      glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,this.normTexture);
      glUtils.gl.uniform1i(this.renderShader.uniformLocations.normTexture, 1);
   }

   if(this.roughTexture){
      glUtils.gl.activeTexture(glUtils.gl.TEXTURE2);
      glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,this.roughTexture);
      glUtils.gl.uniform1i(this.renderShader.uniformLocations.roughTexture, 2);
   }

   if(this.aoTexture){
      glUtils.gl.activeTexture(glUtils.gl.TEXTURE3);
      glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,this.aoTexture);
      glUtils.gl.uniform1i(this.renderShader.uniformLocations.aoTexture, 3);
   }

   glUtils.gl.activeTexture(glUtils.gl.TEXTURE4);
  
   glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,global.depthTexture);
   glUtils.gl.uniform1i(this.renderShader.uniformLocations.depthTexture, 4);
  
   glUtils.gl.uniform1f(this.renderShader.uniformLocations.iTime, timestamp / 1000);
   glUtils.gl.uniform2f(this.renderShader.uniformLocations.iResolution,window.innerWidth,window.innerHeight);
   glUtils.gl.uniform1f(this.renderShader.uniformLocations.alpha,1);
   glUtils.gl.uniform1f(this.renderShader.uniformLocations.roughness,this.roughness);
   glUtils.gl.uniform1f(this.renderShader.uniformLocations.texstride,this.stride);

   glUtils.gl.uniform3f(this.renderShader.uniformLocations.camPos,global.matView[3],global.matView[7],global.matView[11]);
   glUtils.gl.uniform3f(this.renderShader.uniformLocations.specColor,this.specColor[0],this.specColor[1],this.specColor[2]);
   glUtils.gl.uniform3f(this.renderShader.uniformLocations.diffuseColor,this.diffuseColor[0],this.diffuseColor[1],this.diffuseColor[2]);
   glUtils.gl.uniform3f(this.renderShader.uniformLocations.lightpos,global.lightpos[0],global.lightpos[1],global.lightpos[2]);

   glUtils.gl.uniformMatrix4fv(this.renderShader.uniformLocations.matModel,false,this.matModel);
   glUtils.gl.uniformMatrix4fv(this.renderShader.uniformLocations.matProj,false,global.matProj);
   glUtils.gl.uniformMatrix4fv(this.renderShader.uniformLocations.matCamera,false,global.matView);
   glUtils.gl.uniformMatrix4fv(this.renderShader.uniformLocations.matLightView,false,global.matLightView);
   
   glUtils.gl.drawArrays(glUtils.gl.TRIANGLES, 0, this.model.triangleNum);
  
   this.detachTexture();
}

detachTexture(){
   glUtils.gl.activeTexture(glUtils.gl.TEXTURE0);
   glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,null);

   glUtils.gl.activeTexture(glUtils.gl.TEXTURE1);
   glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,null);

   glUtils.gl.activeTexture(glUtils.gl.TEXTURE2);
   glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,null);

   glUtils.gl.activeTexture(glUtils.gl.TEXTURE3);
   glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,null);

   glUtils.gl.activeTexture(glUtils.gl.TEXTURE4);
   glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,null);
}

render(timestamp,isdepth){
   // Tell WebGL how to pull out the positions from the position
   // buffer into the vertexPosition attribute
   if(!this.vertexBuffer) return ;
  
   if(isdepth){
      this.renderDepth();
   }else{
      this.renderColor(timestamp);
   }
}
  
}
export { Mesh };