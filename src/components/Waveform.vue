<template>
  <!--
    We have to use a div wrapper for ResizeObserver
    ResizeObserver is not working yet on SVG elements (as of 04/2020)
    See https://github.com/w3c/csswg-drafts/issues/4032#issuecomment-510137495
    For firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=1565557
  -->
  <div ref="el">
    <svg
      class="waveform-svg"
      :width="svgSize.width"
      :height="svgSize.height"
      :viewBox="`0 0 ${svgSize.width} ${svgSize.height}`"
    >
      <g class="chart-data">
        <path
          class="area"
          :d="path"
        />
      </g>
      <!-- Use of nested SVG to restrict children's height -->
      <svg
        ref="slotContainer"
        class="slots"
        width="100%"
        :height="barHeight"
        pointer-events="all"
      >
        <!-- Use of an empty rect to get events -->
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          stroke="black"
          stroke-width="0"
          fill="none"
        />
        <slot />
      </svg>
      <!-- Use of nested SVG for fixed height -->
      <svg
        class="x-axis-container"
        :height="axisHeight"
        :y="barHeight"
      >
        <!-- x-axis will be filled by d3 -->
        <g class="x-axis" />
      </svg>
    </svg>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  ref,
  Ref,
  onMounted,
  watchEffect,
  computed,
  InjectionKey,
  provide
} from '@vue/composition-api'

// d3 imports by module to reduce bundle size
import { scaleLinear, ScaleLinear } from 'd3-scale'
import { axisBottom } from 'd3-axis'
import { area } from 'd3-shape'
import { select } from 'd3-selection'

import useBoundingClientRect from '@/utils/use-bounding-client-rect'
import { Waveform as WaveformType, WaveformSegment } from '@/types/waveform'
import { assertIsDefined } from '@/utils/type-assert'
import { formatSeconds } from '@/utils/format-seconds'

// FIXME: This type will be defined by vue@3
type ComputedRef<T> = Readonly<Ref<Readonly<T>>>

export const slotContainerKey: InjectionKey<Ref<SVGSVGElement | undefined>> = Symbol('waveform-svg')

export default defineComponent({
  name: 'Waveform',
  props: {
    waveform: {
      type: Object as PropType<WaveformType>,
      required: true
    }
  },
  setup ({ waveform }) {
    const axisHeight = 25
    const el: Ref<HTMLDivElement | undefined> = ref()
    const svgSize: Ref<ClientRect> = useBoundingClientRect(el)

    // Provide slotContainer for children
    const slotContainer = ref<SVGSVGElement>()
    provide(slotContainerKey, slotContainer)

    const barHeight = computed(() => {
      // before onMounted
      if (!svgSize.value.height) {
        return 0
      }
      return svgSize.value.height - axisHeight
    })

    const xScale = computed(() => {
      const firstSegment = waveform.data[0]
      const lastSegment = waveform.data[waveform.data.length - 1]

      // Use scaleLinear because scaleTime() is for dates
      return scaleLinear<number>()
        .domain([ firstSegment.time, lastSegment.time ])
        .range([ 0, svgSize.value.width ])
    }) as Readonly<Ref<ScaleLinear<number, number>>>

    const yScale = computed(() => {
      // Domain uses minVal and maxVal to scale the Waveform
      // because API sends values > 1.
      // See https://github.com/Parisson/TimeSide/issues/177
      // You may want to switch to `.domain([ -1, 1 ])`

      return scaleLinear<number>()
        .domain([ waveform.meta.minVal, waveform.meta.maxVal ])
        .range([ barHeight.value, -barHeight.value ])
    }) as Readonly<Ref<ScaleLinear<number, number>>>

    const path = computed(() => {
      // Optimization: no need to compute
      if (barHeight.value === 0) {
        return ''
      }
      const myYScale = yScale.value
      const scale = (y: number) => barHeight.value - (myYScale(y) / 2) - (barHeight.value / 2)
      const d3area = area<WaveformSegment>()
        .x((d) => xScale.value(d.time))
        .y0((d) => scale(d.min))
        .y1((d) => scale(d.max))

      return d3area(waveform.data)
    })

    // Axis
    onMounted(() => watchEffect(() => {
      assertIsDefined(el.value)
      // Select element
      const d3axis = select(el.value).select<SVGSVGElement>('.x-axis')

      // Define axis
      const xAxis = axisBottom(xScale.value)
        .tickFormat(formatSeconds as (domainValue: number | { valueOf(): number }, index: number) => string)

      // Render axis
      d3axis.call(xAxis)
    }))

    return {
      el,
      axisHeight,
      barHeight,
      svgSize,
      path,
      slotContainer
    }
  }
})
</script>

<style lang="less" scoped>
.waveform-svg {
  /*
    Avoid infinite re-render loop when no size is set
    SVG is set as inline element by default
    See https://stackoverflow.com/a/27834092
  */
  display: block;
  min-height: 100px;
}

.area {
  overflow: hidden;
}

// Fix offset. Default value is 1px
// Without this, rect element with `height: 100%`
// would have a height of `100% + 1px`
svg::v-deep * {
  stroke-width: 0;
}
</style>
