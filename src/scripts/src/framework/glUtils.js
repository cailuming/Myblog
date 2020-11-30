
var glUtils={
   canvas   :null, 
   gl       :null, 
   isGL2    :null, 
   init(name){
        this.canvas = document.querySelector('#'+name);
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
        // this.setGLViewSize( window.innerWidth, window.innerHeight);
   }, 

   packQuadShader(fragSource){
      var fragHead = 
      `
      precision highp float;
      precision highp int;
      #define PI 3.1415926
      uniform vec2 iResolution;
      uniform float iTime;
      \n`;
      var fragTail = `
      void main()	{
        mainImage(gl_FragColor,gl_FragCoord.xy);
      }`;
      return fragHead+fragSource+fragTail;
   },

   setGLViewSize(width, height){
      this.canvas.width = width;
      this.canvas.height =height;
      this.gl.viewport(0, 0,  this.canvas.width,  this.canvas.height);
   }, 

   getResolution(){
      return [this.canvas.width, this.canvas.height];
   }, 

   getScreenPixels(){
      var pixels = new Uint8Array(this.canvas.width * this.canvas.height * 4);
      this.gl.readPixels(0, 0, this.canvas.width, this.canvas.height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
      return pixels;
   },
 
   createVertexBuffer(data) {
      const positionBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER,  positionBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER,  new Float32Array(data),  this.gl.STATIC_DRAW);
      return positionBuffer;
   }, 

   createVertexBufferBySize(size) {
      const matrixBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER,  matrixBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER,  size,  this.gl.DYNAMIC_DRAW);
      return matrixBuffer;
   }, 

   wirteDataBuffer(buffer, data) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,  buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER,  new Float32Array(data),  this.gl.STATIC_DRAW);
   }, 

   wirteIndexBuffer(buffer, data) {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,  buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,  new Uint16Array(data),  this.gl.STATIC_DRAW);
   }, 

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
   }, 
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
  }, 

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
  }, 
  
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
      console.log('successfull image ////////////////////////////////');
    };
    image.src = url;
  }, 

  loadTextureByData(texture, data) {
     
    this.gl.bindTexture(this.gl.TEXTURE_2D,  texture);
  
    const level = 0;
    const internalFormat = this.gl.RGBA;
    const srcFormat = this.gl.RGBA;
    const srcType =this.gl.UNSIGNED_BYTE;
   
    this.gl.bindTexture(this.gl.TEXTURE_2D,  texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D,  level, internalFormat, 
                  srcFormat,  srcType,  data);

    if (this.isPowerOf2(data.width) && this.isPowerOf2(data.height)) {
        // Yes,  it's a power of 2. Generate mips.
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
    } else {
        // No,  it's not a power of 2. Turn of mips and set
        // wrapping to clamp to edge
        this.gl.texParameteri(this.gl.TEXTURE_2D,  this.gl.TEXTURE_WRAP_S,  this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D,  this.gl.TEXTURE_WRAP_T,  this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D,  this.gl.TEXTURE_MIN_FILTER,  this.gl.LINEAR);
    }
  }, 

  loadCubeTexture(fileArray){
     var texture = gl.createTexture();
     this.gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

     const faceInfos = [
       {
         target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_X, 
         url : fileArray[0]  
       }, 

       {
         target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
         url : fileArray[1]  
       }, 
       
       {
         target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 
         url : fileArray[2]  
       }, 

       {
         target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
         url : fileArray[3]  
       }, 

       {
         target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 
         url : fileArray[4]  
       }, 

       {
         target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 
         url : fileArray[5]  
       }, 
     ];

     faceInfos.forEach(element => {
       const {target, url} = element;
       const level = 0;
       const interalFormat = gl.RGBA;
       const width = 512;
       const height = 512;
       const format = gl.RGBA;
       const type = gl.UNSIGNED_BYTE;

       this.gl.texImage2D(target, level, interalFormat, width, height, 0, format, type, null);
       const image = new Image();
       image.src = url;
       image.addEventListener('load', function(){
          gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
          gl.texImage2D(target, level, interalFormat, format, type, image);
          gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        });
      });

      this.gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      this.gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  }, 

  deleteTexture(tex){
      this.gl.deleteTexture(tex);
  },

  isPowerOf2(v){
    return (v&(v-1))==0;
  }, 

  loadTexture1DFromData(data) {
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D,  texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D,  0,  this.gl.ALPHA, data.length,  1,  0,  this.gl.ALPHA,  this.gl.UNSIGNED_BYTE, data);
        // No,  it's not a power of 2. Turn of mips and set
        // wrapping to clamp to edge
    this.gl.texParameteri(this.gl.TEXTURE_2D,  this.gl.TEXTURE_WRAP_S,  this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D,  this.gl.TEXTURE_WRAP_T,  this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D,  this.gl.TEXTURE_MIN_FILTER,  this.gl.LINEAR);
    return texture;
  }, 

  createRenderTargetTexture() {
    const targetTextureWidth = window.innerWidth;
    const targetTextureHeight = window.innerHeight;
    const targetTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D,  targetTexture);

    {
      // define size and format of level 0
      const level = 0;
      const internalFormat = this.gl.RGBA;
      const border = 0;
      const format = this.gl.RGBA;
      const type = this.gl.UNSIGNED_BYTE;
      const data = null;
      this.gl.texImage2D(this.gl.TEXTURE_2D,  level,  internalFormat, 
                    targetTextureWidth,  targetTextureHeight,  border, 
                    format,  type,  data);
      // set the filtering so we don't need mips
      this.gl.texParameteri(this.gl.TEXTURE_2D,  this.gl.TEXTURE_MIN_FILTER,  this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D,  this.gl.TEXTURE_WRAP_S,  this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D,  this.gl.TEXTURE_WRAP_T,  this.gl.CLAMP_TO_EDGE);
    }
    return targetTexture;
  }, 

  createDepthTexture() {
    const depthTextureWidth = window.innerWidth;
    const depthTextureHeight = window.innerHeight;
    const depthTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D,  depthTexture);
    {
      // define size and format of level 0
      const level = 0;
      const internalFormat = this.gl.DEPTH_COMPONENT32F;
      const border = 0;
      const format = this.gl.DEPTH_COMPONENT;
      const type = this.gl.FLOAT;
      const data = null;
      this.gl.texImage2D(this.gl.TEXTURE_2D,  level,  internalFormat, 
        depthTextureWidth,  depthTextureHeight,  border, format,  type,  data);
      // set the filtering so we don't need mips
      this.gl.texParameteri(this.gl.TEXTURE_2D,  this.gl.TEXTURE_MIN_FILTER,  this.gl.NEAREST);
      this.gl.texParameteri(this.gl.TEXTURE_2D,  this.gl.TEXTURE_MAG_FILTER,  this.gl.NEAREST);
      this.gl.texParameteri(this.gl.TEXTURE_2D,  this.gl.TEXTURE_WRAP_S,  this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D,  this.gl.TEXTURE_WRAP_T,  this.gl.CLAMP_TO_EDGE);
    }
    return depthTexture;
  }, 

  createFrameBuffer(rtex, dtex){
      
      const fb = this.gl.createFramebuffer();
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,  fb);
      // attach the texture as the first color attachment
      this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,   this.gl.COLOR_ATTACHMENT0,  this.gl.TEXTURE_2D,  rtex,  0);
      this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,   this.gl.DEPTH_ATTACHMENT,  this.gl.TEXTURE_2D,  dtex,  0);
     
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      return fb;
  }, 

  writeDataToTexture(texture, data){
    if(data.length<2) return;
    this.gl.bindTexture(this.gl.TEXTURE_2D,  texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D,  0,  this.gl.ALPHA, data.length,  1,  0,  this.gl.ALPHA,  this.gl.UNSIGNED_BYTE, data);
        // No,  it's not a power of 2. Turn of mips and set
        // wrapping to clamp to edge
    this.gl.texParameteri(this.gl.TEXTURE_2D,  this.gl.TEXTURE_WRAP_S,  this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D,  this.gl.TEXTURE_WRAP_T,  this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D,  this.gl.TEXTURE_MIN_FILTER,  this.gl.NEAREST);
  }, 
  //sometimes we need clear gl context
  clearContext(){
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,0);
    
  },
};

export {glUtils}