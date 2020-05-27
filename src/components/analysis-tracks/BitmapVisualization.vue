<template>
  <div ref="container" class="bitmap-visualization">
    <p v-if="loading">
      Loading...
    </p>
    <p v-else-if="error" class="error">
      {{ error }}
    </p>
    <img
      :class="[ 'png-visualization', { loading }, { error } ]"
      :src="imageSrc"
      alt=""
      @error="imageError"
      @load="loading = false"
    >
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed
} from '@vue/composition-api'

import useBoundingClientRect from '@/utils/use-bounding-client-rect'
import { basePath } from '@/utils/api'
import { useStore } from '@/store/index'

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
    const error = ref<string | undefined>()
    const store = useStore()

    const start = computed(() => props.start || 0)
    const stop = computed(() => props.stop || store.state.audio.duration)

    const imageSrc = computed(() => {
      const query = new URLSearchParams()
      query.set('start', Math.round(start.value / 1000).toString())
      query.set('stop', Math.round(stop.value / 1000).toString())
      query.set('width', containerSize.value.width.toString())
      query.set('height', containerSize.value.height.toString())
      return `${basePath}/timeside/api/results/${props.resultUuid}/visual/?${query.toString()}`
    })

    const imageError = (event: ErrorEvent) => {
      if (!event.target) {
        throw new Error('event has no target')
      }
      const img = event.target as HTMLImageElement
      error.value = `Error loading image ${img.src}`
      loading.value = false
    }

    return {
      container,
      error,
      loading,
      imageSrc,
      imageError
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

  /* Hide it but keep it in the DOM so the image can load */
  &.loading,
  &.error {
    opacity: 0;
    position: absolute;
  }
}

</style>
