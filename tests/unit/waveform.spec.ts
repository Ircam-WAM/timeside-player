import { shallowMount } from '@vue/test-utils'
import Waveform from '@/components/Waveform.vue'
import { useStore, resetStore } from '@/store/index'
import { CurrentTimeSource } from '@/store/audio'

describe('Waveform.vue', () => {

  // Mock getBoundingClientRect
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    Element.prototype.getBoundingClientRect = jest.fn(() => {
      return {
        width: 120,
        height: 120,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON() {
          return this
        }
      }
    })
  })

  it('should render a waveform', async (done) => {
    const wrapper = shallowMount(Waveform, {
      propsData: {
        waveform: [
          { time: 0, max: 0, min: 1 }
        ]
      }
    })
    await wrapper.vm.$nextTick()

    const area = wrapper.find('.waveform > .chart > .chart-data > .area')
    expect(area.attributes('d')).toBeDefined()
    const path = area.attributes('d')
    if (path === undefined) {
      throw new Error('unexpected empty attributes')
    }
    expect(path.length > 0).toBe(true)

    done()
  })

  it('should set currentTime', () => {
    resetStore()
    const store = useStore()

    const wrapper = shallowMount(Waveform, {
      propsData: {
        waveform: [
          { time: 0, max: 0, min: 1 }
        ]
      }
    })

    const svg = wrapper.find('.chart')
    svg.trigger('click', {
      clientX: 60
    })

    expect(store.state.audio.currentTime.source).toBe(CurrentTimeSource.Cursor)
    // In our example, file duration is 0, so currentTime.value is 0
    expect(store.state.audio.currentTime.value).toBe(0)
  })
})
