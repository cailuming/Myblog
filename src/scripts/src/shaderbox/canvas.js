
import {CanvasShader} from '../../shader/shader_canvas.js';
import {DefaultShader} from '../../shader/default.js';
import {glUtils} from '../framework/glUtils.js';
import {global} from '../framework/global.js';

const shaderCanvas= {
   init() {
      this.isPause = false;
      this.onInitChannelInfo(); 
      this.animate();
  }, 

  clear(){
     cancelAnimationFrame(this.animID) ;
     this.stopAllMusic();
  },
  
  initShader(vs, ps){
    let that = this;
    that.compileCallFunc("compile successfull!",'blue');
    const shaderProgram = glUtils.createShaderProgram(vs,  ps, function(str){
        console.log("err shader is "+str);
        that.compileCallFunc(str,'red');
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
        iTime:          glUtils.gl.getUniformLocation(shaderProgram,  "iTime"), 
        fLimit:         glUtils.gl.getUniformLocation(shaderProgram,  'fLimit'), 
        iResolution:    glUtils.gl.getUniformLocation(shaderProgram,  'iResolution'), 
        channel0:       glUtils.gl.getUniformLocation(shaderProgram,  'channel0'),
        channel1:       glUtils.gl.getUniformLocation(shaderProgram,  'channel1'),
        channel2:       glUtils.gl.getUniformLocation(shaderProgram,  'channel2'),
        channel3:       glUtils.gl.getUniformLocation(shaderProgram,  'channel3'), 
      }, 
    };
    return programInfo;
  }, 

  reloadShader(ps){
    this.vbuffer   = glUtils.createQuadVertexBuffer();
    this.shader    = this.initShader(CanvasShader.vertexShader,DefaultShader.fragTitle+ps+DefaultShader.fragTail);
    if(this.texchannels!=undefined&&this.texchannels!=null){
      this.texchannels.forEach(element => {
         glUtils.deleteTexture(element.tex);        
      });
    }
    this.onInitChannelInfo();
    this.onReloadChannels();
  },

  setCallFunc(updateCb,compileCb){
    this.updateCallFunc = updateCb;
    this.compileCallFunc = compileCb;
  },
  onInitChannelInfo(){
    this.texchannels = [
      {tex:glUtils.gl.createTexture(), type:""},
      {tex:glUtils.gl.createTexture(), type:""},
      {tex:glUtils.gl.createTexture(), type:""},
      {tex:glUtils.gl.createTexture(), type:""},
    ];
    if(this.channelInfo==undefined||this.channelInfo==null){
       this.channelInfo = [];
    } 
  },
  onReloadChannels(){
    this.channelInfo.forEach((e,index)=>{
      if(!e.isPause){
        if(e.info.type=='texture'){
            glUtils.loadTexture(this.texchannels[index].tex,e.info.rurl);  
        }
        this.texchannels[index].type = e.info.type;
        this.texchannels[index].audio = e.audioData;
      }
    });
  },

  setAllMusicState(bool){
    this.channelInfo.forEach((e,index)=>{
      if(!e.isPause&&this.texchannels[index].audio){
        if(bool){
          this.texchannels[index].audio.resume();
        }else{
          this.texchannels[index].audio.pause();
        }
      }
    });
  },

  stopAllMusic(){
    this.channelInfo.forEach((e,index)=>{
      if(!e.isPause&&this.texchannels[index].audio){
         this.texchannels[index].audio.stop();
      }
    });
  },

  onChangeChannel(v){
    this.channelInfo = v;
    this.onReloadChannels();
  },
 
  animate( timestamp ) {
   
    if(timestamp!=undefined&&this.shader!=null){
      if(!this.isPause){
         global.interval= new Date().getTime()-global.lastStamp;
         global.fpscount++;
         if(global.interval>=1000){
              global.lastStamp = new Date().getTime();
              this.updateCallFunc(global.fpscount);
              global.fpscount = 0;
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
    glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,this.texchannels[0].tex);
    if(this.texchannels[0].type=='audio'){
      glUtils.writeDataToTexture(this.texchannels[0].tex,this.texchannels[0].audio.getFreqData());
    }
    glUtils.gl.uniform1i(this.shader.uniformLocations.channel0,0);
    //////////////////////////////////////////////////////////////////////1
    glUtils.gl.activeTexture(glUtils.gl.TEXTURE1);
    glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,this.texchannels[1].tex);
    if(this.texchannels[1].type=='audio'){
      glUtils.writeDataToTexture(this.texchannels[1].tex,this.texchannels[1].audio.getFreqData());
    }
    glUtils.gl.uniform1i(this.shader.uniformLocations.channel1,1);
    //////////////////////////////////////////////////////////////////////2
    glUtils.gl.activeTexture(glUtils.gl.TEXTURE2);
    glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,this.texchannels[2].tex);
    if(this.texchannels[2].type=='audio'){
      glUtils.writeDataToTexture(this.texchannels[2].tex,this.texchannels[2].audio.getFreqData());
    }
    glUtils.gl.uniform1i(this.shader.uniformLocations.channel2,2);
    //////////////////////////////////////////////////////////////////////2
    glUtils.gl.activeTexture(glUtils.gl.TEXTURE3);
    glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D,this.texchannels[3].tex);
    if(this.texchannels[3].type=='audio'){
      glUtils.writeDataToTexture(this.texchannels[3].tex,this.texchannels[3].audio.getFreqData());
    }
    glUtils.gl.uniform1i(this.shader.uniformLocations.channel3,3);
    glUtils.gl.uniform1f(this.shader.uniformLocations.iTime,  timestamp / 1000);
    
    glUtils.gl.uniform2f(this.shader.uniformLocations.iResolution, glUtils.getResolution()[0], glUtils.getResolution()[1]);
    glUtils.gl.drawArrays(glUtils.gl.TRIANGLE_STRIP,  0,  4);
  }
}

export {shaderCanvas} 