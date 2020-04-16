<template>
  <div
    ref="el"
    class="waveform"
  >
    <svg
      class="chart"
      :width="svgSize.width"
      :height="svgSize.height"
      :viewBox="`0 0 ${svgSize.width} ${svgSize.height}`"
    >
      <g class="chart-data">
        <!-- d attr will be filled by d3 -->
        <path
          class="area"
          d=""
        />
      </g>
      <g class="x-axis" />
      <slot />
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, Ref, onMounted, watchEffect } from '@vue/composition-api'
import * as d3 from 'd3'

import useBoundingClientRect from '@/utils/use-bounding-client-rect'
import { Waveform as WaveformType, WaveformSegment } from '@/types/waveform'
import { assertIsDefined } from '@/utils/type-assert'
import { formatSeconds } from '@/utils/format-seconds'

// FIXME: This type will be defined by vue@3
type ComputedRef<T> = Readonly<Ref<Readonly<T>>>

function draw (el: Element, waveform: WaveformType, width: number, height: number) {
  if (!el) {
    console.warn('attempting to draw waveform on an invalid element', el)
    return
  }
  if (width === 0 || height === 0) {
    console.warn(`attempting to draw waveform with invalid size (width = ${width}, height = ${height})`)
    return
  }

  const axisHeight = 25
  const barHeight = height - axisHeight
  const d3chart = d3.select(el).select('.chart-data').select<SVGSVGElement>('.area')
  const d3axis = d3.select(el).select<SVGSVGElement>('.x-axis')

  // Define scales
  const firstSegment = waveform.data[0]
  const lastSegment = waveform.data[waveform.data.length - 1]
  // Use scaleLinear because scaleTime() is for dates
  const xScale = d3.scaleLinear<number>()
    .domain([ firstSegment.time, lastSegment.time ])
    .range([ 0, width ])

  // Domain uses minVal and maxVal to scale the Waveform
  // because API sends values > 1
  // See https://github.com/Parisson/TimeSide/issues/177
  const yScale = d3.scaleLinear<number>()
    .domain([ waveform.meta.minVal, waveform.meta.maxVal ])
    .range([ barHeight, -barHeight ])

  // Define axis
  const xAxis = d3.axisBottom(xScale)
    .tickFormat(formatSeconds as (domainValue: number | { valueOf(): number }, index: number) => string)

  // Compute data
  const scale = (y: number) => barHeight - (yScale(y) / 2) - (barHeight / 2) + 2
  const d3area = d3.area<WaveformSegment>()
    .x((d) => xScale(d.time))
    .y0((d) => scale(d.min))
    .y1((d) => scale(d.max))

  // Render waveform
  // Cast required. See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/43267
  const castedArea = d3area as unknown as d3.ValueFn<SVGSVGElement, readonly WaveformSegment[], null>
  d3chart.datum(waveform.data).attr('d', castedArea)
  // Render axis
  d3axis.attr('transform', `translate(0, ${barHeight})`).call(xAxis)
}

export default defineComponent({
  name: 'Waveform',
  props: {
    waveform: {
      type: Object as PropType<WaveformType>,
      required: true
    }
  },
  setup ({ waveform }) {
    const el: Ref<HTMLDivElement | undefined> = ref()
    const svgSize: Ref<ClientRect> = useBoundingClientRect(el)

    onMounted(() => watchEffect(() => {
      assertIsDefined(el.value)
      draw(el.value, waveform, svgSize.value.width, svgSize.value.height)
    }))

    return {
      el,
      svgSize
    }
  }
})
</script>

<style lang="less" scoped>
.area {
  overflow: hidden;
}
</style>
