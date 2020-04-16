import { shallowMount } from '@vue/test-utils'
import { Waveform as WaveformType } from '@/types/waveform'
import Waveform from '@/components/Waveform.vue'

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
    const mockData: WaveformType = {
      data: [
        { time: 0, max: 0, min: 1 }
      ],
      meta: {
        minVal: 0,
        maxVal: 1
      }
    }
    const wrapper = shallowMount(Waveform, {
      propsData: {
        waveform: mockData
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
})
