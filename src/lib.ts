import { createApp, App } from 'vue'
import './utils/browser-update'

import PlayerContainer from './components/PlayerContainer.vue'
import router from './router'
import { apiInjectionKey, createApi } from './utils/api'

interface TimesidePlayer {
  _instance: App
  destroy: () => void
}

export default function (target: Element | string, itemId: string, apiBaseUrl?: string): TimesidePlayer {
  const app = createApp(PlayerContainer, { itemId })
  app.use(router)
  app.provide(apiInjectionKey, createApi(apiBaseUrl))
  app.mount(target)

  const destroy = (): void => { app.unmount() }

  return {
    _instance: app,
    destroy
  }
}
