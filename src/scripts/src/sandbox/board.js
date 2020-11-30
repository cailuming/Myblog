import {glUtils} from "../framework/glUtils.js"
import {global} from '../framework/global.js';

class Board
{
   constructor(v){
     this.matTrans =[];
     this.matRotate=[]; 
     this.matModel =[];
     this.vertexBuffer  =null;
     this.uTexture =null;
   }
  
   init(shaderFile, model){
      this.InstanceModel = model;
      this.initRenderShader(shaderFile);
      this.createBuffer();     
   }
   
   initRenderShader(shader){
      const shaderProgram = glUtils.createShaderProgram(shader.vs, shader.ps, function(str){
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
            aVerLocation:glUtils.gl.getAttribLocation(shaderProgram,  'aPos'), 
            aTexLocation:glUtils.gl.getAttribLocation(shaderProgram,  'aTex'), 
            aNormLocation:glUtils.gl.getAttribLocation(shaderProgram,  'aNorm'), 
            aMatrixLocation:glUtils.gl.getAttribLocation(shaderProgram, 'aMatrix'), 
         }, 
         uniformLocations:{
            iTime:         glUtils.gl.getUniformLocation(shaderProgram,  "iTime"), 
            fLimit:        glUtils.gl.getUniformLocation(shaderProgram,  'fLimit'), 
            iResolution:   glUtils.gl.getUniformLocation(shaderProgram,  'iResolution'), 
            specColor:     glUtils.gl.getUniformLocation(shaderProgram,  'specColor'), 
            diffuseColor:  glUtils.gl.getUniformLocation(shaderProgram,  'diffuseColor'), 
            lightpos:      glUtils.gl.getUniformLocation(shaderProgram,  'lightpos'), 
            uTexture:      glUtils.gl.getUniformLocation(shaderProgram,  'uTexture'), 
            dTexture:      glUtils.gl.getUniformLocation(shaderProgram,  'dTexture'), 
            camPos:        glUtils.gl.getUniformLocation(shaderProgram,  'camPos'), 
            alpha:         glUtils.gl.getUniformLocation(shaderProgram,  'alpha'), 
            matProj:       glUtils.gl.getUniformLocation(shaderProgram,  'matProj'), 
            matModel :     glUtils.gl.getUniformLocation(shaderProgram,  'matModel'), 
            matCamera:     glUtils.gl.getUniformLocation(shaderProgram,  'matCamera'), 
         }, 
      };
   }

  createBuffer(){
    this.dvao = glUtils.gl.createVertexArray();
    this.rvao = glUtils.gl.createVertexArray();
    this.vertexBuffer = glUtils.createQuadVertexBuffer();
    glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER, this.vertexBuffer);
    glUtils.wirteDataBuffer(this.vertexBuffer, this.InstanceModel.layout);
  }

  createInstanceData(numInstances, matModels){
      this.matrixData =matModels;
      this.numInstances = numInstances;
      this.matrixBuffer = glUtils.createVertexBufferBySize(matModels.byteLength);
      this.enableVertexAttrib();
   }
   
   enableVertexAttrib(){
      
      glUtils.gl.bindVertexArray(this.rvao);
      this.enableVertexAttribByShader(this.renderShader);
      glUtils.gl.bindVertexArray(null);
    
   }
   enableVertexAttribByShader(shader){
        //after write the data to the buffer, we need to tell gl the attributes
      glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER, this.vertexBuffer);

      glUtils.gl.enableVertexAttribArray(shader.attribLocations.aVerLocation);
      glUtils.gl.vertexAttribPointer(shader.attribLocations.aVerLocation, 3, glUtils.gl.FLOAT, false, shader.stride, 0);
      glUtils.gl.enableVertexAttribArray(shader.attribLocations.aNormLocation);
      glUtils.gl.vertexAttribPointer(shader.attribLocations.aNormLocation, 3, glUtils.gl.FLOAT, false, shader.stride, 12);
   
      glUtils.gl.enableVertexAttribArray(shader.attribLocations.aTexLocation);
      glUtils.gl.vertexAttribPointer(shader.attribLocations.aTexLocation, 2, glUtils.gl.FLOAT, false, shader.stride, 24);

      //4 floats per attributes
      //And assign the matrix attributes
      glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER, this.matrixBuffer);
      glUtils.gl.enableVertexAttribArray(shader.attribLocations.aMatrixLocation+0);
      glUtils.gl.vertexAttribPointer(shader.attribLocations.aMatrixLocation+0, 4, glUtils.gl.FLOAT, false, 64, 0);
      glUtils.gl.vertexAttribDivisor(shader.attribLocations.aMatrixLocation+0, 1);
      
      glUtils.gl.enableVertexAttribArray(shader.attribLocations.aMatrixLocation+1);
      glUtils.gl.vertexAttribPointer(shader.attribLocations.aMatrixLocation+1, 4, glUtils.gl.FLOAT, false, 64, 16);
      glUtils.gl.vertexAttribDivisor(shader.attribLocations.aMatrixLocation+1, 1);

      glUtils.gl.enableVertexAttribArray(shader.attribLocations.aMatrixLocation+2);
      glUtils.gl.vertexAttribPointer(shader.attribLocations.aMatrixLocation+2, 4, glUtils.gl.FLOAT, false, 64, 32);
      glUtils.gl.vertexAttribDivisor(shader.attribLocations.aMatrixLocation+2, 1);
      
      glUtils.gl.enableVertexAttribArray(shader.attribLocations.aMatrixLocation+3);
      glUtils.gl.vertexAttribPointer(shader.attribLocations.aMatrixLocation+3, 4, glUtils.gl.FLOAT, false, 64, 48);
      glUtils.gl.vertexAttribDivisor(shader.attribLocations.aMatrixLocation+3, 1);
   }
 
   setTexture(texture){
      this.uTexture = texture;
   }
 
   renderColor(timestamp){
      
      glUtils.gl.useProgram(this.renderShader.program);

      glUtils.gl.uniform1f(this.renderShader.uniformLocations.iTime,  timestamp / 1000);
      glUtils.gl.uniform2f(this.renderShader.uniformLocations.iResolution, window.innerWidth, window.innerHeight);
      glUtils.gl.uniform1f(this.renderShader.uniformLocations.alpha, 1);
      glUtils.gl.uniform3f(this.renderShader.uniformLocations.camPos, global.matView[3], global.matView[7], global.matView[11]);
      glUtils.gl.uniform3f(this.renderShader.uniformLocations.lightpos, global.lightpos[0], global.lightpos[1], global.lightpos[2]);
     
      if(this.uTexture){
        glUtils.gl.activeTexture(glUtils.gl.TEXTURE1);
        glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D, this.uTexture);
        glUtils.gl.uniform1i(this.renderShader.uniformLocations.uTexture,  1);
      }
    
     glUtils.gl.activeTexture(glUtils.gl.TEXTURE5);
     glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D, global.depthTexture);
     glUtils.gl.uniform1i(this.renderShader.uniformLocations.depthTexture,  5);

     glUtils.gl.uniformMatrix4fv(this.renderShader.uniformLocations.matProj, false, global.matProj);
     glUtils.gl.uniformMatrix4fv(this.renderShader.uniformLocations.matCamera, false, global.matView);
     
     glUtils.gl.drawArraysInstanced(
        glUtils.gl.TRIANGLES, 
        0,              // offset
        this.InstanceModel.triangleNum,    // num vertices per instance
        this.numInstances,   // num instances
      );
   }

   renderDepth(){
      glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER, this.matrixBuffer);
      glUtils.gl.bufferSubData(glUtils.gl.ARRAY_BUFFER, 0, this.matrixData);
      
      glUtils.gl.useProgram(this.depthShader.program);

      glUtils.gl.uniformMatrix4fv(this.depthShader.uniformLocations.matProj, false, global.matProj);
      glUtils.gl.uniformMatrix4fv(this.depthShader.uniformLocations.matLightView, false, global.matLightView);
     
      glUtils.gl.drawArraysInstanced(
        glUtils.gl.TRIANGLES, 
        0,              // offset
        this.InstanceModel.triangleNum,    // num vertices per instance
        this.numInstances,   // num instances
      );
   }
   render(timestamp, isdepth){
      if(!this.vertexBuffer) return;

      glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER, this.matrixBuffer);
      glUtils.gl.bufferSubData(glUtils.gl.ARRAY_BUFFER, 0, this.matrixData);
     
      glUtils.gl.bindVertexArray(this.rvao);
      this.renderColor(timestamp);
     
      glUtils.gl.bindVertexArray(null);
  }
}
export { Board };