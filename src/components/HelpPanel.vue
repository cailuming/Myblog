<template>
     <q-dialog v-model="show"  
        full-height  
        full-width  
        transition-show="scale" 
        transition-hide="scale" 
     >
       <q-card class="my-card " style="width:100%; height:100%;padding:30px 50px 20px 50px" >
            <div>
                <p class="text-h5 text-weight-border">
                  Shader Input Elements
                </p>
                <p class="text-body1 " style="font-weight: 500;">
                    There are some predefined uniforms which will help me do things easily
                </p>
                <div class="column " style="margin-top:20px">
                  <div class="row items-center q-pa-sm">
                    <div class="col-2" align='left'> 
                        <q-badge color="purple" transparent style="font-size: medium;height: 25px;">
                            channel0
                        </q-badge>
                      </div>
                      <div class="col-10" style="font-size: medium;height: 25px;"> 
                            the input channel0 from which we can get some useful data such as audio data or texture data.
                      </div>
                  </div>
                  <div class="row items-center q-pa-sm">
                    <div class="col-2" align='left'> 
                        <q-badge color="purple" transparent style="font-size: medium;height: 25px;">
                            channel1
                        </q-badge>
                      </div>
                      <div class="col-10" style="font-size: medium;height: 25px;"> 
                            the input channel1 from which we can get some useful data such as audio data or texture data.
                      </div>
                  </div>
                  <div class="row items-center q-pa-sm">
                    <div class="col-2" align='left'> 
                        <q-badge color="purple" transparent style="font-size: medium;height: 25px;">
                            channel2
                        </q-badge>
                      </div>
                      <div class="col-10" style="font-size: medium;height: 25px;"> 
                            the input channel2 from which we can get some useful data such as audio data or texture data.
                      </div>
                  </div>
                  <div class="row items-center q-pa-sm">
                    <div class="col-2" align='left'> 
                        <q-badge color="purple" transparent style="font-size: medium;height: 25px;">
                            channel3
                        </q-badge>
                      </div>
                      <div class="col-10" style="font-size: medium;height: 25px;"> 
                            the input channel3 from which we can get some useful data such as audio data or texture data.
                      </div>
                  </div>
                  <div class="row items-center q-pa-sm">
                    <div class="col-2" align='left'> 
                        <q-badge color="purple" transparent style="font-size: medium;height: 25px;">
                            iResolution
                        </q-badge>
                      </div>
                      <div class="col-10" style="font-size: medium;height: 25px;"> 
                            the input resolution of current canvas which we can use to map the uv between [0,1].
                      </div>
                  </div>
                  <div class="row items-center q-pa-sm">
                    <div class="col-2" align='left'> 
                        <q-badge color="purple" transparent style="font-size: medium;height: 25px;">
                            iTime
                        </q-badge>
                      </div>
                      <div class="col-10" style="font-size: medium;height: 25px;"> 
                            the input timestamp which we can use to march the animation frame .
                      </div>
                  </div>
                </div>
            </div>
            <div style="margin-top:30px">
                <p class="text-h5 text-weight-border">
                    How to use this editor
                </p>
                <p class="text-body1 " style="font-weight: 400;">
                    1. use Ctrl+Enter to run the modified code,and see what happened.
                </p>
                <p class="text-body1 " style="font-weight: 400;">
                    2. use Ctrl+S to save or update current code if you have signed in.
                </p>
                <p class="text-body1 " style="font-weight: 400;">
                    3. click one of the four little boxs below the main canvas,select some data as input channel.
                </p>
            </div>
       </q-card>
     </q-dialog >
</template>

<script>
export default {
  name: 'HelpPanel',
  components: { }, 
  mounted(){
    
  },
  data () { 
    return {
       show:'',
        
    }
  },

  methods:{
   
  }
}
</script>