import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import router from '@/router'

import { useStore, resetStore } from '@/store/index'
import List from '@/components/List.vue'

describe('List.vue', () => {
  it('should be loading', async (done) => {
    resetStore()
    const store = useStore()
    const wrapper = shallowMount(List, {
      stubs: [ 'router-link' ]
    })

    // Skip initial call
    try {
      await store.state.itemList.promise
    } catch (e) {
      expect(e === undefined)
    }

    store.dispatch.itemList.getItems()
    await wrapper.vm.$nextTick()

    // Test Loading exist
    expect(wrapper.find('.loading').text()).toEqual("Loading...")

    try {
      await store.state.itemList.promise
    } catch (e) {
      expect(e === undefined)
    }

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
      stubs: [ 'router-link' ]
    })

    try {
      await store.state.itemList.promise
    } catch (e) {
      expect(e === undefined)
    }
    await wrapper.vm.$nextTick()
    expect(wrapper.find('div').text()).toContain("You do not seems to be logged in")
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

    try {
      await store.state.itemList.promise
    } catch (e) {
      expect(e === undefined)
    }

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
