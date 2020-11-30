 
import {QuadShader} from '../../shader/shader_quad.js';
import {glUtils} from '../framework/glUtils.js';
import {math3D} from "../framework/math.js"
//2d的四边形精灵
class Quad  {
  constructor(){
    this.matScale =[];
    this.matTrans =[];
    this.matRotate =[];
    this.matInter =[];
    this.matModel =[];
    math3D.identityMatrix(this.matScale);
    math3D.identityMatrix(this.matTrans);
    math3D.identityMatrix(this.matRotate);
    math3D.identityMatrix(this.matModel);
  }
  init(tname) {
   
    this.vBuffer   = glUtils.createQuadVertexBuffer();
    this.Shader    = this.InitShader(QuadShader);
    this.audioTexture = glUtils.gl.createTexture();
    this.uTexture = glUtils.gl.createTexture();
    glUtils.loadTexture(this.uTexture,tname);
    //,
  }
 
  InitShader(shader){
    const shaderProgram = glUtils.createShaderProgram(shader.vertexShader,shader.pixelShader,function(str){
        console.log("err shader is "+str);
    });
    if(!shaderProgram)return null;
    const programInfo = {
      program: shaderProgram,
      attribLocations:
      {
        vertexPosition:glUtils.gl.getAttribLocation(shaderProgram, 'aPos'),
        texPosition:glUtils.gl.getAttribLocation(shaderProgram, 'aTex')
      },
      uniformLocations:{
        iTime:       glUtils.gl.getUniformLocation(shaderProgram, "iTime"),
        fLimit:      glUtils.gl.getUniformLocation(shaderProgram, 'fLimit'),
        matModel :   glUtils.gl.getUniformLocation(shaderProgram, 'matModel'),
        iResolution: glUtils.gl.getUniformLocation(shaderProgram, 'iResolution'),
        uAudioSource:    glUtils.gl.getUniformLocation(shaderProgram, 'uAudioSource'),
        uTexture:    glUtils.gl.getUniformLocation(shaderProgram, 'uTexture'),
      },
    };
    return programInfo;
  } 
  
  scale(s){
     math3D.scaleMatrix(this.matScale,[s,s,1]);
  }

  scale2(s1,s2){
    math3D.scaleMatrix(this.matScale,[s1,s2,1]);
  }

  trans(p){
    math3D.transMatrix(this.matTrans,p);
  }

  rotate(a){
    math3D.rotateZMatrix(this.matRotate,a);
  }
  updateMatrix(){
     math3D.mul_Matrix_Matrix(this.matInter,this.matRotate,this.matScale);
     math3D.mul_Matrix_Matrix(this.matModel,this.matTrans,this.matInter);
  }
  render(timestamp){
     //we should clear the depth each time we render,even though it is a offscreen texture
     this.updateMatrix();
     glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER,this.vBuffer);
     glUtils.gl.vertexAttribPointer(this.Shader.attribLocations.vertexPosition, 3, glUtils.gl.FLOAT,false,20,0);
     glUtils.gl.enableVertexAttribArray(this.Shader.attribLocations.vertexPosition);
     glUtils.gl.vertexAttribPointer(this.Shader.attribLocations.texPosition, 2, glUtils.gl.FLOAT,false,20,12);
     glUtils.gl.enableVertexAttribArray(this.Shader.attribLocations.texPosition);
    
     glUtils.gl.useProgram(this.Shader.program);
     glUtils.gl.activeTexture(glUtils.gl.TEXTURE0);
     glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,this.audioTexture);
     glUtils.writeDataToTexture(this.audioTexture,Audio.getFreqData());
     glUtils.gl.uniform1i(this.Shader.uniformLocations.uAudioSource,0);

     glUtils.gl.activeTexture(glUtils.gl.TEXTURE1);
     glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,this.uTexture);
     glUtils.gl.uniform1i(this.Shader.uniformLocations.uTexture,1);

     glUtils.gl.uniform1f(this.Shader.uniformLocations.iTime, timestamp / 1000);
     glUtils.gl.uniform2f(this.Shader.uniformLocations.iResolution,window.innerWidth,window.innerHeight);
     glUtils.gl.uniformMatrix4fv(this.Shader.uniformLocations.matModel,false,this.matModel);
     glUtils.gl.drawArrays(glUtils.gl.TRIANGLE_STRIP, 0, 4);

  }
 
};

export {Quad}