<template>
  <div>
    <div
      v-if="isLoading"
      class="loading"
    >
      Loading...
    </div>
    <template v-else>
      <div v-if="isUnauthorized">
        You do not seems to be logged in. You can log in on
        <a
          :href="loginUrl"
          target="_blank"
          rel="noopener"
        >Wasabi</a>
        and reload this page
      </div>
      <div
        v-else-if="error"
        class="error"
      >
        {{ error }}
      </div>
      <div v-else-if="!itemDetail">
        Item not found
      </div>
      <div
        v-else
        class="player"
      >
        <div class="item-metadata">
          <b>title</b>: {{ itemDetail.title }}<br>
          <b>description</b>: {{ itemDetail.description }}<br>
          <b>uuid</b>: {{ itemDetail.uuid }}
        </div>
        <Timer />
        <WaveformContainer :item-id="itemId" />
        <Audio :audio-srcs="audioSrcs" />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, Ref, onMounted, onUnmounted } from '@vue/composition-api'

import { useStore } from '@/store/index'
import { PlayState } from '@/store/audio'
import { AudioSrc } from '@/store/items'
import { Item, loginUrl } from '@/utils/api'
import { formatResponseError } from '@/utils/response-error'

import WaveformContainer from '@/components/WaveformContainer.vue'
import Timer from '@/components/Timer.vue'
import Audio from '@/components/Audio.vue'

// FIXME: This type will be defined by vue@3
type ComputedRef<T> = Readonly<Ref<Readonly<T>>>

export default defineComponent({
  name: 'Player',
  props: {
    itemId: {
      type: String,
      required: true
    }
  },
  components: {
    WaveformContainer,
    Audio,
    Timer
  },
  setup ({ itemId }) {
    const store = useStore()
    if (!itemId) {
      throw new Error('item has no valid ID')
    }

    // We need to retrieve the item as Item do not provide enough data
    store.dispatch.items.retrieveItem(itemId)
    const error: ComputedRef<string | undefined> = computed(() => {
      const err = store.getters.items.getErrorById(itemId)
      if (!err) {
        return undefined
      }
      return formatResponseError(err)
    })
    const isLoading: ComputedRef<boolean> = computed(() => {
      return store.getters.items.isLoading(itemId)
    })
    const isUnauthorized: ComputedRef<boolean> = computed(() => {
      return store.getters.items.isUnauthorized(itemId)
    })
    const itemDetail: ComputedRef<Item | undefined> = computed(() => {
      return store.getters.items.getItemById(itemId)
    })
    const audioSrcs: ComputedRef<AudioSrc[] | undefined> = computed(() => {
      return store.getters.items.getAudioSrcs(itemId)
    })

    const onKeypress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        switch (store.state.audio.playState) {
          case PlayState.Play:
            store.commit.audio.setPlayState(PlayState.Pause)
            break
          case PlayState.Stop:
          case PlayState.Pause:
            store.commit.audio.setPlayState(PlayState.Play)
            break
          default:
            console.error('Unknown PlayState', store.state.audio.playState)
        }
      }
    }

    onUnmounted(() => store.commit.audio.resetState())

    onMounted(() => { window.addEventListener('keypress', onKeypress) })
    onUnmounted(() => { window.removeEventListener('keypress', onKeypress) })

    return {
      error,
      isLoading,
      isUnauthorized,
      itemDetail,
      audioSrcs,
      loginUrl
    }
  }
})
</script>

<style lang="less" scoped>
.item-metadata {
  margin: 20px;
}

.error {
  color: red;
}
</style>
