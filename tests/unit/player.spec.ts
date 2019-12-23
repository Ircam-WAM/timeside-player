import { shallowMount, mount } from '@vue/test-utils'
import Player from '@/components/Player.vue'

describe('Player.vue', () => {
  it('should shows title', () => {
    const msg = 'Beat it'
    const wrapper = shallowMount(Player)
    expect(wrapper.find('.title').text()).toEqual(msg)
  })

  it('mount should be fast enough (less than 50ms)', () => {
    const start = process.hrtime.bigint()
    mount(Player)
    const end = process.hrtime.bigint()
    const diffNs = end - start // nanoseconds as BigInt
    const diffMs = Number(diffNs) / 1000000 // milliseconds
    console.info('Execution time: %dms', diffMs)
    expect(diffMs).toBeLessThanOrEqual(50)
  })
})
