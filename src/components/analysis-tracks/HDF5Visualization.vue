<template>
  <div v-if="loading">
    Loading...
  </div>
  <div v-else-if="error" class="error">
    Unable to retrieve HDF5 : {{ formatResponseError(error) }}
  </div>
  <div v-else class="hdf5-visualization">
    <p v-if="hdf5 === undefined">
      unexpected error: hdf5 is undefined
    </p>
    <template v-else-if="hdf5.time_mode === 'framewise'">
      <FramewiseVisualization
        :hdf5="hdf5"
        :start="start"
        :stop="stop"
      />
    </template>
    <template v-else-if="hdf5.time_mode === 'event'">
      <EventVisualization
        v-if="hdf5Event !== undefined"
        :hdf5="hdf5Event"
        :start="start"
        :stop="stop"
      />
    </template>
    <template v-else-if="hdf5.time_mode === 'segment'">
      <SegmentVisualization
        v-if="hdf5Segment !== undefined"
        :hdf5="hdf5Segment"
        :start="start"
        :stop="stop"
      />
    </template>
    <template v-else-if="hdf5.time_mode === 'global'">
      <div>
        {{ hdf5.id_metadata.name }} = {{ hdf5.data_object.value.numpyArray[0] }} {{ hdf5.id_metadata.unit }}
      </div>
    </template>
    <template v-else-if="hdf5.time_mode === 'timewise'">
      <div>time_mode === 'timewise' is not implemented</div>
    </template>
    <div v-else>
      Unknown time_mode : {{ hdf5.time_mode }}
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  watch,
  ref,
  Ref
} from 'vue'

import { HDF5, useApi } from '@/utils/api'
import { HDF5 as HDF5Event } from './HDF5Event'
import { HDF5 as HDF5Segment } from './HDF5Segment'
import FramewiseVisualization from '@/components/analysis-tracks/FramewiseVisualization.vue'
import EventVisualization from './EventVisualization.vue'
import SegmentVisualization from './SegmentVisualization.vue'

import { formatResponseError } from '@/utils/response-error'

export default defineComponent({
  components: {
    FramewiseVisualization,
    EventVisualization,
    SegmentVisualization
  },
  props: {
    resultUuid: {
      type: String,
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
    const { currentBaseUrl } = useApi()
    const loading = ref(true)
    const error = ref<string | undefined>()
    const hdf5 = ref<HDF5>()

    onMounted(() => watch(() => props.resultUuid, () => {
      (async () => {
        loading.value = true
        try {
          // FIXME: API should implement it in schema in the future
          // See: https://github.com/Parisson/TimeSide/issues/174#issuecomment-630867653
          const resultUrl = `${currentBaseUrl}/timeside/results/${props.resultUuid}/json/`
          const resp = await fetch(resultUrl)
          if (!resp.ok) {
            throw resp
          }
          const json: HDF5[] = await resp.json()
          if (json.length === 0) {
            throw new Error('result sent an empty array')
          }
          hdf5.value = json[0]
        } catch (e) {
          error.value = e
        }
        loading.value = false
      })()
    }, { immediate: true }))

    return {
      formatResponseError,
      loading,
      error,
      hdf5,
      hdf5Event: hdf5 as Ref<HDF5Event | undefined>,
      hdf5Segment: hdf5 as Ref<HDF5Segment | undefined>
    }
  }
})
</script>

<style lang="less" scoped>
.hdf5-visualization {
  width: 100%;
  height: 100%;
}

.error {
  color: red;
}
</style>
