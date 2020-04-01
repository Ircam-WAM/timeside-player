import { shallowMount, mount } from '@vue/test-utils'
import List from '@/components/List.vue'
import { useStore } from '@/store/index'

describe('List.vue', () => {
  it('should be loading', async (done) => {
    const wrapper = shallowMount(List)

    const store = useStore()
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
    const start = process.hrtime.bigint()
    mount(List)
    const end = process.hrtime.bigint()
    const diffNs = end - start // nanoseconds as BigInt
    const diffMs = Number(diffNs) / 1000000 // milliseconds
    console.info('Execution time: %dms', diffMs)
    expect(diffMs).toBeLessThanOrEqual(50)
  })

  it('show a message to login', async (done) => {
    const wrapper = shallowMount(List)
    const store = useStore()

    try {
      await store.state.itemList.promise
    } catch (e) {
      expect(e === undefined)
    }
    await wrapper.vm.$nextTick()
    expect(wrapper.find('div').text()).toContain("You do not seems to be logged in")
    done()
  })
})
