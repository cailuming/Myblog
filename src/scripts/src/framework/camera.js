
import {math3D} from "./math.js"
import {global} from './global.js';
class Camera{
 
  constructor(){
    this.matView = [];
    this.matRotateA = [];
    this.matRotateB = [];
    this.matViewInv = [];
    this.pos = [];
    this.look = [0, 0, 1];
    this.right = [1, 0, 0];
    this.up = [0, 1, 0];
    math3D.identityMatrix(this.matView);
  }
  lookAt(eye, tar, up){
    this.pos = eye;
    this.look = math3D.normalize([tar[0]-eye[0], tar[1]-eye[1], tar[2]-eye[2]]);
    this.right = math3D.normalize(math3D.cross(up, this.look));
    this.up = math3D.normalize(math3D.cross(this.look, this.right));
    this.update();
  }
  moveFront(off){
      this.pos[0]+=this.look[0]*off;
      this.pos[1]+=this.look[1]*off;
      this.pos[2]+=this.look[2]*off;
  }

  moveRight(off){
      this.pos[0]+=this.right[0]*off;
      this.pos[1]+=this.right[1]*off;
      this.pos[2]+=this.right[2]*off;
  }

  moveUp(off){
      this.pos[0]+=this.up[0]*off;
      this.pos[1]+=this.up[1]*off;
      this.pos[2]+=this.up[2]*off;
  }

  rotateX(off){
      math3D.rotateXMatrix(this.matRotateA, off);
      math3D.mul_Vector3_Matrix(this.up, this.up.slice(0), this.matRotateA);
      math3D.mul_Vector3_Matrix(this.look, this.look.slice(0), this.matRotateA);
  }

  rotateY(off){
      math3D.rotateYMatrix(this.matRotateA, off);
      math3D.mul_Vector3_Matrix(this.right, this.right.slice(0), this.matRotateA);
      math3D.mul_Vector3_Matrix(this.look, this.look.slice(0), this.matRotateA);
  }

  rotateZ(off){
      math3D.rotateXMatrix(this.matRotateA, off);
      math3D.mul_Vector3_Matrix(this.right, this.right.slice(0), this.matRotateA);
      math3D.mul_Vector3_Matrix(this.look, this.look.slice(0), this.matRotateA);
  }

  follow(targetpos, off, spd){
      var dir = [targetpos[0]-this.pos[0], targetpos[1]-this.pos[1], targetpos[2]-this.pos[2]];
      this.look = math3D.normalize(dir);
      this.right = math3D.normalize(math3D.cross([0, 1, 0], this.look));
      this.up = math3D.normalize(math3D.cross(this.look, this.right));

      if(this.pos[0]<targetpos[0]-this.look[0]*off){
        this.pos[0]+=Math.abs(targetpos[0]-this.look[0]*off-this.pos[0])*spd;
      }

      if(this.pos[1]<targetpos[1]+1.0){
        this.pos[1]+=Math.abs(targetpos[1]+1.0-this.pos[1])*spd;
      }

      if(this.pos[2]<targetpos[2]-this.look[2]*off){
        this.pos[2]+=Math.abs(targetpos[2]-this.look[2]*off-this.pos[2])*spd;
      }
      
      if(this.pos[0]>targetpos[0]-this.look[0]*off){
        this.pos[0]-=Math.abs(targetpos[0]-this.look[0]*off-this.pos[0])*spd;
      }

      if(this.pos[1]>targetpos[1]+0.5){
           this.pos[1]-=Math.abs(targetpos[1]+0.5-this.pos[1])*spd;
      }

      if(this.pos[2]>targetpos[2]-this.look[2]*off){
        this.pos[2]-=Math.abs(targetpos[2]-this.look[2]*off-this.pos[2])*spd;
      }
       
  }

  update(){
      this.right =math3D.normalize(this.right);
      //直接取反了
      this.look  =math3D.normalize(math3D.cross(this.right, this.up));
      this.up    = math3D.normalize(math3D.cross(this.look, this.right));
      this.right = math3D.normalize(math3D.cross(this.up, this.look));

      this.matView[0] = this.right[0];  this.matView[1] = this.right[1];  this.matView[2] = this.right[2]; this.matView[3] =-math3D.dot(this.right, this.pos);
      this.matView[4] = this.up[0];     this.matView[5] = this.up[1];     this.matView[6] = this.up[2];    this.matView[7] =-math3D.dot(this.up, this.pos);
      this.matView[8] = this.look[0];   this.matView[9] = this.look[1];   this.matView[10]= this.look[2];  this.matView[11] =-math3D.dot(this.look, this.pos);
      this.matView[12] =0;              this.matView[13]= 0;              this.matView[14]= 0;             this.matView[15] =1;
      // whether it will affect the 
      this.matViewInv = math3D.inverseMatrix(this.matView);
      global.matEyeView = this.matView;
      global.matViewInv = this.matViewInv;
    
  }
};

export {Camera}