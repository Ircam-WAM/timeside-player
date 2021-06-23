import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import router from '@/router'
import { ItemList } from '@/utils/api'

import { useStore, resetStore } from '@/store/index'
import List from '@/components/List.vue'
import Login from '@/components/Login.vue'

describe('List.vue', () => {
  it('should be loading', async (done) => {
    resetStore()
    const store = useStore()
    const wrapper = shallowMount(List, {
      stubs: [ 'router-link' ]
    })

    store.commit.itemList.setPromise(new Promise<ItemList[]>(() => {
      // this promise never resolves
    }))
    await wrapper.vm.$nextTick()

    // Test Loading exist
    expect(wrapper.find('.loading').text()).toEqual("Loading...")

    store.commit.itemList.unsetPromise()
    await wrapper.vm.$nextTick()

    // Test Loading do not exist
    expect(wrapper.find('.loading').exists()).toBe(false)
    done()
  })

  it('mount should be fast enough (less than 50ms)', () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)

    const start = process.hrtime.bigint()
    mount(List, {
      localVue,
      router
    })

    const end = process.hrtime.bigint()
    const diffNs = end - start // nanoseconds as BigInt
    const diffMs = Number(diffNs) / 1000000 // milliseconds
    console.info('Execution time: %dms', diffMs)
    expect(diffMs).toBeLessThanOrEqual(50)
  })

  it('show a message to login', async (done) => {
    resetStore()
    const store = useStore()
    const wrapper = shallowMount(List, {
      stubs: [ 'router-link', 'Login' ]
    })

    store.commit.itemList.setError(new Response(null, { status: 401 }))
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent(Login))
    done()
  })

  it('should list items', async (done) => {
    resetStore()
    const store = useStore()
    const localVue = createLocalVue()
    localVue.use(VueRouter)

    const wrapper = mount(List, {
      localVue,
      router
    })

    // Discard component request
    store.state.itemList.promise?.catch()

    const listItems = [
      { title: 'Beat it', description: 'Test case 1', uuid: '0' },
      { title: 'ABBA', description: 'song name: Tiger', uuid: '1' },
    ]

    store.commit.itemList.setItems(listItems)
    store.commit.itemList.unsetPromise()
    store.commit.itemList.unsetError()
    await wrapper.vm.$nextTick()

    const itemsContainer = wrapper.find('.items')
    expect(itemsContainer.exists()).toBe(true)

    const itemsChild = itemsContainer.findAll('a')
    expect(itemsChild.length).toBe(listItems.length)

    itemsChild.wrappers.forEach((child, idx) => {
      const storeItem = listItems[idx]
      expect(child.text()).toContain(storeItem.title)
      expect(child.text()).toContain(storeItem.description)
      expect(child.attributes().href).toBe(`#/item/${storeItem.uuid}`)
    })

    done()
  })
})
