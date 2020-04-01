<template>
  <div class="audio">
    <audio
      v-if="audioSrcs"
      ref="el"
      autoplay
      controls
      @timeupdate="onTimeUpdate"
      @pause="onPause"
      @playing="onPlaying"
      @ended="onEnded"
      @canplay.once="onCanPlay"
      @error="audioError = $event"
    >
      <source
        v-for="src of audioSrcs"
        :key="src.src"
        :src="src.src"
        :type="src.type"
      >
      <p class="error">
        Your browser does not support the
        <code>audio</code> element.
      </p>
    </audio>
    <p
      v-else
      class="error"
    >
      Your selection have no valid audio file
    </p>
    <p
      v-if="audioError"
      class="error"
    >
      Unable to load media file: {{ audioError }}
    </p>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  Ref,
  ref,
  onMounted,
  onUnmounted,
  PropType,
  computed,
  watch
} from '@vue/composition-api'
import { useStore } from '@/store/index'
import { PlayState } from '@/store/audio'
import { AudioSrc } from '@/store/items'
import { assertIsDefined } from '@/utils/type-assert'

// FIXME: This type will be defined by vue@3
type ComputedRef<T> = Readonly<Ref<Readonly<T>>>

export default defineComponent({
  props: {
    audioSrcs: {
      type: Array as PropType<AudioSrc[]>,
      required: true
    }
  },
  setup () {
    const store = useStore()
    const el: Ref<HTMLAudioElement | undefined> = ref()
    const audioError: ComputedRef<Error | undefined> = ref()

    /*
    * Audio/Media element events
    */
    const onTimeUpdate = (ev: Event) => {
      assertIsDefined(ev.target)
      store.commit.audio.setCurrentTimeOutput((ev.target as HTMLAudioElement).currentTime * 1000)
    }
    const onPause = () => {
      assertIsDefined(el.value)

      // Avoids an infinite loop between play/pause state (reproducible on Firefox 73)
      if (el.value.seeking) {
        return
      }

      store.commit.audio.setCurrentTimeOutput(el.value.currentTime * 1000)
      store.commit.audio.setPlayState(PlayState.Pause)
    }
    const onPlaying = () => {
      assertIsDefined(el.value)
      store.commit.audio.setCurrentTimeOutput(el.value.currentTime * 1000)
      store.commit.audio.setPlayState(PlayState.Play)
    }
    const onEnded = () => {
      assertIsDefined(el.value)
      store.commit.audio.setCurrentTimeOutput(el.value.currentTime * 1000)
      store.commit.audio.setPlayState(PlayState.Stop)
    }
    const onCanPlay = () => {
      assertIsDefined(el.value)
      store.commit.audio.setDuration(el.value.duration * 1000)
    }

    /*
    * Set currenTime of audioFile when store's currentTime is updated
    */
    const currentTimeInput = computed(() => store.state.audio.currentTimeInput)
    onMounted(() => watch([ currentTimeInput ], () => {
      const audio = el.value
      if (!audio) {
        return
      }
      audio.currentTime = currentTimeInput.value / 1000
      store.commit.audio.setCurrentTimeOutput(audio.currentTime * 1000)
    }, {
      lazy: false, // the callback is called when the watched source has the same value as previous state
      flush: 'sync'
    }))

    /*
    * Set playState to stop when there is an audio error
    */
    onMounted(() => watch([ audioError ], () => {
      if (audioError.value !== undefined) {
        store.commit.audio.setPlayState(PlayState.Stop)
      }
    }))

    /*
    * Update playState according to store's value
    */
    const playStateInput = computed(() => store.state.audio.playState)
    onMounted(() => watch([ playStateInput ], () => {
      const audio = el.value
      if (!audio) {
        // Store edit playState but audio is not mounted
        return
      }
      switch (playStateInput.value) {
        case PlayState.Play:
          audio.play()
          break
        case PlayState.Pause:
          audio.pause()
          break
        case PlayState.Stop:
          audio.pause()
          audio.currentTime = 0
          break
        default:
          console.error('Unknown PlayState', playStateInput.value)
      }
    }, {
      // do not wait for component's update to run the watcher
      flush: 'sync',
      lazy: false
    }))

    // Force the browser to unload the audio element
    // Without this, switching item without restarting the page
    onUnmounted(() => {
      const audio = el.value
      if (!audio) {
        return
      }
      audio.pause()
      audio.currentTime = 0
      audio.removeAttribute('src')
      while (audio.firstChild) {
        audio.removeChild(audio.firstChild)
      }
      audio.load()
    })

    return {
      el,
      onTimeUpdate,
      onPause,
      onPlaying,
      onCanPlay,
      onEnded,
      audioError
    }
  }
})
</script>

<style lang="less" scoped>
.error {
  color: red;
}
</style>