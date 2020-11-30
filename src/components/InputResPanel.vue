<template>
     <q-dialog v-model="show"  
     full-height  
     full-width  
     transition-show="scale" 
     transition-hide="scale" 
     >
       <q-card class="my-card " style="width:100%; height:100%" >
           <q-toolbar class = 'bg-blue-10 text-white'>
              <q-tabs
                  v-model="tabindex"
                  dense
                  active-color="white"
                  indicator-color="white"
                  align="justify"
                  narrow-indicator
               >
                  <q-tab name="textures" label="textures" />
                  <q-tab name="audios"   label="audios" />
              </q-tabs>
            </q-toolbar>
              <q-tab-panels v-model="tabindex" animated >
                  <q-tab-panel name="textures" style="width:100%" >
                     <div class="row justify-center q-gutter-sm">
                      <q-intersection
                          v-for="(item,index) in textureData"
                          :key="index"
                          transition="scale"
                          class="example-item"
                        >
                          <q-card class="q-ma-sm">
                            <q-btn size='65px' :style='item.style' @click="onClick(item)"></q-btn>
                             <q-toolbar bg-purple text-white shadow-2>
                               {{item.title}}
                            </q-toolbar>
                          </q-card>
                        </q-intersection>
                      </div>
                  </q-tab-panel>
                   <q-tab-panel name="audios" style="width:100%" >
                        <div class="row justify-center q-gutter-sm">
                          <q-intersection
                              v-for="(item,index) in audioData"
                              :key="index"
                              transition="scale"
                              class="example-item"
                            >
                              <q-card class="q-ma-sm">
                                <q-btn size='65px' :style='item.style' @click="onClick(item)"></q-btn>
                                 <q-toolbar bg-purple text-white shadow-2>
                                   {{item.title}}
                                </q-toolbar>
                              </q-card>
                            </q-intersection>
                          </div>
                    </q-tab-panel>
            
              </q-tab-panels>
        </q-card>
     </q-dialog >
</template>

<script>
import {config} from '../scripts/src/framework/config'

export default {
  name: 'InputResPanel',
  components: { }, 
  mounted(){
    this.getData();
  },
  data () { 
    return {
      show:"",
      tabindex:'textures',
      inputData:[
      ],
      textureData:[
         {title:'',style:''}
      ],
      audioData:[
         {title:'',style:''}
      ],
      callFunc:null,
      parentID:0,
    }
  },

  methods:{
   
    getData(){
         let utl = "router.php?router_key=getChannelCount";
         let that = this;
         this.$axios.get(utl)
        .then(res => {
            if(res.data.code==200){
                that.inputData = res.data.data;
                that.textureData = [];
                that.audioData = [];
                
                that.inputData.forEach(e=>{
                 
                   if(e.type=='texture'){
                       e.rurl =e.url+'.jpg';
                       e.purl =e.url+'_preview.jpg';
                       e.parID = that.parentID;
                       e.style = " width:100%;height:100%;background:url("+e.purl+"); color: #FF0080";
                       that.textureData.push(e);
                   }else if(e.type=='audio'){
                       e.style = " width:100%;height:100%;background:url(../../statics/textures/channels/audio_preview.jpg); color: #FF0080";
                       e.parID = that.parentID;
                       that.audioData.push(e);
                   }
                });
               
            }else{
                this.$q.notify({
                  type: "negative",
                  message:res.data.msg,
                  caption: 'warning',
                  classes: 'glossy',
                  progress:true,
                  html: true
                });
            }
            
        })
       return true;
    },
    
    onClick(v){
       this.callFunc(v);
       this.show = false;
    },

    setCallFunc(cb,id){
       this.callFunc = cb;
       this.parentID = id;
    }, 
  }
}
</script>

<style lang="stylus" scoped>
    
    .example-item
    {
       width:300px
       height:250px
    }
   
   
</style>