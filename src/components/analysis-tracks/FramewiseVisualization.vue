<template>
  <FluidSVG
    class="framewise-visualization"
    @resized="svgSize = $event"
  >
    <g class="chart-data">
      <path
        class="line"
        :d="path"
      />
    </g>
  </FluidSVG>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  PropType
} from 'vue'
import { HDF5 } from '@/utils/api'

import { scaleLinear } from 'd3-scale'
import { line, curveNatural } from 'd3-shape'

import FluidSVG from '@/components/utils/FluidSVG.vue'

export default defineComponent({
  components: {
    FluidSVG
  },
  props: {
    hdf5: {
      type: Object as PropType<HDF5>,
      required: true
    },
    start: {
      type: Number,
      required: false,
      default: undefined
    },
    stop: {
      type: Number,
      required: false,
      default: undefined
    }
  },
  setup (props) {
    const svgSize = ref<ClientRect | undefined>()

    const duration = computed(() => props.hdf5.audio_metadata.duration)
    const samplerate = computed(() => props.hdf5.data_object.frame_metadata.samplerate)
    const stepsize = computed(() => props.hdf5.data_object.frame_metadata.stepsize)

    const start = computed(() => props.start || 0)
    const stop = computed(() => props.stop || duration.value * 1000)

    type Point = [ number, number ]

    const points = computed<Point[]>(() => {
      // the signal is displayed recomposing the time interval
      // on the time axis with duration * stepsize / samplerate
      const getX = (idx: number) => idx * stepsize.value / samplerate.value * 1000 // convert to ms

      const p = props.hdf5.data_object.value.numpyArray.map<[number, number]>((y, idx) => {
        return [ getX(idx), y ]
      })
      // we need to add first and last point to draw the abscissa
      const firstPoint: Point = [ 0, 0 ]
      const lastPoint: Point = [ getX(p.length), 0 ]
      return [ firstPoint, ...p, lastPoint ]
    })

    // We look for the min/max inside the filtered points in order to
    // scale the line on Y absis
    // Uncomment the following line to unscale the zoom value
    // const maxVal = computed(() => Math.max(...props.hdf5.data_object.value.numpyArray))
    const border = computed(() => {
      const windowPoints = points.value.filter(p => p[0] > start.value && p[0] < stop.value)
      const yValues = windowPoints.map(p => p[1])

      return {
        min: Math.min(...yValues),
        max: Math.max(...yValues)
      }
    })

    const path = computed<string>(() => {
      const width = svgSize.value ? svgSize.value.width : 0
      const height = svgSize.value ? svgSize.value.height : 0

      const xScale = scaleLinear<number>()
        .domain([ start.value, stop.value ])
        .range([ 0, width ])

      const yScale = scaleLinear<number>()
        .domain([ border.value.min, border.value.max ])
        .range([ height, 0 ])

      const d3line = line<[number, number]>()
        .curve(curveNatural)
        .x((d) => xScale(d[0]))
        .y((d) => yScale(d[1]))

      // We need to cast it as no-readonly for D3
      const pointsD3 = points.value as unknown as [number, number][]

      return d3line(pointsD3) as string
    })

    return {
      svgSize,
      path
    }
  }
})
</script>

<style lang="less" scoped>
.framewise-visualization {
  width: 100%;
  min-height: 50px;
  height: 100%;
}
</style>
