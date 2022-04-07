import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router/index";
import i18n from "./plugins/i18n";
import store from "./plugins/vuex";
import VueSwal from "./plugins/swal";
import VueToast from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";

Vue.use(VueToast);
Vue.config.productionTip = false;

new Vue({
  router,
  vuetify,
  i18n,
  store,
  VueSwal,
  render: (h) => h(App),
}).$mount("#app");
