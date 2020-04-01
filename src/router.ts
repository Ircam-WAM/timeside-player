import VueRouter from 'vue-router'

import ListView from '@/views/List.vue'
import ItemView from '@/views/Item.vue'

export default new VueRouter({
  routes: [
    { path: '/', name: 'list', component: ListView },
    { path: '/item/:id', name: 'item', component: ItemView }
  ]
})
