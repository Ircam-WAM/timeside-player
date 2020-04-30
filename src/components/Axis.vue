<template>
  <FluidSVG
    class="x-axis-container"
    @resized="svgSize = $event"
  >
    <!-- x-axis will be filled by d3 -->
    <g ref="group" />
  </FluidSVG>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  onMounted,
  watchEffect,
  Ref,
  ref
} from '@vue/composition-api'

import { scaleLinear, ScaleLinear } from 'd3-scale'
import { select } from 'd3-selection'
import { axisBottom } from 'd3-axis'

import FluidSVG from '@/components/FluidSVG.vue'

import { assertIsDefined } from '@/utils/type-assert'
import { formatSeconds } from '@/utils/format-seconds'

// See https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/d3-axis/index.d.ts
type d3TickFormat = (domainValue: number | { valueOf(): number }, index: number) => string

export default defineComponent({
  props: {
    // first time of the axis in ms
    firstTime: {
      type: Number,
      required: true
    },
    // last time of the axis in ms
    lastTime: {
      type: Number,
      required: true
    }
  },
  components: {
    FluidSVG
  },
  setup (props) {
    const svgSize: Ref<ClientRect | undefined> = ref()
    const group = ref<SVGSVGElement>()

    const xScale = computed(() => {
      const width = svgSize.value ? svgSize.value.width : 0
      // divide to convert ms to seconds
      const firstTime = props.firstTime / 1000
      const lastTime = props.lastTime / 1000

      // Use scaleLinear because scaleTime() is for dates
      return scaleLinear<number>()
        .domain([ firstTime, lastTime ])
        .range([ 0, width ])
    }) as Readonly<Ref<ScaleLinear<number, number>>>

    // Axis
    onMounted(() => watchEffect(() => {
      assertIsDefined(group.value)
      // Select element
      const d3axis = select(group.value)

      // Define axis
      const xAxis = axisBottom(xScale.value)
        .tickFormat(formatSeconds as d3TickFormat)

      // Render axis
      d3axis.call(xAxis)
    }))

    return {
      group,
      svgSize
    }
  }
})
</script>

<style lang="less" scoped>
.x-axis-container {
  min-height: 30px;
}
</style>
