import Vue from 'vue'
import VueRouter from 'vue-router'
import VueCompositionApi from '@vue/composition-api'
import './utils/browser-update'

import Toasted from 'vue-toasted'
import { key as vueToastedKey } from '@/utils/vue-toasted'

import PlayerContainer from '@/components/PlayerContainer.vue'
import router from './router'

Vue.config.productionTip = false

Vue.use(VueCompositionApi)
Vue.use(Toasted, {
  duration: 3000
})
Vue.use(VueRouter)

interface TimesidePlayer {
  _instance: Vue;
  destroy: () => void;
}

export default function (target: Element | string, itemId: string): TimesidePlayer {
  const _instance = new Vue({
    // Switch to provideToasted() in setup when vue@3 is out
    provide: {
      [vueToastedKey as symbol]: Vue.toasted
    },
    router,
    render: h => h(PlayerContainer, { props: { itemId } })
  }).$mount(target)

  const destroy = () => {
    _instance.$destroy()
  }

  return {
    _instance,
    destroy
  }
}
