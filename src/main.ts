import Vue from 'vue'
import VueRouter from 'vue-router'
import VueCompositionApi from '@vue/composition-api'

import Toasted from 'vue-toasted'

import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

Vue.use(VueCompositionApi)
Vue.use(Toasted)
Vue.use(VueRouter)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
