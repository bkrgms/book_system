import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import mitt from 'mitt';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';
//uygulamanın oluşturulması
const emitter = mitt();
const app = createApp(App);

app.config.globalProperties.emitter = emitter;

app.use(router)
   .use(store)
   .mount("#app");
