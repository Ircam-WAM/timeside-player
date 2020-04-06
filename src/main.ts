import Vue from 'vue'
import VueRouter from 'vue-router'
import VueCompositionApi from '@vue/composition-api'
import './utils/browser-update'

import Toasted from 'vue-toasted'
import { key as vueToastedKey } from '@/utils/vue-toasted'

import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

Vue.use(VueCompositionApi)
Vue.use(Toasted, {
  duration: 3000
})
Vue.use(VueRouter)

new Vue({
  // Switch to provideToasted() in setup when vue@3 is out
  provide: {
    [vueToastedKey as symbol]: Vue.toasted
  },
  router,
  render: h => h(App)
}).$mount('#app')
