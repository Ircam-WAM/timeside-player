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
      @mousedown="$emit('mousedown', $event)"
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
import { defineComponent, computed, watch } from 'vue'

import useWaveform from '@/utils/use-waveform'
import Waveform from '@/components/track-elements/Waveform.vue'

export default defineComponent({
  name: 'WaveformContainer',
  components: {
    Waveform
  },
  props: {
    itemId: {
      type: String,
      required: true
    },
    // start of the waveform's region in ms
    start: {
      type: Number,
      required: false,
      default: undefined
    },
    // stop of the waveform's region in ms
    stop: {
      type: Number,
      required: false,
      default: undefined
    },
    nbPixels: {
      type: Number,
      required: false,
      default: undefined
    }
  },
  emits: [
    'mousedown'
  ],
  setup (props) {
    // Reactive params
    const { isLoading, error, isValid, waveform } = useWaveform(computed(() => ({
      uuid: props.itemId,
      start: props.start ? props.start / 1000 : undefined,
      stop: props.stop ? props.stop / 1000 : undefined,
      nbPixels: props.nbPixels
    })))

    watch([ isLoading ], () => {
      if (!isLoading.value) {
        document.querySelector('#app-loading')?.classList.add('hide')
        document.querySelector('#app')?.classList.remove('hide')
        document.querySelector('#app')?.classList.add('fade-in')

        const audioElement = document.querySelector('.audio')?.getElementsByTagName('audio')[0]!

        if (audioElement) {
          if (!isNaN(audioElement.duration)) {
            const totalTimeElement = document.querySelector('#player-total-time')!
            totalTimeElement.innerHTML = '/ ' + formatTime(audioElement.duration)
          }
        }
      }
    }, { immediate: false })

    function formatTime (seconds: any) {
      let minutes: any = Math.floor(seconds / 60)!
      minutes = (minutes >= 10) ? minutes : '0' + minutes
      seconds = Math.floor(seconds % 60)
      seconds = (seconds >= 10) ? seconds : '0' + seconds
      return minutes + ':' + seconds
    }

    watch([ error ], () => {
      if (error.value === undefined) {
        return
      }
      console.error('Unable to get waveform: ', error.value)
    }, { immediate: true })

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
