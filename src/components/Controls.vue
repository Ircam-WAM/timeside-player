<template>
  <div class="controls">
    <div class="form-container">
      <label for="playback-rate">
        Playback rate:
      </label>
      <input
        v-model="playbackRate"
        type="number"
        min="0.5"
        max="4.0"
        step="0.1"
        placeholder="playback rate"
      >
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed
} from 'vue'

import { useAudioStore } from '@/store/audio'

export default defineComponent({
  name: 'Controls',
  setup () {
    const audioStore = useAudioStore()

    const playbackRate = computed({
      get: () => audioStore.state.playbackRate,
      set: val => { audioStore.mutations.setPlayBackRate(val) }
    })
    return {
      playbackRate
    }
  }
})
</script>

<style scoped>
.form-container {
  padding-top: 10px;
  padding-bottom: 10px;
}

.playback-rate {
}
</style>
