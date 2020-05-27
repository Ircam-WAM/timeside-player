<template>
  <div ref="container" class="bitmap-visualization">
    <p v-if="loading">
      Loading...
    </p>
    <p v-else-if="error" class="error">
      Error while retrieving Visual: {{ formatResponseError(error) }}
    </p>
    <img
      v-else
      class="png-visualization"
      :src="imageSrc"
      alt=""
    >
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  watch,
  toRefs
} from '@vue/composition-api'

import useBoundingClientRect from '@/utils/use-bounding-client-rect'
import { newAbortableApi } from '@/utils/api'
import { useStore } from '@/store/index'
import { formatResponseError } from '@/utils/response-error'

export default defineComponent({
  props: {
    resultUuid: {
      type: String,
      required: true
    },
    start: {
      type: Number,
      required: false
    },
    stop: {
      type: Number,
      required: false
    }
  },
  setup (props) {
    const container = ref()
    const containerSize = useBoundingClientRect(container)
    const loading = ref(true)
    const error = ref<Response | undefined>()
    const store = useStore()
    const imageSrc = ref('')

    const start = computed(() => props.start || 0)
    const stop = computed(() => props.stop || store.state.audio.duration)

    let abortController: AbortController | undefined

    const setImageSrc = async () => {
      // We hide loading if an image is already set
      // loading.value = false

      // If a request is already ongoing, we abort it
      if (abortController) {
        abortController.abort()
      }

      try {
        abortController = new AbortController()
        const abortApi = newAbortableApi(abortController)

        const resp = await abortApi.retrieveResultVisualizationRaw({
          uuid: props.resultUuid,
          // FIXME: API expectes int instead of float
          start: Math.round(start.value / 1000),
          stop: Math.round(stop.value / 1000),
          // Default values for width/height to avoid API errors
          width: containerSize.value.width || 500,
          height: containerSize.value.height || 300
        })
        const blob = await resp.raw.blob()
        imageSrc.value = URL.createObjectURL(blob)
        loading.value = false
      } catch (e) {
        if (e.name === 'AbortError') {
          return
        }
        console.error('retrieveResultVisualization failed', e)
        error.value = e
      }
    }

    // Small trick to watch all props + containerSize
    const deps = computed(() => ([
      ...Object.values(toRefs(props)),
      containerSize.value
    ]))
    onMounted(() => { watch(deps, () => { setImageSrc() }) })

    return {
      container,
      error,
      loading,
      imageSrc,
      formatResponseError
    }
  }
})
</script>

<style lang="less" scoped>
.bitmap-visualization {
  width: 100%;
  height: 300px;

  display: flex;
  justify-content: center;
  align-items: center;
}

.error {
  color: red;
}

.png-visualization {
  width: 100%;
  height: 100%;
}

</style>
