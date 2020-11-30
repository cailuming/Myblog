<template>
  <div class="column">
    <q-card class="bgImage">
     <div style="padding:30px">
        <p class="text-h5 text-weight-border text_center">
            What's this site about
        </p>
        <p class="text-body1 tab" style="font-weight: 400;">
            It's my personal blog like,and inspired by ShaderToy(<span><a href="http://www.shadertoy.com">www.shadertoy.com</a></span>) which is a wonderful social,CG website created by Inigo Quilez and Pol Jeremias.
            Of course I'm still a noob in computer graphics,but I love it, so I create this site to improve my skill in some aspect.Also,It can show my efforts,will and ability.
        </p>
        <p class="text-body1 tab" style="font-weight: 400;">
            I will put more contents include learning experience, prototype demo and life story in future,mainly for myself.For security,some contents is private,you can not access it unless you are signed in        
        </p>
        <p class="text-h5 text-weight-border text_center">
            Who am I?
        </p>
        <p class="text-body1 tab" style="font-weight: 400;">
            My name is cailuming(蔡路明),graduated from ZhengZhou University of Light Industry in June 2014, Bachelor of Engineering. I'm not smart,and don't even have any
            sparking working experience and suffered a lot especially since March 2019.But,life is just like a box of chocolate,you never know what you are going to get.So what about tomorrow？ 
        </p>
        <p class="text-body1 tab" style="font-weight: 400;">
            By the way, all the music resources on my site are from <span><a href="https://freemusicarchive.org/">freemusicarchive.org</a></span>,
            if you are the author of one of those musics,and not happy to see it playing on my site,please contact me at <span style="text-decoration: underline">1550378369@qq.com</span>.I will remove it immediately.            
        </p>
     </div>
    </q-card>
  </div>
  
</template>
<script>
export default {
  components: { }, 
  data () {
    return {
      
      cases_data:0, 
    }
  }, 
  mounted(){
      this.init();
  }, 
  methods: {
     init(){
        
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
     .text_center{
        text-align :center
     }

     .tab{
       padding-left:100px;
       padding-right:100px;
     }
     
     .bgImage{
        width:100%;
        height:calc(90vh);
        margin :0;
        padding:0;
        background-image :radial-gradient(transparent, #364a47);
     }
 </style>
