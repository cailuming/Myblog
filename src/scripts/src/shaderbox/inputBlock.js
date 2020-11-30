
import {CanvasShader} from '../../shader/shader_canvas.js';
import {DefaultShader} from '../../shader/default.js';
import {AudioShader} from '../../shader/shader_audio.js';
import {Audio} from '../framework/audio.js';
 
class inputBlock {
  init(canvas) {
    // If we don't have a GL context,  give up now
    this.hasAudio = false;
  
    this.initGL(canvas);
    this.animate();
    this.onClear();
  }

  initGL (canvas){
    console.log('canvas is   '+canvas);
    this.canvas = canvas;
    this.gl = this.canvas.getContext('webgl2');
    if(! this.gl){
      this.gl = this.canvas.getContext('webgl');
      this.isGL2 = false;
      console.log("Notice that webgl2 is not supported!");
    }else{
      this.isGL2 = true;
    } 

    if (!this.gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return ;
    }
    this.setViewSize(canvas.width,canvas.height);
  }

  setViewSize(width, height){
    this.canvas.width = width;
    this.canvas.height =height;
    this.gl.viewport(0,  0,  this.canvas.width,  this.canvas.height);
  }

  getResolution(){
    return [this.canvas.width, this.canvas.height];
  }
  isPowerOf2(v){
    return (v&(v-1))==0;
  }
  createVertexBuffer(data) {
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,  positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER,  new Float32Array(data),  this.gl.STATIC_DRAW);
    return positionBuffer;
  } 
 
  wirteDataBuffer(buffer, data) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,  buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER,  new Float32Array(data),  this.gl.STATIC_DRAW);
  } 

  wirteIndexBuffer(buffer, data) {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,  buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,  new Uint16Array(data),  this.gl.STATIC_DRAW);
  } 

  createQuadVertexBuffer() {
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,  positionBuffer);
    const positions = [
      1.0,   1.0, 0,  1, 1, 
      -1.0,   1.0, 0,  0, 1, 
      1.0,  -1.0, 0,  1, 0, 
      -1.0,  -1.0, 0,  0, 0
    ];
    this.gl.bufferData(this.gl.ARRAY_BUFFER,  new Float32Array(positions),  this.gl.STATIC_DRAW);
    return positionBuffer;
  } 
  createShaderProgram(vsSource,  fsSource,  cb) {
      const vertexShader = this.loadShader(this.gl.VERTEX_SHADER,  vsSource, cb);
      const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER,  fsSource, cb);
      // Create the shader program
      if(!fragmentShader||!vertexShader) return null;
      const shaderProgram = this.gl.createProgram();
      this.gl.attachShader(shaderProgram,  vertexShader);
    
      this.gl.attachShader(shaderProgram,  fragmentShader);
      this.gl.linkProgram(shaderProgram);

      // If creating the shader program failed,  alert

      if (!this.gl.getProgramParameter(shaderProgram,  this.gl.LINK_STATUS)) {
          console.log('Error in shader program: ' + this.gl.getProgramInfoLog(shaderProgram));
          cb('Error in shader program: ' + this.gl.getProgramInfoLog(shaderProgram));
        return null;
      }

  return shaderProgram;
  }

  loadShader(type,  source, cb) {
      const shader = this.gl.createShader(type);
      this.gl.shaderSource(shader,  source);

      this.gl.compileShader(shader);

      if (!this.gl.getShaderParameter(shader,  this.gl.COMPILE_STATUS)) {
        console.log('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader)+'   type is '+type);
        var err = 'An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader);
        cb(err);
        this.gl.deleteShader(shader);
        return null;
      }
      return shader;
  }

loadTexture(texture, url) {
    this.gl.bindTexture(this.gl.TEXTURE_2D,  texture);

    const level = 0;
    const internalFormat = this.gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = this.gl.RGBA;
    const srcType =this.gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0,  0,  255,  255]);  // opaque blue
    this.gl.texImage2D(this.gl.TEXTURE_2D,  level,  internalFormat, 
                  width,  height,  border,  srcFormat,  srcType, 
                  pixel);
    const image = new Image();
    var that = this;
    //跨域数据
    if ((new URL(url, window.location.href)).origin !== window.location.origin) {
      image.crossOrigin = "";
    }

    image.onload = function() {
      that.gl.bindTexture(that.gl.TEXTURE_2D,  texture);
      that.gl.texImage2D(that.gl.TEXTURE_2D,  level,  internalFormat, 
                    srcFormat,  srcType,  image);

      // WebGL1 has different requirements for power of 2 images
      // vs non power of 2 images so check if the image is a
      // power of 2 in both dimensions.
      if (that.isPowerOf2(image.width) && that.isPowerOf2(image.height)) {
        // Yes,  it's a power of 2. Generate mips.
        that.gl.generateMipmap(that.gl.TEXTURE_2D);
      } else {
        // No,  it's not a power of 2. Turn of mips and set
        // wrapping to clamp to edge
        that.gl.texParameteri(that.gl.TEXTURE_2D,  that.gl.TEXTURE_WRAP_S,  that.gl.CLAMP_TO_EDGE);
        that.gl.texParameteri(that.gl.TEXTURE_2D,  that.gl.TEXTURE_WRAP_T,  that.gl.CLAMP_TO_EDGE);
        that.gl.texParameteri(that.gl.TEXTURE_2D,  that.gl.TEXTURE_MIN_FILTER,  that.gl.LINEAR);
      }
    };
    image.src = url;
  }

  initShader(vs, ps){
    const shaderProgram = this.createShaderProgram(vs,  ps, function(str){
        console.log("err shader is "+str);
        return null;
    });
    if(!shaderProgram)return null;
    const programInfo = {
      program: shaderProgram, 
      attribLocations:
      {
        vertexPosition:this.gl.getAttribLocation(shaderProgram,  'aPos'), 
        texPosition:this.gl.getAttribLocation(shaderProgram,  'aTex')
      }, 
      uniformLocations:{
        iTime:          this.gl.getUniformLocation(shaderProgram,  "iTime"), 
        fLimit:         this.gl.getUniformLocation(shaderProgram,  'fLimit'), 
        iResolution:    this.gl.getUniformLocation(shaderProgram,  'iResolution'), 
        channel:       this.gl.getUniformLocation(shaderProgram,  'channel0'), 
      }, 
    };
    return programInfo;
  }
  createQuadVertexBuffer() {
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,  positionBuffer);
    const positions = [
      1.0,   1.0, 0,  1, 1, 
      -1.0,   1.0, 0,  0, 1, 
      1.0,  -1.0, 0,  1, 0, 
      -1.0,  -1.0, 0,  0, 0
    ];
    this.gl.bufferData(this.gl.ARRAY_BUFFER,  new Float32Array(positions),  this.gl.STATIC_DRAW);
    return positionBuffer;
 }

  writeDataToTexture(texture, data){
    if(data.length<2) return;
    this.gl.bindTexture(this.gl.TEXTURE_2D,  texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D,  0,  this.gl.ALPHA, data.length,  1,  0,  this.gl.ALPHA,  this.gl.UNSIGNED_BYTE, data);
        // No,  it's not a power of 2. Turn of mips and set
        // wrapping to clamp to edge
    this.gl.texParameteri(this.gl.TEXTURE_2D,  this.gl.TEXTURE_WRAP_S,  this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D,  this.gl.TEXTURE_WRAP_T,  this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D,  this.gl.TEXTURE_MIN_FILTER,  this.gl.NEAREST);
  }

  onSelectResource(info){
     this.info = info;
    
     this.gl.deleteTexture(this.channelTexture);
     this.channelTexture = this.gl.createTexture();
     this.vbuffer   = this.createQuadVertexBuffer();
    
     if(this.info.type=='texture'){
        this.loadTexture(this.channelTexture,info.purl);
        this.shader  = this.initShader(CanvasShader.vertexShader,DefaultShader.fragTitle+DefaultShader.texShader+DefaultShader.fragTail);
     }else if(this.info.type=='audio'){
       if(this.audioData!=null&&this.audioData!=undefined){
         this.audioData.stop();
       }
     
       this.audioData = new Audio();
       this.audioData.init();

       this.audioData.loadAudioByUrl(info.url);
       this.shader  = this.initShader(CanvasShader.vertexShader,DefaultShader.fragTitle+AudioShader.pixelShader+DefaultShader.fragTail);
     }
     this.isPause = false;
  }

  onClear(){
    this.info = {};
    this.info.type = 'texture';
    this.info.id = -1;
    
    if(this.audioData!=null&&this.audioData!=undefined){
      this.audioData.stop();
    }
    this.gl.deleteTexture(this.channelTexture);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);            // Near things obscure far things
    this.gl.clearColor(1.0,  1.0,  1.0,  1.0);  // Clear to black,  fully opaque
    this.gl.clearDepth(1.0);
  
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA,  this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.isPause = true;
  }
  
  getIsEmpty(){
    return this.isPause;
  }

  setEmpty(){
    this.isPause = true;
  }

  animate( timestamp ) {
   
    if(timestamp!=undefined&&this.shader!=null){
      if(!this.isPause){
         this.drawScene(timestamp);
      }
    };
    requestAnimationFrame( this.animate.bind(this) );
  }
 
 drawScene(timestamp) {
   
    // this.gl.enable(this.gl.CULL_FACE);
    // this.gl.frontFace(this.gl.CCW);
    // this.gl.cullFace(this.gl.BACK);

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);            // Near things obscure far things
    this.gl.clearColor(0.0,  0.0,  0.0,  1.0);  // Clear to black,  fully opaque
    this.gl.clearDepth(1.0);
  
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA,  this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // // // 
    // // // // Tell WebGL how to pull out the positions from the position
    // // // // buffer into the vertexPosition attribute
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbuffer);
  
    this.gl.vertexAttribPointer(this.shader.attribLocations.vertexPosition,  3,  this.gl.FLOAT, false, 20, 0);
    this.gl.enableVertexAttribArray(this.shader.attribLocations.vertexPosition);
    this.gl.vertexAttribPointer(this.shader.attribLocations.texPosition,  2,  this.gl.FLOAT, false, 20, 12);
    this.gl.enableVertexAttribArray(this.shader.attribLocations.texPosition);

    this.gl.useProgram(this.shader.program);
    //var fadeIndex=0;
     
    if(this.info.type=='texture'){
       this.gl.activeTexture(this.gl.TEXTURE0);
       this.gl.bindTexture(this.gl.TEXTURE_2D,this.channelTexture);
       this.gl.uniform1i(this.shader.uniformLocations.channel,0);
    }else if(this.info.type=='audio'){
       this.gl.activeTexture(this.gl.TEXTURE0);
       this.gl.bindTexture(this.gl.TEXTURE_2D,this.channelTexture);
       this.writeDataToTexture(this.channelTexture,this.audioData.getFreqData());
       this.gl.uniform1i(this.shader.uniformLocations.channel,0);
    }
   
    this.gl.uniform1f(this.shader.uniformLocations.iTime,  timestamp / 1000);
    
    this.gl.uniform2f(this.shader.uniformLocations.iResolution, this.getResolution()[0], this.getResolution()[1]);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP,  0,  4);
  }
}

export {inputBlock} 