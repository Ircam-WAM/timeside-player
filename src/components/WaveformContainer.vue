<template>
  <div class="waveform">
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
    />
    <div
      v-else
      class="error"
    >
      Waveform not loading: undefined behavior
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, Ref } from '@vue/composition-api'

import { useStore } from '@/store/index'
import { Waveform as WaveformType } from '@/store/waveform'

import Waveform from '@/components/Waveform.vue'

// FIXME: This type will be defined by vue@3
type ComputedRef<T> = Readonly<Ref<Readonly<T>>>

export default defineComponent({
  name: 'WaveformContainer',
  props: {
    itemId: {
      type: String,
      required: true
    }
  },
  components: {
    Waveform
  },
  setup ({ itemId }) {
    const store = useStore()
    store.dispatch.waveform.retrieveWaveform(itemId)

    const isLoading: ComputedRef<boolean> = computed(() => store.getters.waveform.isLoading)
    const error: ComputedRef<Response | undefined> = computed(() => store.state.waveform.error)
    const waveform: ComputedRef<WaveformType | undefined> = computed(() => store.getters.waveform.waveformSegments)
    const isValid: ComputedRef<boolean> = computed(() => store.getters.waveform.isValid)

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
.waveform {
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

  & .error {
    color: red;
  }
}
</style>
