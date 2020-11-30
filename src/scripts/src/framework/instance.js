import {glUtils} from "./glUtils.js"
 
import {global} from './global.js';
import {DepthShader} from "../shader/shader_depth.js"
class Instance
{
   constructor(v){
     this.matTrans =[];
     this.matRotate=[]; 
     this.matModel =[];
     this.vertexBuffer  =null;
     this.uTexture =null;
     this.normTexture =null;
     this.roughTexture =null;
     this.aoTexture =null;
     this.setMaterialColor([0.1,0.1,0.1],[6,6,6],0.1,5);
   }
  
   init(shaderFile,model){
       this.InstanceModel = model;
       this.initDepthShader(DepthShader);
       this.initRenderShader(shaderFile);
       this.createBuffer();     
   }
  
  initDepthShader(shader){
    const shaderProgram = glUtils.createShaderProgram(shader.vertexShader_I,shader.pixelShader,function(str){
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
        aMatrixLocation:glUtils.gl.getAttribLocation(shaderProgram,'aMatrix'),
      },

      uniformLocations:{
        matProj:     glUtils.gl.getUniformLocation(shaderProgram, 'matProj'),
        matLightView:     glUtils.gl.getUniformLocation(shaderProgram, 'matLightView'),
      },
    };
    console.info(this.depthShader.attribLocations)
}

initRenderShader(shader){
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
       aMatrixLocation:glUtils.gl.getAttribLocation(shaderProgram,'aMatrix'),
     },
     uniformLocations:{
       iTime:       glUtils.gl.getUniformLocation(shaderProgram, "iTime"),
       fLimit:      glUtils.gl.getUniformLocation(shaderProgram, 'fLimit'),
       roughness  :   glUtils.gl.getUniformLocation(shaderProgram, 'roughness'),
       texstride  :   glUtils.gl.getUniformLocation(shaderProgram, 'stride'),
       iResolution: glUtils.gl.getUniformLocation(shaderProgram, 'iResolution'),
       specColor:    glUtils.gl.getUniformLocation(shaderProgram, 'specColor'),
       diffuseColor:  glUtils.gl.getUniformLocation(shaderProgram, 'diffuseColor'),
       lightpos:      glUtils.gl.getUniformLocation(shaderProgram, 'lightpos'),
       
       uTexture:      glUtils.gl.getUniformLocation(shaderProgram, 'uTexture'),
       uAudioSource:  glUtils.gl.getUniformLocation(shaderProgram,'uAudioSource'),
       normTexture:   glUtils.gl.getUniformLocation(shaderProgram,'normTexture'),
       roughTexture:  glUtils.gl.getUniformLocation(shaderProgram,'roughTexture'),
       aoTexture:     glUtils.gl.getUniformLocation(shaderProgram,'aoTexture'),
       depthTexture:  glUtils.gl.getUniformLocation(shaderProgram,'depthTexture'),

       camPos:        glUtils.gl.getUniformLocation(shaderProgram, 'camPos'),
       alpha:      glUtils.gl.getUniformLocation(shaderProgram, 'alpha'),
       matProj:     glUtils.gl.getUniformLocation(shaderProgram, 'matProj'),
       matModel :     glUtils.gl.getUniformLocation(shaderProgram, 'matModel'),
       matCamera:     glUtils.gl.getUniformLocation(shaderProgram, 'matCamera'),
     },
   };
}

  createBuffer(){
    this.dvao = glUtils.gl.createVertexArray();
    this.rvao = glUtils.gl.createVertexArray();
    this.vertexBuffer =glUtils.gl.createBuffer();
    glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER,this.vertexBuffer);
    glUtils.wirteDataBuffer(this.vertexBuffer,this.InstanceModel.layout);
  }

  createInstanceData(numInstances,matModels){
      this.matrixData =matModels;
      this.numInstances = numInstances;
     //////////////////////////////////////////////
      //this.matrixBuffer = glUtils.createVertexBufferBySize( this.matrixData.byteLength);
      this.matrixBuffer = glUtils.createVertexBufferBySize(matModels.byteLength);
      this.enableVertexAttrib();
   }
   
   enableVertexAttrib(){
      
      glUtils.gl.bindVertexArray(this.dvao);
      this.enableVertexAttribByShader(this.depthShader);
      glUtils.gl.bindVertexArray(this.rvao);
      this.enableVertexAttribByShader(this.renderShader);
      glUtils.gl.bindVertexArray(null);
    
   }
   enableVertexAttribByShader(shader){
        //after write the data to the buffer,we need to tell gl the attributes
      glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER,this.vertexBuffer);

      glUtils.gl.enableVertexAttribArray(shader.attribLocations.aVerLocation);
      glUtils.gl.vertexAttribPointer(shader.attribLocations.aVerLocation,3,glUtils.gl.FLOAT,false,shader.stride,0);
      glUtils.gl.enableVertexAttribArray(shader.attribLocations.aNormLocation);
      glUtils.gl.vertexAttribPointer(shader.attribLocations.aNormLocation,3,glUtils.gl.FLOAT,false,shader.stride,12);
   
      glUtils.gl.enableVertexAttribArray(shader.attribLocations.aTexLocation);
      glUtils.gl.vertexAttribPointer(shader.attribLocations.aTexLocation,2,glUtils.gl.FLOAT,false,shader.stride,24);

      //4 floats per attributes
      //And assign the matrix attributes
      glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER,this.matrixBuffer);
      glUtils.gl.enableVertexAttribArray(shader.attribLocations.aMatrixLocation+0);
      glUtils.gl.vertexAttribPointer(shader.attribLocations.aMatrixLocation+0,4,glUtils.gl.FLOAT,false,64,0);
      glUtils.gl.vertexAttribDivisor(shader.attribLocations.aMatrixLocation+0,1);
      
      glUtils.gl.enableVertexAttribArray(shader.attribLocations.aMatrixLocation+1);
      glUtils.gl.vertexAttribPointer(shader.attribLocations.aMatrixLocation+1,4,glUtils.gl.FLOAT,false,64,16);
      glUtils.gl.vertexAttribDivisor(shader.attribLocations.aMatrixLocation+1,1);

      glUtils.gl.enableVertexAttribArray(shader.attribLocations.aMatrixLocation+2);
      glUtils.gl.vertexAttribPointer(shader.attribLocations.aMatrixLocation+2,4,glUtils.gl.FLOAT,false,64,32);
      glUtils.gl.vertexAttribDivisor(shader.attribLocations.aMatrixLocation+2,1);
      
      glUtils.gl.enableVertexAttribArray(shader.attribLocations.aMatrixLocation+3);
      glUtils.gl.vertexAttribPointer(shader.attribLocations.aMatrixLocation+3,4,glUtils.gl.FLOAT,false,64,48);
      glUtils.gl.vertexAttribDivisor(shader.attribLocations.aMatrixLocation+3,1);
   }

   setMaterialColor(s0,diffc,rough,stride){
      this.specColor = s0;
      this.diffuseColor = diffc;
      this.roughness = rough;
      this.stride = stride;
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

   renderColor(timestamp){
      
      glUtils.gl.useProgram(this.renderShader.program);

      glUtils.gl.uniform1f(this.renderShader.uniformLocations.iTime, timestamp / 1000);
      glUtils.gl.uniform1f(this.renderShader.uniformLocations.roughness, this.roughness);
      glUtils.gl.uniform1f(this.renderShader.uniformLocations.texstride,this.stride);
      glUtils.gl.uniform2f(this.renderShader.uniformLocations.iResolution,window.innerWidth,window.innerHeight);
      glUtils.gl.uniform1f(this.renderShader.uniformLocations.alpha,1);
      glUtils.gl.uniform3f(this.renderShader.uniformLocations.camPos,global.matView[3],global.matView[7],global.matView[11]);
      glUtils.gl.uniform3f(this.renderShader.uniformLocations.specColor,this.specColor[0],this.specColor[1],this.specColor[2]);
      glUtils.gl.uniform3f(this.renderShader.uniformLocations.diffuseColor,this.diffuseColor[0],this.diffuseColor[1],this.diffuseColor[2]);
      glUtils.gl.uniform3f(this.renderShader.uniformLocations.lightpos,global.lightpos[0],global.lightpos[1],global.lightpos[2]);
     
      if(this.uTexture){
        glUtils.gl.activeTexture(glUtils.gl.TEXTURE1);
        glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,this.uTexture);
        glUtils.gl.uniform1i(this.renderShader.uniformLocations.uTexture, 1);
     }

     if(this.normTexture){
        glUtils.gl.activeTexture(glUtils.gl.TEXTURE2);
        glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,this.normTexture);
        glUtils.gl.uniform1i(this.renderShader.uniformLocations.normTexture, 2);
     }

     if(this.roughTexture){
        glUtils.gl.activeTexture(glUtils.gl.TEXTURE3);
        glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,this.roughTexture);
        glUtils.gl.uniform1i(this.renderShader.uniformLocations.roughTexture, 3);
     }

     if(this.aoTexture){
        glUtils.gl.activeTexture(glUtils.gl.TEXTURE4);
        glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,this.aoTexture);
        glUtils.gl.uniform1i(this.renderShader.uniformLocations.aoTexture, 4);
     }

     glUtils.gl.activeTexture(glUtils.gl.TEXTURE5);
     glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,global.depthTexture);
     glUtils.gl.uniform1i(this.renderShader.uniformLocations.depthTexture, 5);

     glUtils.gl.uniformMatrix4fv(this.renderShader.uniformLocations.matProj,false,global.matProj);
     glUtils.gl.uniformMatrix4fv(this.renderShader.uniformLocations.matCamera,false,global.matView);
     
     glUtils.gl.drawArraysInstanced(
        glUtils.gl.TRIANGLES,
        0,             // offset
        this.InstanceModel.triangleNum,   // num vertices per instance
        this.numInstances,  // num instances
      );
   }

   renderDepth(){
      glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER,this.matrixBuffer);
      glUtils.gl.bufferSubData(glUtils.gl.ARRAY_BUFFER,0,this.matrixData);
      
      glUtils.gl.useProgram(this.depthShader.program);

      glUtils.gl.uniformMatrix4fv(this.depthShader.uniformLocations.matProj,false,global.matProj);
      glUtils.gl.uniformMatrix4fv(this.depthShader.uniformLocations.matLightView,false,global.matLightView);
     
      glUtils.gl.drawArraysInstanced(
        glUtils.gl.TRIANGLES,
        0,             // offset
        this.InstanceModel.triangleNum,   // num vertices per instance
        this.numInstances,  // num instances
      );
   }
   render(timestamp,isdepth){
      if(!this.vertexBuffer) return;

      glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER,this.matrixBuffer);
      glUtils.gl.bufferSubData(glUtils.gl.ARRAY_BUFFER,0,this.matrixData);

      if(isdepth){
         glUtils.gl.bindVertexArray(this.dvao);
         this.renderDepth();
      }else{
         glUtils.gl.bindVertexArray(this.rvao);
         this.renderColor(timestamp);
      }
      glUtils.gl.bindVertexArray(null);
  }
}
export { Instance };