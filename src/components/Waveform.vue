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
      @click="onClick"
    >
      <g class="chart-data">
        <!-- d attr will be filled by d3 -->
        <path
          class="area"
          d=""
        />
      </g>
      <g class="x-axis" />
      <PlayCursor />
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, Ref, onMounted, watchEffect } from '@vue/composition-api'
import * as d3 from 'd3'

import useBoundingClientRect from '@/utils/use-bounding-client-rect'
import { useStore } from '@/store/index'
import { WaveformSegment } from '@/store/waveform'
import { assertIsDefined } from '@/utils/type-assert'
import { formatSeconds } from '@/utils/format-seconds'

import PlayCursor from '@/components/PlayCursor.vue'

// FIXME: This type will be defined by vue@3
type ComputedRef<T> = Readonly<Ref<Readonly<T>>>

interface Rect {
  x: number;
  y: number;
  height: number;
}

function draw (el: Element, data: readonly WaveformSegment[], width: number, height: number) {
  if (!el || width === 0 || height === 0) {
    console.warn('attempting to draw waveform on an invalid element', el)
    return
  }

  const axisHeight = 25
  const barHeight = height - axisHeight
  const d3chart = d3.select(el).select('.chart-data').select<SVGSVGElement>('.area')
  const d3axis = d3.select(el).select<SVGSVGElement>('.x-axis')

  // Define scales
  const firstSegment = data[0]
  const lastSegment = data[data.length - 1]
  // Use scaleLinear because scaleTime() is for dates
  const xScale = d3.scaleLinear<number>()
    .domain([ firstSegment.time, lastSegment.time ])
    .range([ 0, width ])

  const yScale = d3.scaleLinear<number>()
    .domain([ -1, 1 ])
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
  d3chart.datum(data).attr('d', d3area as unknown as d3.ValueFn<SVGSVGElement, readonly WaveformSegment[], null>)
  // Render axis
  d3axis.attr('transform', `translate(0, ${barHeight})`).call(xAxis)
}

export default defineComponent({
  name: 'Waveform',
  components: {
    PlayCursor
  },
  props: {
    waveform: {
      type: Array as PropType<WaveformSegment[]>,
      required: true
    }
  },
  setup ({ waveform }) {
    const store = useStore()

    const el: Ref<Element | undefined> = ref()
    const svgSize: Ref<ClientRect> = useBoundingClientRect(el)

    onMounted(() => watchEffect(() => {
      assertIsDefined(el.value)
      draw(el.value, waveform, svgSize.value.width, svgSize.value.height)
    }))

    const onClick = ({ clientX, target }: MouseEvent) => {
      if (!target) {
        throw new Error(`target not found: ${target}`)
      }
      const { left } = (target as HTMLDivElement).getBoundingClientRect()
      const xPos = clientX - left
      const duration = store.state.audio.duration
      const currentTime = xPos / svgSize.value.width * duration
      store.commit.audio.setCurrentTimeInput(currentTime)
    }

    return {
      el,
      svgSize,
      onClick
    }
  }
})
</script>

<style lang="less" scoped>
</style>
