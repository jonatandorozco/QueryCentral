import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import { Notification } from 'element-ui'
import { Titlebar, Color } from 'custom-electron-titlebar'

Vue.config.productionTip = false

Vue.prototype.$axios = axios
Vue.prototype.API_URL = 'http://127.0.0.1:3333'
Vue.prototype.$notify = Notification

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

// eslint-disable-next-line no-new
const titleBar = new Titlebar({
  backgroundColor: Color.fromHex('#181d24'),
  shadow: true,
  icon: 'icon.svg'
})

titleBar.updateTitle('QueryCentral')
