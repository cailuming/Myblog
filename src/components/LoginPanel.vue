<template>
   <q-dialog v-model="login" >
      <q-card style="min-width: 500px; height:450px">
        <q-toolbar class="bg-primary  text-white">
          <div class = "row items-center" style="width:100%">
             <div class = 'col-6' align='right'>
                 LOGIN
             </div>
              <div class = 'col-6' align='right'>
                 <q-btn flat icon = 'eva-close-outline' @click="onClickClose"></q-btn>
             </div>
          </div>
        </q-toolbar>
        <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
          <q-input
             filled
             v-model="formData.username"
             label="username"
             lazy-rules
             counter
             maxlength="24"
             :rules="[ val => val && val.length > 0 || 'Please type something']"
             style="padding:20px"
            />
           <q-input v-model="formData.password" filled 
             :type="isPassword ? 'password' : 'text'" 
              lazy-rules
              counter
              maxlength="24"
             :rules="[
                 val => val !== null && val !== '' || 'Please type your password',
                 val => val.length>=6 || 'password must be largger than 5'
             ]"
             style="padding:20px;margin-top: 0;"
             >
              <template v-slot:append>
                <q-icon
                  :name="isPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPassword = !isPassword"
                />
              </template>
         </q-input>
         <div class = 'row items-center' style="padding:20px">
             <div class = 'col-6'>
                 <q-input 
                    label="verifycode"
                    v-model="formData.verifycode"
                    lazy-rules
                    counter
                    maxlength="6"
                    :rules="[ val => val && val.length > 0 || 'Please type something']"
                    >
                 </q-input>
             </div> 
             <div class = 'col-6'>
                 <q-img
                    v-if="formData.username.length>0"
                    :src="verifyUrl+'login.php?username='+this.formData.username+'&change='+this.change+'&type=verify'"
                    spinner-color="white"
                    style="width: 200px; height: 50px;margin-left:20px; padding:0"
                    placeholder-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA
                    JYAAACWBAMAAADOL2zRAAAAG1BMVEXMzMyWlpaqqqq3t7fFxcW+vr6xsbGjo6Ocn
                    JyLKnDGAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABAElEQVRoge3SMW+DMBiE4YsxJ
                    qMJtHOTITPeOsLQnaodGImEUMZEkZhRUqn92f0MaTubtfeMh/QGHANERERERERER
                    EREtIJJ0xbH299kp8l8FaGtLdTQ19HjofxZlJ0m1+eBKZcikd9PWtXC5DoDotRO0
                    4B9YOvFIXmXLy2jEbiqE6Df7DTleA5socLqvEFVxtJyrpZFWz/pHM2CVte0lS8g2e
                    De6prOyqPglhzROL+Xye4tmT4WvRcQ2/m81p+/rdguOi8Hc5L/8Qk4vhZzy08Ddu
                    Gt9eVQyP2qoTM1zi0/uf4hvBWf5c77e69Gf798y08L7j0RERERERERERH9P99ZpS
                    VRivB/rgAAAABJRU5ErkJggg=="
                    @click="change = !change"
                  />
             </div> 
         </div>
          <div class = "row items-center" style="margin-top:10px;">
             <div class = 'col-12' align="center">
                 <q-btn label="SUBMIT" type="submit" color="primary" style="margin-right:20px"/>
                 <q-btn label="RESET" type="reset" color="primary" flat class="q-ml-sm" style="margin-left:20px"/>
             </div>
          </div>
       </q-form>
     </q-card>
    </q-dialog>
</template>

<script>
import {config} from '../scripts/src/framework/config'
export default {
  name: 'LoginPanel',
  components: { }, 
  mounted(){
     
    this.login = true;
  },
  data () {
    return {
      formData:{
         username:'',
         password:'',
         verifycode:"",
      },
      verifyImg:"",
      verifyUrl:config.base_url,
      onLoginOk:null,
      isPassword:true,
      login:false,
      change:false
    }
  },

  methods:{
   
    onSubmit(){
        let that = this; 
        let utl = config.base_url+"login.php?username="
        +this.formData.username+"&password= "
        +this.formData.password+"&verifycode="+this.formData.verifycode+'&type=login';  
        this.$axios.get(utl)
        .then(res => {
            let type = 'negative';
            if(res.data.code==200){
               type = 'positive'
               that.login = false;
               that.onLoginOk();
               window.sessionStorage.setItem('username',that.formData.username);
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