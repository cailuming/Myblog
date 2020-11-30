
var Resource = {
  
  init(cb){
    this.audios=[
      "../../statics/audio/bgm0.mp3",
      "../../statics/audio/bgm1.mp3",
      "../../statics/audio/bgm2.mp3",
      "../../statics/audio/bgm3.mp3",
      "../../statics/audio/bgm4.mp3",
      "../../statics/audio/bgm5.mp3",
   ];
   this.loaded = 0;
   this.resourceList = {};
   this.totalCount = 9;
   this.curCount = 0;
   this.curCountShadow = 0;
   let audioID = this.audios[Math.floor(Math.random()*6)];
   this.finishCB = cb;
   this.load(audioID,this.resourceList,'audio',true);
   
   this.load("../../statics/models/aircraft.mod",this.resourceList,"aircraft",false);
   this.load("../../statics/models/board.mod",this.resourceList,"board",false);
   this.load("../../statics/models/ground.mod",this.resourceList,"ground",false);
   this.load("../../statics/models/sky.mod",this.resourceList,"sky",false);
   
   this.loadImage("../../statics/textures/pbrs/snow/snowdrift1_albedo.jpg",this.resourceList,'ground_base');
   this.loadImage("../../statics/textures/pbrs/snow/snowdrift1_Normal-ogl.jpg",this.resourceList,'ground_norm');
   this.loadImage("../../statics/textures/pbrs/snow/snowdrift1_Roughness.jpg",this.resourceList,'ground_rough');
   this.loadImage("../../statics/textures/pbrs/snow/snowdrift1_ao.jpg",this.resourceList,'ground_ao');
  },

  addCount(bool){
    if(bool){
      this.curCount++;
    }
    this.curCountShadow = this.curCount;
  },
  load(url,ret,key,isArray){
      let xhr =new XMLHttpRequest()
      if(isArray){ 
        xhr.responseType = 'arraybuffer';
      }
     
      xhr.addEventListener('load',function(){
        if(xhr.status ===200){
            ret[key] = xhr.response;
            this.addCount(false);
            this.percent = this.curCount/this.totalCount;
            if(this.curCount>=this.totalCount){
                this.loaded = 1;
                this.finishCB.call();
                console.log('...........................complete:'+this.curCount);
            }
        }
      }.bind(this));
      xhr.addEventListener('progress', this.onProgress.bind(this));
      xhr.open("GET",url);
      xhr.send(); 
  },

  loadImage(url,ret,key){
     ret[key]= new Image();
     ret[key].onload = function() {
        this.addCount(true);
        this.percent = this.curCount/this.totalCount;
        if(this.curCount>=this.totalCount){
            this.loaded = 1;
            console.log('...........................complete1:'+this.curCount);
        }
     }.bind(this);
     ret[key].src = url;
  },
 
  onProgress(e){
    //平滑加载进度
   
     this.curCount = this.curCountShadow+(e.loaded/e.total);
     this.percent = this.curCount/this.totalCount;
     console.log('...........................curCount:'+this.curCount);
     
    //  console.log('...........................total:'+e.total);
    //  console.log('...........................loaded:'+e.loaded);
  },
 
};

export {Resource}