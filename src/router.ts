import { createRouter, createWebHashHistory } from 'vue-router'

import App from '@/views/App.vue'
// import ListView from '@/views/List.vue'
import ItemView from '@/views/Item.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    // { path: '/', name: 'list', component: ListView },
    { path: '/', name: 'app', component: App },
    { path: '/item/:id', name: 'item', component: ItemView }
  ]
})
