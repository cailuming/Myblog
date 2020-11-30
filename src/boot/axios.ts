import axios, { AxiosInstance } from 'axios';
import { boot } from 'quasar/wrappers';
//axios.defaults.baseURL = 'http://localhost/api/';
axios.defaults.baseURL = 'https://clmblog.cn/api/';

declare module 'vue/types/vue' {
  interface Vue {
    $axios: AxiosInstance;
  }
}

export default boot(({ Vue }) => {
  Vue.prototype.$axios = axios;
});
