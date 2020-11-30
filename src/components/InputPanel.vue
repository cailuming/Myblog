<template>
    <div class="row justify-center q-gutter-md" id ='input' style="height:100%">
        <div class = 'col' >
          <q-card class="my-card"  bordered style="padding:4px;margin-left:5px;"  >
            <q-card-section style="margin:0;padding:0;" ref = "ref_channel0"  @click="onClickChannel0">
                <canvas id = 'channel0'  ></canvas>
            </q-card-section>
            <q-card-actions style="height:30px;padding:0" >
                <div class='row items-center' style="width:100%">
                    <div class='col-8' style="padding:10px">
                      channel0
                    </div>
                    <div class='col-2' align='right'>
                      <q-btn flat size='xs' icon="eva-trash-2-outline" @click="onClickTrash0"></q-btn>
                    </div>
                    <div class='col-2 ' align='center'>
                      <q-btn flat size='xs' icon="eva-plus-outline" @click="onClickChannel0"></q-btn>
                    </div> 
                </div>
            </q-card-actions>
          </q-card>
        </div>
        <div class = 'col'>
            <q-card class="my-card"  bordered style="padding:4px;margin-left:5px;"  >
                <q-card-section style="margin:0;padding:0;"  ref = "ref_channel1" @click="onClickChannel1">
                    <canvas id = 'channel1' ></canvas>
                </q-card-section>
                <q-card-actions style="height:30px;padding:0" >
                    <div class='row items-center' style="width:100%">
                        <div class='col-8' style="padding:10px">
                          channel1
                        </div>
                        <div class='col-2' align='right'>
                          <q-btn flat size='xs' icon="eva-trash-2-outline"  @click="onClickTrash1"></q-btn>
                        </div>
                        <div class='col-2 ' align='center'>
                          <q-btn flat size='xs' icon="eva-plus-outline" @click="onClickChannel1"></q-btn>
                        </div> 
                    </div>
                </q-card-actions>
            </q-card>
        </div>
        <div class = 'col'>
          <q-card class="my-card"  bordered style="padding:4px;margin-left:5px "  >
              <q-card-section style="margin:0;padding:0;"  ref = "ref_channel2"  @click="onClickChannel2">
                  <canvas id = 'channel2'></canvas>
              </q-card-section>
              <q-card-actions style="height:30px;padding:0" >
                  <div class='row items-center' style="width:100%">
                      <div class='col-8' style="padding:10px">
                        channel2
                      </div>
                      <div class='col-2' align='right'>
                        <q-btn flat size='xs' icon="eva-trash-2-outline"  @click="onClickTrash2"></q-btn>
                      </div>
                      <div class='col-2 ' align='center'>
                        <q-btn flat size='xs' icon="eva-plus-outline" @click="onClickChannel2"></q-btn>
                      </div> 
                  </div>
              </q-card-actions>
          </q-card>
        </div>
          <div class = 'col'>
            <q-card class="my-card"  bordered style="padding:4px;margin-left:5px "  >
                <q-card-section style="margin:0;padding:0"  ref = "ref_channel3"  @click="onClickChannel3">
                    <canvas id = 'channel3'></canvas>
                </q-card-section>
                <q-card-actions style="height:30px;padding:0" >
                    <div class='row items-center' style="width:100%">
                        <div class='col-8' style="padding:10px">
                          channel3
                        </div>
                        <div class='col-2' align='right'>
                          <q-btn flat size='xs' icon="eva-trash-2-outline"  @click="onClickTrash3"></q-btn>
                        </div>
                        <div class='col-2 ' align='center'>
                          <q-btn flat size='xs' icon="eva-plus-outline" @click="onClickChannel3"></q-btn>
                        </div> 
                    </div>
                </q-card-actions>
            </q-card>
        </div>
    </div>
</template>

<script>
import InputResPanel from '../components/InputResPanel'
import {inputBlock} from "../scripts/src/shaderbox/inputBlock"
import Vue from 'vue'
export default {
  name: 'InputPanel',
  components: {InputResPanel }, 
  mounted(){
    this.init();
  },
  data () { 
    return {
       channel0:{
          canvas:null,
          resource:null,
          cover_url:'',
       },
       channel1:{
          canvas:null,
          resource:null,
          cover_url:'',
       },
       channel2:{
          canvas:null,
          resource:null,
          cover_url:'',
       },
       channel3:{
          canvas:null,
          resource:null,
          cover_url:'',
       },
       mainCanvasFunc:null,
    }
  },

  methods:{
    init(){
        this.channel0.canvas = document.getElementById('channel0');
        this.channel1.canvas = document.getElementById('channel1');
        this.channel2.canvas = document.getElementById('channel2');
        this.channel3.canvas = document.getElementById('channel3');
      
        this.channel0.obj = new inputBlock();
        this.channel0.obj.init(this.channel0.canvas);

        this.channel1.obj = new inputBlock();
        this.channel1.obj.init(this.channel1.canvas);

        this.channel2.obj = new inputBlock();
        this.channel2.obj.init(this.channel2.canvas);

        this.channel3.obj = new inputBlock();
        this.channel3.obj.init(this.channel3.canvas);

        let channelStyle0 = getComputedStyle(this.$refs.ref_channel0.$el);
        this.oheight  = channelStyle0.height.replace('px','');
       
        this.resize();
    },
    resize(){
         let that = this; 
         let channelStyle0 = getComputedStyle(this.$refs.ref_channel0.$el);
         let channelStyle1 = getComputedStyle(this.$refs.ref_channel1.$el);
         let channelStyle2 = getComputedStyle(this.$refs.ref_channel2.$el);
         let channelStyle3 = getComputedStyle(this.$refs.ref_channel3.$el);
        
         let width0  = channelStyle0.width.replace('px','');
         let height0 = channelStyle0.height.replace('px','');
         let width1  = channelStyle1.width.replace('px','');
         let height1 = channelStyle1.height.replace('px','');
         let width2  = channelStyle2.width.replace('px','');
         let height2 = channelStyle2.height.replace('px','');
         let width3  = channelStyle3.width.replace('px','');
         let height3 = channelStyle3.height.replace('px','');
        
         this.channel0.obj.setViewSize(width0,this.oheight-8);
         this.channel1.obj.setViewSize(width1,this.oheight-8);
         this.channel2.obj.setViewSize(width2,this.oheight-8);
         this.channel3.obj.setViewSize(width3,this.oheight-8);
    },

    setMainCanvasFunc(func){
        this.mainCanvasFunc = func;
    },

    addResourcePanel(id){
        var obj=document.createElement("div");
        obj.id="InputResPanel";
        document.getElementById('shaderCanvas').appendChild(obj);  
        const component = Vue.extend(InputResPanel);
        this.instance = new component();
        this.instance.$mount("#InputResPanel");
        this.instance.setCallFunc(this.onSelectRes.bind(this),id);
    },
    onSelectRes(v){
       if(v.parID==0){
          this.channel0.obj.onSelectResource(v);
       }else if(v.parID==1){
          this.channel1.obj.onSelectResource(v);
       }else if(v.parID==2){
          this.channel2.obj.onSelectResource(v);
       }else if(v.parID==3){
          this.channel3.obj.onSelectResource(v);
       }
       
       this.mainCanvasFunc([this.channel0.obj,this.channel1.obj,this.channel2.obj,this.channel3.obj]);
    },

    loadChannels(channelsData){
       let that = this;
     
       channelsData.forEach((element,index) => {
          element.parID = index;
          
           if(element.type=='texture'){
                element.rurl =element.url+'.jpg';
                element.purl =element.url+'_preview.jpg';
           }
          that.onSelectRes(element);
       });
    },

    getChannelString(){
       let ret = this.channel0.obj.info.id+"_"+
              this.channel1.obj.info.id+"_"+
              this.channel2.obj.info.id+"_"+
              this.channel3.obj.info.id;
       console.log('......getChannelString.....................'+ret);
       return ret;
    },

    onClickChannel0(){
        this.addResourcePanel(0);
    },

    onClickChannel1(){
       this.addResourcePanel(1);
    },

    onClickChannel2(){
       this.addResourcePanel(2);
    },

    onClickChannel3(){
       this.addResourcePanel(3);
    },

    onClickTrash0(){
       this.channel0.obj.onClear();
    },

    onClickTrash1(){
       this.channel1.obj.onClear();
    },

    onClickTrash2(){
       this.channel2.obj.onClear();
    },

    onClickTrash3(){
       this.channel3.obj.onClear();
    },
  }
}
</script>