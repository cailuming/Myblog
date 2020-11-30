import { Resource } from "./resource.js";
class Audio  
{
   timer = null 
   source = null 
   file = null
   audioCtx = null
   shouldStop = false
   frequencyData = [0]
   init(){
        //this.stop();
        this.initAudioEngine();
   }

   initAudioEngine(){
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // define audio context
        // Webkit/blink browsers need prefix,  Safari won't work without window.
        this.analyser = this.audioCtx.createAnalyser();
        this.scriptNode = this.audioCtx.createScriptProcessor(1024, 1, 1);
        this.source = this.audioCtx.createBufferSource();
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        this.gainNode = this.audioCtx.createGain();
        //
        this.source.connect(this.analyser);
        this.source.connect( this.gainNode);
        this.analyser.connect(this.scriptNode);
        this.scriptNode.connect(this.audioCtx.destination);
        this.gainNode.connect(this.audioCtx.destination)
   } 
   loadAudioFile(data){
        if(this.shouldStop) return;
        let thisObject = this;
        this.audioCtx.decodeAudioData(data,  
        function(buffer) {
            thisObject.play(buffer);
        }, 
        function(e){"Error with decoding audio data" + e.err});
  }
  
  loadAudioByUrl(url){
    this.shouldStop = false;
    let that =this;
    let xhr =new XMLHttpRequest()
    xhr.responseType = 'arraybuffer';
    xhr.addEventListener('load',function(){
      if(xhr.status ===200){
          that.loadAudioFile(xhr.response);
      }
    }.bind(this));
    xhr.open("GET",url);
    xhr.send(); 
  }

  play(buffer){
    var that = this;
    that.source.buffer = buffer;
    console.log('...............................playBuffer');
    that.source.loop = true;
    that.source.start(0);
    that.gainNode.gain.value = 0;
    that.limit = 0.8;
    this.timer = setInterval(function () {
        if(that.gainNode.gain.value<that.limit){
            that.gainNode.gain.value+=0.002; 
        }else{
            clearInterval(that.timer);
        }
    }, 40);
}

stop(){
    if(this.source&&this.source.buffer){
        this.source.stop(0) ;
        clearInterval(this.timer);
    }
    this.shouldStop = true;
} 

pause(){
    this.audioCtx.suspend();
}
resume(){
    this.audioCtx.resume();
}

getFreqData(){
    if(this.analyser!=null&&this.analyser!=undefined){
        this.analyser.getByteFrequencyData(this.frequencyData);
    }
    return this.frequencyData;
}

};

export {Audio};