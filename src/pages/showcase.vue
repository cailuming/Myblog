<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <div class="row justify-center q-gutter-sm"  v-if ="cases_data.data!=0">
        <q-intersection 
           v-for="(item, index) in cases_data.data" 
           :key="index"
           transition="scale"
           class="item"
        > 
        <!-- item.cover_url -->
          <q-card class="q-ma-sm"> 
            <img style="height:220px" :src="item.cover_url"  @click="onClick(item)"> 
            <q-separator color="blue" size = "1px" inset style="width:100%;margin:0"> </q-separator> 
             <q-card-section style = "padding:0" >
               <q-btn :label="item.title" color="primary" flat >
                  <q-tooltip content-class="bg-indigo" content-style='width:200px'>
                    <div class="column q-gutter-md" >
                        <div class="row">
                          <div class="col-5">author:</div>
                          <div class="col-7 " align="right" style='white-space:nowrap;'>{{item.author}}</div>
                        </div>
                        <div class="row">
                          <div class="col-5">createTime:</div>
                          <div class="col-7 " align="right" style='white-space:nowrap;'>{{item.createtime}}</div>
                        </div>
                    </div>
                  </q-tooltip>
                </q-btn>
               <q-btn :label="item.viewcount" color="secondary" icon = 'eva-eye-outline' flat style="float:right">
                    <q-tooltip content-class="bg-indigo" >
                         visit count is {{item.viewcount}}
                   </q-tooltip>
               </q-btn>
            </q-card-section>
          </q-card>
        </q-intersection>
      
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import {config} from "../scripts/src/framework/config"
 
export default {
  components: { }, 
  data () {
    return {
      link: 'http://www.miit.gov.cn', 
      cases_data:{}, 
    }
  }, 
  mounted(){
      this.init();
  }, 
  methods: {
     init(){  
       
        config.isPause = true;
        let that = this; 
        let utl = "router.php?router_key=getCaseCount";  
        this.$axios.get(utl)
        .then(res => {
            that.cases_data = res.data
            console.log('....................cases_datas is '+JSON.stringify(that.cases_data));
        })
     }, 

     onClick(item){
      
       let that = this; 
       let utl = "router.php?router_key=addVisitCount&id="+item.id;  
       this.$axios.get(utl)
        .then(res => {
           sessionStorage.setItem('shaderID',item.id);
           that.$router.replace('/shadercreator')          
        })

       console.log('....................item is '+JSON.stringify(item));
     }, 
  }
}
</script>

<style lang="stylus" scoped>
   .item{
     width: 400px
     height: 270px
     min-height :270px
   }
   .text_shadow{
     text-shadow:-2px 2px 2px #00118844
   }
</style>
