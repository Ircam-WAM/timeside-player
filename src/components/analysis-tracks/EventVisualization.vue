<template>
  <div class="event-container">
    <div
      v-for="{ val, idx } of points"
      :key="val"
      :style="{ left: `${val}%`, height: `${values[idx] * 100}%` }"
      class="event"
    />
  </div>
</template>

<script lang='ts'>
import {
  defineComponent,
  PropType,
  computed
} from 'vue'

import { HDF5 } from './HDF5Event'

export default defineComponent({
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
    const duration = computed(() => props.hdf5.audio_metadata.duration)

    const start = computed(() => props.start || 0)
    const stop = computed(() => props.stop || duration.value * 1000)

    const points = computed(() => props.hdf5.data_object.time.numpyArray
      .map((x, idx) => {
        const t = x * 1000
        if (t > start.value && t < stop.value) {
          return {
            val: (t - start.value) / (stop.value - start.value) * 100,
            idx
          }
        }
        return undefined
      })
      .filter((x) => x !== undefined) as { val: number, idx: number }[]
    )

    const maxVal = Math.max(...props.hdf5.data_object.label.numpyArray)
    const values = computed(() => props.hdf5.data_object.label.numpyArray.map((x) => {
      return x / maxVal
    }))

    return {
      points,
      values
    }
  }
})
</script>

<style lang="less" scoped>
.event-container {
  position: relative;
  height: 100%;
}
.event {
  background-color: black;
  width: 2px;
  position: absolute;
}

</style>
