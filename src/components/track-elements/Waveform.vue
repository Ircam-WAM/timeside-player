<template>
  <FluidSVG
    class="waveform"
    @resized="svgSize = $event"
  >
    <g class="chart-data">
      <path
        class="area"
        :d="path"
      />
    </g>
  </FluidSVG>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  ref,
  Ref,
  computed
} from '@vue/composition-api'

// d3 imports by module to reduce bundle size
import { scaleLinear } from 'd3-scale'
import { area } from 'd3-shape'

import FluidSVG from '@/components/utils/FluidSVG.vue'

import { Waveform as WaveformType, WaveformSegment } from '@/types/waveform'

// FIXME: This type will be defined by vue@3
type ComputedRef<T> = Readonly<Ref<Readonly<T>>>

export default defineComponent({
  name: 'Waveform',
  props: {
    waveform: {
      type: Object as PropType<WaveformType>,
      required: true
    }
  },
  components: {
    FluidSVG
  },
  setup ({ waveform }) {
    const svgSize: Ref<ClientRect | undefined> = ref()

    const path = computed(() => {
      const height = svgSize.value ? svgSize.value.height : 0
      const width = svgSize.value ? svgSize.value.width : 0
      // Optimization: no need to compute
      if (height === 0) {
        return ''
      }

      // Use scaleLinear because scaleTime() is for dates
      const firstSegment = waveform.data[0]
      const lastSegment = waveform.data[waveform.data.length - 1]
      const xScale = scaleLinear<number>()
        .domain([ firstSegment.time, lastSegment.time ])
        .range([ 0, width ])

      // Domain uses minVal and maxVal to scale the Waveform
      // because API sends values > 1.
      // See https://github.com/Parisson/TimeSide/issues/177
      // You may want to switch to `.domain([ -1, 1 ])`
      const yScale = scaleLinear<number>()
        .domain([ waveform.meta.minVal, waveform.meta.maxVal ])
        .range([ height, -height ])

      const scale = (y: number) => height - (yScale(y) / 2) - (height / 2)
      const d3area = area<WaveformSegment>()
        .x((d) => xScale(d.time))
        .y0((d) => scale(d.min))
        .y1((d) => scale(d.max))

      return d3area(waveform.data)
    })

    return {
      svgSize,
      path
    }
  }
})
</script>

<style lang="less" scoped>
.waveform {
  min-height: 100px;
}
</style>
