<template>
   <q-popup-proxy >
     <q-card style="min-width: 500px; height:450px">
          <q-input
             filled
             v-model="needle"
             label="username"
             counter
             maxlength="24"
             style="padding:20px"
            />
     </q-card>
   </q-popup-proxy>
</template>

<script>
export default {
  name: 'SearchPanel',
  components: { }, 
  mounted(){
    console.log('......LoginPanel...........mounted....');
    this.login = true;
  },
  data () { 
    return {
      needle:"",
      verifyImg:"",
    }
  },

  methods:{
   
    onSearch(){
        let that = this; 
       
    },

    setNotifyFunc(incb){
        this.onLoginOk = incb;
    },

    onReset(){

    },
    onClickClose(){
       this.login = false;
    },
  }
}
</script>