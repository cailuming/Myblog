
import {CanvasShader} from '../../shader/shader_canvas.js';
import {LoadShader} from '../../shader/shader_load.js';
import {FxaaShader} from '../../shader/shader_fxaa.js';
import {glUtils} from '../framework/glUtils.js';
import {global} from '../framework/global.js';
import {OffScreen} from '../sandBox/offscreen.js';
import { Resource } from '../framework/resource.js';
import { Audio } from '../framework/audio.js';

const sandCanvas= {
  init() {
    glUtils.init('sandCanvas');
    this.audio     = new Audio();
    this.isPause   = false;
    Resource.init(function(){
      this.audio.init(); 
      console.log('..............Resource..audio............................');
      this.audio.loadAudioFile(Resource.resourceList.audio);
    }.bind(this));
    this.vbuffer   = glUtils.createQuadVertexBuffer();
    this.shader    = this.initShader(CanvasShader.vertexShader,LoadShader.pixelShader);
    this.animate();
    this.onResize();
    window.addEventListener( 'resize', this.onResize, false );
  }, 

  onResize(){
     glUtils.setGLViewSize(window.innerWidth,window.innerHeight);
  },

  clear(){
     cancelAnimationFrame(this.animID) ;
     this.audio.stop();
     this.isPause = true;
  },
  
  initShader(vs, ps){
  
    const shaderProgram = glUtils.createShaderProgram(vs,  ps, function(str){
        console.log("err shader is "+str);
        return null;
    });
    if(!shaderProgram)return null;
    const programInfo = {
      program: shaderProgram, 
      attribLocations:
      {
        vertexPosition:glUtils.gl.getAttribLocation(shaderProgram,  'aPos'), 
        texPosition:glUtils.gl.getAttribLocation(shaderProgram,  'aTex')
      }, 
      uniformLocations:{
        iTime:            glUtils.gl.getUniformLocation(shaderProgram, "iTime"),
        fLimit:           glUtils.gl.getUniformLocation(shaderProgram, 'fLimit'),
        iResolution:      glUtils.gl.getUniformLocation(shaderProgram, 'iResolution'),
        uTexture:         glUtils.gl.getUniformLocation(shaderProgram, 'uTexture'),
        uDepthBuffer:     glUtils.gl.getUniformLocation(shaderProgram, 'uDepthBuffer'),
        uLightDepthBuffer:glUtils.gl.getUniformLocation(shaderProgram, 'uLightDepthBuffer'),
        lightPos:         glUtils.gl.getUniformLocation(shaderProgram, 'lightPos'),
        matView:          glUtils.gl.getUniformLocation(shaderProgram, 'matView'),
        matProj :         glUtils.gl.getUniformLocation(shaderProgram, 'matProj'),
        matProjInv :      glUtils.gl.getUniformLocation(shaderProgram, 'matProjInv'),
        matViewInv :      glUtils.gl.getUniformLocation(shaderProgram, 'matViewInv'),
        matLightView :    glUtils.gl.getUniformLocation(shaderProgram, 'matLightView'),
      }, 
    };

    return programInfo;
  }, 
 
  animate( timestamp ) {
    if(timestamp!=undefined&&this.shader!=null){
      if(!this.isPause){
         global.interval= new Date().getTime()-global.lastStamp;
         global.fpscount++;
         if(global.interval>=1000){
              global.lastStamp = new Date().getTime();
              //this.updateCallFunc(global.fpscount);
              global.fpscount = 0;
         }
         if(Resource.loaded ==1){
            OffScreen.init();
            this.shader  = this.initShader(CanvasShader.vertexShader,FxaaShader.pixelShader+CanvasShader.pixelShader);
            Resource.loaded = 2;
         }else if(Resource.loaded==2){  
            OffScreen.render(timestamp);
         }

         this.drawScene(timestamp);
      }
    };
    this.animID = requestAnimationFrame( this.animate.bind(this) );
  }, 

  getScreenData(){
    this.drawScene(1);
    return glUtils.getScreenPixels();
  },
 
  drawScene(timestamp) {
   
    glUtils.gl.enable(glUtils.gl.DEPTH_TEST);
    glUtils.gl.depthFunc(glUtils.gl.LEQUAL);            // Near things obscure far things
    glUtils.gl.clearColor(0.0,  0.0,  0.0,  1.0);  // Clear to black,  fully opaque
    glUtils.gl.clearDepth(1.0);
  
    glUtils.gl.enable(glUtils.gl.BLEND);
    glUtils.gl.blendFunc(glUtils.gl.SRC_ALPHA,  glUtils.gl.ONE_MINUS_SRC_ALPHA);
    glUtils.gl.clear(glUtils.gl.COLOR_BUFFER_BIT | glUtils.gl.DEPTH_BUFFER_BIT);

    // // // 
    // // // // Tell WebGL how to pull out the positions from the position
    // // // // buffer into the vertexPosition attribute
    glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER, this.vbuffer);
  
    glUtils.gl.vertexAttribPointer(this.shader.attribLocations.vertexPosition,  3,  glUtils.gl.FLOAT, false, 20, 0);
    glUtils.gl.enableVertexAttribArray(this.shader.attribLocations.vertexPosition);
    glUtils.gl.vertexAttribPointer(this.shader.attribLocations.texPosition,  2,  glUtils.gl.FLOAT, false, 20, 12);
    glUtils.gl.enableVertexAttribArray(this.shader.attribLocations.texPosition);

    glUtils.gl.useProgram(this.shader.program);
     //////////////////////////////////////////////////////////////////////
    glUtils.gl.activeTexture(glUtils.gl.TEXTURE0);
    glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,OffScreen.renderTexture);
    glUtils.gl.uniform1i(this.shader.uniformLocations.uTexture, 0);

    glUtils.gl.activeTexture(glUtils.gl.TEXTURE1);
    glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,OffScreen.depthTexture);
    glUtils.gl.uniform1i(this.shader.uniformLocations.uDepthBuffer, 1);

    glUtils.gl.activeTexture(glUtils.gl.TEXTURE2);
    glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,OffScreen.shadowTexture);
    glUtils.gl.uniform1i(this.shader.uniformLocations.uLightDepthBuffer, 2);

    glUtils.gl.uniform1f(this.shader.uniformLocations.iTime, timestamp / 1000);
    if(Resource.loaded==0){
      glUtils.gl.uniform1f(this.shader.uniformLocations.fLimit,Resource.percent);
    }else{
      glUtils.gl.uniform1f(this.shader.uniformLocations.fLimit,1);
    }

    glUtils.gl.uniform2f(this.shader.uniformLocations.iResolution, glUtils.getResolution()[0], glUtils.getResolution()[1]);
    glUtils.gl.uniform3f(this.shader.uniformLocations.lightPos,global.lightpos[0],global.lightpos[1],global.lightpos[2]);

    glUtils.gl.uniformMatrix4fv(this.shader.uniformLocations.matView,false,global.matView);
    glUtils.gl.uniformMatrix4fv(this.shader.uniformLocations.matProj,false,global.matPerspectiveProj);
    glUtils.gl.uniformMatrix4fv(this.shader.uniformLocations.matProjInv,false,global.matProjInv);
    glUtils.gl.uniformMatrix4fv(this.shader.uniformLocations.matViewInv,false,global.matViewInv);
    glUtils.gl.uniformMatrix4fv(this.shader.uniformLocations.matLightView,false,global.matLightView);
   
    glUtils.gl.drawArrays(glUtils.gl.TRIANGLE_STRIP,  0,  4);
  }
}

export {sandCanvas} 