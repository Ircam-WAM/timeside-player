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
} from '@vue/composition-api'

import { useStore } from '@/store/index'

export default defineComponent({
  name: 'Controls',
  setup () {
    const store = useStore()

    const playbackRate = computed({
      get: () => store.state.audio.playbackRate,
      set: val => { store.commit.audio.setPlayBackRate(val) }
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
