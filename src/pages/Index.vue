<template>
  <q-layout view="hHh lpR fFf" style="min-height:500px" id = 'index'>
    <q-header bordered class="bg-primary text-white" height-hint="98">
      <q-toolbar style="background-image: linear-gradient(25deg,  #091d67,  transparent);">
        <q-toolbar-title>
          <q-tabs align="left">
              <q-avatar>
                   <img src="../statics/icons/icon96x96.png">
              </q-avatar>
               <span style="width:100px;margin-left:10px">
                     Lava
               </span>
              <q-route-tab to="/showcase"      label="SHOWCASE" />
              <q-route-tab to="/shadercreator" label="SHADERBOX" />
              <q-route-tab to="/sandbox"       label="SANDBOX" />
              <q-route-tab to="/aboutAuthor"   label="ABOUT" />
         </q-tabs>
        </q-toolbar-title>
        <q-btn :icon="login?'eva-log-out-outline':'eva-log-in-outline'" flat @click="onClickLogin">
           
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container style="width:100%;height:100%">
      <router-view></router-view>
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar>
          <div class="column items-center" style="width:100%">
            <div class = "col">
              <q-item
                  clickable
                  tag="a"
                  target="_blank"
                  :href="link">
                  <q-item-section>豫ICP备18031111号-1</q-item-section>
              </q-item>
          </div>
        </div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>
<script>

import Vue from 'vue'
import LoginPanel from "../components/LoginPanel";
import {config} from "../scripts/src/framework/config"
export default {
  components:{
     LoginPanel
  },

  data () {
    return {
      link: 'http://www.beian.miit.gov.cn',
      login:false,
    }
  },
  mounted(){
    window.sessionStorage.clear();
  },
  methods:{
     onClickLogin(){
       if(!this.login){
          var obj=document.createElement("div");
          obj.id="LoginPanel";
          document.getElementById('index').appendChild(obj);  
          const component = Vue.extend(LoginPanel);
          this.instance = new component();
          this.instance.$mount("#LoginPanel");
          this.instance.setNotifyFunc(this.onLoginOk.bind(this));
       }else{
         //如果处于登录状态，则注销
          this.doLoginOut();
       }
     },
     onLoginOk(){
        this.login = true;
        window.sessionStorage.setItem('isLogin',this.login);
     },
     doLoginOut(){
        let username = window.sessionStorage.getItem('username');
        let utl = "login.php?username="+username+'&type=logout';  
        this.$axios.get(utl)
        .then(res => {
            let type = 'negative';
            if(res.data.code==200){
               type = 'positive'
               that.login = false;
               window.sessionStorage.setItem('isLogin',that.login);
            }
            this.$q.notify({
                type: type,
                message:res.data.msg,
                caption: 'warning',
                classes: 'glossy',
                progress:true,
                html: true
            });
            console.log('res data si '+JSON.stringify(res));
        })
     },
  },
}
</script>


 
