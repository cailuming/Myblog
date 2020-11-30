<template>
  <q-layout view="hHh lpR fFf" style="min-height:500px"  id='shadercreator' >
    <q-page-container style="width:100%;height:100%">
      <div class="column" >
          <div class="col-8">
            <div class="row justify-center q-gutter-md" style="width:100%;height:70%; margin: 0;">
               <div class="col" style="margin:5px">
                  <q-card class="my-card" style="padding:1">
                      <q-card-section class="primary-text text-black" style="padding:0;margin: 0 0 -5px 0;">
                          <q-toolbar class="primary-text text-black  rounded-borders " >
                              <q-item flat>
                                <q-item-section>PREVIEW</q-item-section>
                              </q-item>   
                              <q-item flat>
                                <q-item-section>{{fpsCount}}FPS</q-item-section>
                              </q-item>  
                          </q-toolbar> 
                          <canvas id ='shaderCanvas' classs="inline" style="margin:0; "></canvas>
                      </q-card-section>
                      <q-separator />
                      <q-card-actions align="right">
                        <q-btn flat  :icon="isPlay?'eva-pause-circle-outline':'eva-play-circle-outline'" @click="onClickPlay"></q-btn>
                        <q-btn flat  :icon="soundVolume>0?'eva-volume-up-outline':'eva-volume-off-outline'" @click="onClickSound"></q-btn>
                        <q-btn flat  icon="eva-expand-outline" @click="onToggleFullScreen"></q-btn>
                      </q-card-actions>
                  </q-card>
              </div>
              <div class="col" style="margin:5px">
                    <q-card class="my-card" style="padding:1px">
                      <q-toolbar class="primary-text text-black shadow-3 rounded-borders">
                          <q-item flat>
                            <q-item-section>CODE EDITOR</q-item-section>
                          </q-item>
                          <q-space />
                          <q-btn round  flat  icon="eva-plus-outline" @click="onClickAdd"/>
                          <q-btn round  flat :disable="!isLogin"  icon="eva-save-outline" @click="onClickSave"/>
                          <q-btn round  flat  icon="eva-more-vertical-outline" @click="onClickHelp"/>
                        </q-toolbar>
                        <editor v-model="content" @init="editorInit" ref='myEditor' lang="glsl" theme="chrome"></editor>
                    </q-card>
              </div> 
          </div>
      </div>
      <!-- 控制台跟通道输入 -->
      <div class="col-2">
           <div class="row justify-center q-gutter-md"  style="margin-top:-5px">
             <div class = 'col'>
                 <InputPanel ref="inputPanel"></InputPanel>
              </div>
              <div class = 'col'>
                  <div class="row justify-center q-gutter-md">
                     <div class='col'>
                        <q-card class="my-card" ref = "console" bordered style="padding:3px "  >
                          <q-item ref="ta" >
                             <p style="word-break:break-all" >
                                 {{debugConsole}}
                             </p>
                          </q-item>
                        </q-card>
                     </div>
                 </div>
              </div>
           </div>
      </div>
    </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import {shaderCanvas} from "../scripts/src/shaderbox/canvas"
import {glUtils} from "../scripts/src/framework/glUtils"
import {DefaultShader} from "../scripts/shader/default"
import {config} from "../scripts/src/framework/config"
import {Audio} from "../scripts/src/framework/audio"
import { Resource } from '../scripts/src/framework/resource'
import { global } from '../scripts/src/framework/global'
import InputPanel from '../components/InputPanel'
import HelpPanel from '../components/HelpPanel'

import Vue from 'vue'
var jpeg = require('jpeg-js');
export default {
  data () {
    return {
      content:"", 
      debugConsole:"", 
      textAreaStyle:'',
      myEditor:"", 
      isFullScreen:false, 
      isLogin:false,
      isPlay:false,
      soundVolume:50,
      fpsCount:0,
      totalInter:0,
    }
  }, 
  mounted(){
      this.init();
      this.loadShader();
  },
  destroyed() {
      shaderCanvas.clear();     
  },
 
  components: {
    editor: require('vue2-ace-editor'), 
    InputPanel,
    HelpPanel
  }, 

  watch: {
    '$q.fullscreen.isActive'(val) {
        this.onResize(val);
    },
   
  }, 
  methods: {
     init(){
        glUtils.init('shaderCanvas');
        shaderCanvas.init();
        shaderCanvas.setCallFunc(this.update.bind(this),this.onCompile.bind(this));
        this.$refs.inputPanel.setMainCanvasFunc(shaderCanvas.onChangeChannel.bind(shaderCanvas));
     
        this.isLogin = window.sessionStorage.getItem('isLogin');
        this.initEditorInfo();
        this.setInitDomSize();
        window.addEventListener("resize", this.onResize.bind(this));
        window.addEventListener("beforeunload", this.onBeforeUnload.bind(this));
     }, 
     
     initEditorInfo(){
        this.myEditor= this.$refs.myEditor;
      
        this.myEditor.editor.setOption("wrap",  "free");
        this.myEditor.editor.setFontSize(20);
      
        this.myEditor.editor.getSession().setUseWrapMode(false);
        this.myEditor.editor.setShowPrintMargin(false);
        this.myEditor.editor.setHighlightActiveLine(true); //代码
        this.myEditor.editor.setOptions({
           enableBasicAutocompletion: true, 
           enableSnippets: true, 
           enableLiveAutocompletion: true
        });
 
        this.myEditor.editor.resize();

        this.myEditor.editor.commands.addCommand({
            name: 'find', 
            bindKey: {win: 'Ctrl-F',  mac: 'Command-F'}, 
            exec: this.onFindWords, 
            readOnly: false // 如果不需要使用只读模式，这里设置false
        });

        this.myEditor.editor.commands.addCommand({
            name: 'save', 
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'}, 
            exec: this.onClickSave, 
            readOnly: false // 如果不需要使用只读模式，这里设置false
        });

        this.myEditor.editor.commands.addCommand({
            name: 'run', 
            bindKey: {win: 'Alt-Enter',  mac: 'Alt-Enter'}, 
            exec: this.onClickRun, 
            readOnly: false // 如果不需要使用只读模式，这里设置false
        });
     },
     setInitDomSize(){
         if(this.$refs.console){
             this.$refs.console.$el.style.height = (window.innerHeight*0.4-180)+"px";
         }
         this.$refs.inputPanel.resize();
         
         if(this.isFullScreen==true){
            glUtils.setGLViewSize( window.innerWidth, window.innerHeight);
         }else{
            glUtils.setGLViewSize( window.innerWidth*0.5-10, window.innerHeight*0.6-51);
         }
        
         if(this.myEditor){
            this.myEditor.$el.style.width = (window.innerWidth*0.5-20)+"px";
            this.myEditor.$el.style.height = (window.innerHeight*0.6)+"px";
            this.myEditor.editor.resize(true);
         }  
     },

     loadShader(){
        let shaderID =  sessionStorage.getItem('shaderID');
        if(shaderID!=null&&shaderID!=undefined){
             let utl = "router.php?router_key=loadShaderByID&id="+shaderID;
             this.$axios.get(utl)
            .then(res => {
            
                if(res.data.code==200){
                  shaderCanvas.reloadShader(atob(res.data.content))
                  this.$refs.inputPanel.loadChannels(res.data.channelData),
                  this.myEditor.editor.setValue(atob(res.data.content),-1);
                  this.onClickPlay();
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
        }else{
           shaderCanvas.reloadShader(DefaultShader.pixelShader);
           this.myEditor.editor.setValue(DefaultShader.pixelShader,-1);
           this.onClickPlay();
        }
        //only if the shader is ready so that we can play
       
     },
     editorInit() {
        require('brace/ext/language_tools') //language extension prerequsite...
        // require('brace/mode/html')                
        // require('brace/mode/javascript')    //language
        require('brace/mode/glsl')    //language
        // require('brace/mode/less')
        require('brace/theme/chrome')
        require('brace/snippets/javascript') //snippet
        require('brace/snippets/glsl') //snippet
     }, 

     onToggleFullScreen(){
       let that =this;
       this.$q.fullscreen.toggle(glUtils.canvas)
        .then(() => {
            that.isFullScreen = true;
        })
        .catch((err) => {
          alert(err)
          // uh,  oh,  error!!
          // console.error(err)
        })
     }, 

     onClickSound(){
       this.soundVolume = this.soundVolume>0?0:1;
       if(this.soundVolume>0){
         shaderCanvas.setAllMusicState(true);
       }else{
         shaderCanvas.setAllMusicState(false);
       }
     },

     onClickPlay(){
        shaderCanvas.isPause = this.isPlay;
        this.isPlay = !this.isPlay;
     },
     onFindWords(editor){
         
     }, 

     onCompile(error,color){
        this.$refs.ta.$el.style ="color:"+color+" !important;font-size: large;"
         
        this.debugConsole  = error;
       
     },

     onResize(v){
       
        if(typeof v =="boolean"){
           this.isFullScreen = v;
        }
       
        this.setInitDomSize();
     }, 

     onClickRun(){
         shaderCanvas.reloadShader(this.myEditor.editor.getValue())
     },

     onBeforeUnload(){
         shaderCanvas.setAllMusicState(false);
     },

     onClickHelp(){
        var obj=document.createElement("div");
        obj.id="HelpPanel";
        document.getElementById('shaderCanvas').appendChild(obj);  
        const component = Vue.extend(HelpPanel);
        this.instance = new component();
        this.instance.$mount("#HelpPanel");
     },

     onUpLoadImg(shaderID){
      
        let httpPost = new XMLHttpRequest();
        let path = config.base_url+"upload.php?id="+shaderID+"&base_url="+config.base_url;
       
        let data = shaderCanvas.getScreenData();
        var rawImageData = {
          data: data,
          width: glUtils.getResolution()[0],
          height:glUtils.getResolution()[1],
        };

        var jpegImageData = jpeg.encode(rawImageData, 50);
        console.log('shaderID is '+path);

        httpPost.onreadystatechange = function(err) {
            if (httpPost.readyState == 4 && httpPost.status == 200){
                console.log(httpPost.responseText);
            } else {
                console.log(err);
            }
        };
      
        httpPost.open("POST", path, true);
        httpPost.setRequestHeader('Content-Type', 'application/octet-stream');
        httpPost.send(jpegImageData.data);
     },

     onClickSave(){
        let that = this;
        // we assume that the shaderID is unique gloablly
        let shaderID = sessionStorage.getItem('shaderID');
        let username = sessionStorage.getItem('username');
        console.log('......................shaderID....sessionStorage is '+shaderID);
        let data={
           content:btoa(this.myEditor.editor.getValue()),
           channels:this.$refs.inputPanel.getChannelString(),
           username:username,
           id:shaderID
        };
        let utl = "router.php?router_key=updateShader";  
        if(shaderID==undefined||shaderID==null){
           this.onClickAdd();
        }else{
             this.$axios.post(utl,JSON.stringify(data),{ headers: {'Content-Type': 'application/json'}})
            .then(res => {
                let type = 'negative';
                if(res.data.code==200){
                  type = 'positive'
                  this.onUpLoadImg(shaderID);
                }
                this.$q.notify({
                    type: type,
                    message:res.data.msg,
                    caption: 'warning',
                    classes: 'glossy',
                    progress:true,
                    html: true
                });
             })
        }
     },

     onClickAdd(){
         let that = this; 
         let secs = new Date().getTime();
         this.$q.dialog({
           title: 'WARNING',
           message: 'do you want to recover current segment and create a new one?',
           prompt: {
              model: 'title_name_'+secs,
              isValid: val => val.length > 2, // << here is the magic
              type: 'text' // optional
           },
          cancel: true,
          persistent: true
        }).onOk(data => {
           //只有登录才会真正添加到数据库
           if(window.sessionStorage.getItem('isLogin')){
               that.onQueryAdd(data);
           }else{
               shaderCanvas.reloadShader(DefaultShader.pixelShader)
               this.myEditor.editor.setValue(DefaultShader.pixelShader,-1);
           }
        })
     },

     onQueryAdd(title){
        let that = this; 
        let username = window.sessionStorage.getItem('username');
         
        let content = btoa(this.myEditor.editor.getValue());
        let data = {
           content:content,
           channels:this.$refs.inputPanel.getChannelString(),
           title:title,
           username:username
        };
 
        let utl = "router.php?router_key=addShader";
        this.$axios.post(utl,JSON.stringify(data),{ headers: {'Content-Type': 'application/json'}})
        .then(res => {
            let type = 'negative';
            if(res.data.code==200){
               type = 'positive';
               shaderCanvas.reloadShader(atob(content))
               window.sessionStorage.setItem('shaderID',res.data.shaderID);
               this.myEditor.editor.setValue(atob(content),-1);
            
               this.onUpLoadImg(res.data.shaderID);
            }
            this.$q.notify({
                type: type,
                message:res.data.msg,
                caption: 'warning',
                classes: 'glossy',
                progress:true,
                html: true
            });
        })
     },

     update(fpsCount){
        this.fpsCount = fpsCount;
     }
  }
}
</script>
 
