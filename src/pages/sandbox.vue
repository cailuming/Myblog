<template>
   <canvas id='sandCanvas'></canvas>
</template>
<script>
import {sandCanvas} from '../scripts/src/sandbox/sandCanvas'
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

  destroyed(){
     sandCanvas.clear();
  },
  methods: {
     init(){
        sandCanvas.init();
     }, 
  }
}
</script>
  
