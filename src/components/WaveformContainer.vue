<template>
  <div class="waveform-container">
    <div
      v-if="isLoading"
      class="loading"
    >
      Loading waveform...
    </div>
    <div
      v-else-if="error"
      class="error"
    >
      Waveform not available. Please check your browser's network logs.
    </div>
    <div
      v-else-if="!waveform"
      class="error"
    >
      Waveform not found
    </div>
    <div
      v-else-if="!isValid"
      class="error"
    >
      The waveform do not seems valid. Please check your browser's console logs.
    </div>
    <Waveform
      v-else-if="waveform"
      :waveform="waveform"
      class="waveform"
      @mousedown.native="$emit('mousedown', $event)"
    >
      <slot />
    </Waveform>
    <div
      v-else
      class="error"
    >
      Waveform not loading: undefined behavior
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, computed, watch } from '@vue/composition-api'

import useWaveform from '@/utils/use-waveform'
import Waveform from '@/components/Waveform.vue'

// FIXME: This type will be defined by vue@3
type ComputedRef<T> = Readonly<Ref<Readonly<T>>>

export default defineComponent({
  name: 'WaveformContainer',
  props: {
    itemId: {
      type: String,
      required: true
    },
    // start of the waveform's region in ms
    start: {
      type: Number,
      required: false
    },
    // stop of the waveform's region in ms
    stop: {
      type: Number,
      required: false
    },
    nbPixels: {
      type: Number,
      required: false
    }
  },
  components: {
    Waveform
  },
  setup (props) {
    // Reactive params
    const { isLoading, error, isValid, waveform } = useWaveform(computed(() => ({
      uuid: props.itemId,
      start: props.start ? props.start / 1000 : undefined,
      stop: props.stop ? props.stop / 1000 : undefined,
      nbPixels: props.nbPixels
    })))

    watch([ error ], () => {
      if (error.value === undefined) {
        return
      }
      console.error(error.value)
    })

    return {
      isLoading,
      error,
      waveform,
      isValid
    }
  }
})
</script>

<style lang="less" scoped>
.waveform-container {
  width: 100%;
  height: 300px;

  & .error,
  & .loading {
    height: 100%;
    /* Center horizontal / vertical */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  & .waveform {
    height: 100%;
  }

  & .error {
    color: red;
  }
}
</style>
