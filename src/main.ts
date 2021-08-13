import { createApp } from 'vue'
import './utils/browser-update'

import App from './App.vue'
import router from './router'
import { apiInjectionKey, createApi } from './utils/api'

const app = createApp(App)
app.use(router)
app.provide(apiInjectionKey, createApi())
app.mount('#app')
