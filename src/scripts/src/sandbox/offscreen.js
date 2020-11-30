 
import {CommonShader} from '../../shader/shader_common.js';
import {glUtils} from '../framework/glUtils.js';
 
import {math3D} from "../framework/math.js"
import {Camera} from '../framework/camera.js';
import {Aircraft} from './aircraft.js';
import {Sky} from './sky.js';
import {Ground} from './ground.js';
import {global} from '../framework/global.js';
import {BoardList} from './boardList.js';

var OffScreen = {

  init() {
    // If we don't have a GL context, give up now
    this.vBuffer   = glUtils.createQuadVertexBuffer();
  
    this.matCamera = new Camera();
    this.matCamera.lookAt([0,2.0,-10],[0,0,0],[0,1,0]);
  
    global.matView = this.matCamera.matView;
    global.matEyeView = this.matCamera.matView;
    global.matViewInv = this.matCamera.matViewInv;
    global.lightpos = [0,50,140];
    global.matProj  =math3D.perspectiveMatrix(Math.PI/4,window.innerWidth/window.innerHeight,0.1,1000);
    global.matProjInv = math3D.inverseMatrix(global.matProj);
    global.matLightView=math3D.lookAtMatrix(global.lightpos,[0,0,0],[0,1,0]);
    global.matOrthProj  =math3D.OrthMatrix(window.innerWidth*-0.5,window.innerWidth*0.5,window.innerHeight*0.5,-window.innerHeight*0.5,0.1,1000);
    global.matOrthProjInv = math3D.inverseMatrix(global.matOrthProj);
    global.matPerspectiveProj = global.matProj.slice(0);

    this.initFrameBuffer();
    this.initScene();

    window.addEventListener( 'keyup', this.onKeyUp.bind(this), false);
    window.addEventListener( 'keydown', this.onKeyDown.bind(this), false);
   
  },
  
  getCameraZFromNDC(ndcz,near,far) {
    return  2.0*( near * far ) / ( far*(1.0-ndcz)+near*(1.0+ndcz));
  },

  getCameraPosFromNDC(x,y,zw) {
   var asp =window.innerWidth/window.innerHeight;
   return [x*asp*Math.tan(Math.PI/8.0)*zw,y*Math.tan(Math.PI/8.0)*zw,zw];
  },

  test(){
     var p =[0,1,6,1];
     math3D.mul_Vector4_Matrix(p,p.slice(0),global.matView);
     //math3D.mul_Vector4_Matrix(p,p.slice(0),global.matProjInv);
     console.log('.............p is after camera :\n'+p);
     math3D.mul_Vector4_Matrix(p,p.slice(0),global.matViewInv);
     console.log('.............p is backup camera :\n'+p);
     

  },
  
  initScene(){
    this.aircraft = new Aircraft();
    this.aircraft.init(this.matCamera);
    this.ground = new Ground();
    this.ground.init();
    this.sky = new Sky();
    this.sky.init();
    this.boardList = new BoardList();
    this.boardList.init();
  },

  initFrameBuffer(){
    this.renderTexture = glUtils.createRenderTargetTexture();
    this.depthTexture =  glUtils.createDepthTexture();
    this.shadowTexture =  glUtils.createDepthTexture();
    this.postFrameBuffer = glUtils.createFrameBuffer(this.renderTexture,this.depthTexture);
    this.shadowFrameBuffer = glUtils.createFrameBuffer(this.renderTexture,this.shadowTexture);
  },
  
  initShader(vs,ps){
    const shaderProgram = glUtils.createShaderProgram(vs, ps,function(str){
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
        iResolution: glUtils.gl.getUniformLocation(shaderProgram, 'iResolution'),
      
        uAudioSource:    glUtils.gl.getUniformLocation(shaderProgram, 'uAudioSource'),
      },
    };
    return programInfo;
  },
  onKeyUp(e){
    if(e.key=='w'){
      //this.matCamera.
       this.aircraft.key.up=false;
    }else if(e.key=='s'){
       this.aircraft.key.down=false;
    }
    if(e.key=='a'){
       this.aircraft.key.left=false;
    }else if(e.key=='d'){
       this.aircraft.key.right=false;
    } 
  },

  onKeyDown(e){
    if(e.key=='w'){
      //this.matCamera.
       this.aircraft.key.up=true;
    }else if(e.key=='s'){
       this.aircraft.key.down=true;
    }

    if(e.key=='a'){
       this.aircraft.key.left=true;
    }else if(e.key=='d'){
       this.aircraft.key.right=true;
    }  
  },
  
  render(timestamp){
    this.renderDepth(timestamp);
    this.renderPost(timestamp);
    this.matCamera.update(timestamp);
  },
  
  renderDepth(timestamp){
      glUtils.gl.bindFramebuffer(glUtils.gl.FRAMEBUFFER, this.shadowFrameBuffer);
      global.matView = global.matLightView;
      global.matProj = global.matPerspectiveProj;
      
      glUtils.gl.enable(glUtils.gl.DEPTH_TEST);
      glUtils.gl.depthFunc(glUtils.gl.LEQUAL);            // Near things obscure far things
      glUtils.gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
      glUtils.gl.clearDepth(1.0);
      glUtils.gl.clear(glUtils.gl.COLOR_BUFFER_BIT | glUtils.gl.DEPTH_BUFFER_BIT);
    
      glUtils.gl.enable(glUtils.gl.BLEND);
      glUtils.gl.blendFunc(glUtils.gl.SRC_ALPHA, glUtils.gl.ONE_MINUS_SRC_ALPHA);
      
      this.renderObj(timestamp,true);
      glUtils.gl.bindFramebuffer(glUtils.gl.FRAMEBUFFER,null);
      global.depthTexture = this.shadowTexture;
  },

  renderPost(timestamp){
      glUtils.gl.bindFramebuffer(glUtils.gl.FRAMEBUFFER, this.postFrameBuffer);
      global.matView = global.matEyeView;
      global.matProj = global.matPerspectiveProj;

      glUtils.gl.enable(glUtils.gl.DEPTH_TEST);
      glUtils.gl.depthFunc(glUtils.gl.LEQUAL);            // Near things obscure far things
      glUtils.gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
      glUtils.gl.clearDepth(1.0);
      glUtils.gl.clear(glUtils.gl.COLOR_BUFFER_BIT | glUtils.gl.DEPTH_BUFFER_BIT);
    
      glUtils.gl.enable(glUtils.gl.BLEND);
      glUtils.gl.blendFunc(glUtils.gl.SRC_ALPHA, glUtils.gl.ONE_MINUS_SRC_ALPHA);
    
      this.renderObj(timestamp,false);
      glUtils.gl.bindFramebuffer(glUtils.gl.FRAMEBUFFER,null);
  },

  renderObj(timestamp,isdepth){
     this.aircraft.render(timestamp,isdepth);
     this.ground.render(timestamp,isdepth);
     this.sky.render(timestamp,isdepth);
     this.boardList.render(timestamp,isdepth);
  },
};

export {OffScreen}