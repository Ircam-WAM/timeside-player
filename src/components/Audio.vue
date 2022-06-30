<template>
  <div class="audio">
    <audio
      ref="el"
      autoplay
      controls
      @timeupdate="onTimeUpdate"
      @pause="onPause"
      @playing="onPlaying"
      @ended="onEnded"
      @error="onError"
      @durationchange="onDurationChange"
      @seeked="onSeeked"
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
} from 'vue'
import { useAudioStore, PlayState, CurrentTimeSource } from '@/store/audio'
import { AudioSrc } from '@/utils/audio-srcs'
import { assertIsDefined } from '@/utils/type-assert'

export default defineComponent({
  props: {
    audioSrcs: {
      type: Array as PropType<AudioSrc[]>,
      required: true
    }
  },
  setup () {
    const store = useAudioStore()
    const el: Ref<HTMLAudioElement | undefined> = ref()
    const audioError = ref<Error | undefined>()

    const getEventEl = (ev: Event): HTMLAudioElement => {
      assertIsDefined(ev.target)
      return ev.target as HTMLAudioElement
    }

    /*
    * Audio/Media element events
    */
    const onTimeUpdate = (ev: Event) => {
      const target = getEventEl(ev)
      store.mutations.setCurrentTime({
        value: target.currentTime * 1000,
        source: CurrentTimeSource.TimeUpdate
      })
    }
    const onPause = (ev: Event) => {
      const target = getEventEl(ev)

      // Avoids an infinite loop between play/pause state (reproducible on Firefox 73)
      if (target.seeking) {
        return
      }

      store.mutations.setCurrentTime({
        value: target.currentTime * 1000,
        source: CurrentTimeSource.TimeUpdate
      })
      store.mutations.setPlayState(PlayState.Pause)
    }
    const onPlaying = (ev: Event) => {
      const target = getEventEl(ev)
      store.mutations.setCurrentTime({
        value: target.currentTime * 1000,
        source: CurrentTimeSource.TimeUpdate
      })
      store.mutations.setPlayState(PlayState.Play)
    }
    const onEnded = (ev: Event) => {
      const target = getEventEl(ev)
      store.mutations.setCurrentTime({
        value: target.currentTime * 1000,
        source: CurrentTimeSource.TimeUpdate
      })
      store.mutations.setPlayState(PlayState.Stop)
    }
    const onDurationChange = (ev: Event) => {
      const target = getEventEl(ev)
      store.mutations.setDuration(target.duration * 1000)
    }
    const onSeeked = (ev: Event) => {
      const target = getEventEl(ev)
      store.mutations.setCurrentTime({
        value: target.currentTime * 1000,
        source: CurrentTimeSource.Seek
      })
    }
    const onError = (ev: Event) => {
      audioError.value = new Error(`code = ${(ev.currentTarget as HTMLAudioElement).error?.code}`)
    }

    /*
    * Set currentTime of audioFile when store's currentTime is updated
    */
    const currentTime = computed(() => store.state.currentTime)
    onMounted(() => watch([ currentTime ], () => {
      // Do not update audio's currentTime if update comes from audio
      if (currentTime.value.source !== CurrentTimeSource.Cursor) {
        return
      }
      const audio = el.value
      if (!audio) {
        return
      }
      audio.currentTime = currentTime.value.value / 1000
    }, {
      flush: 'sync',
      immediate: true
    }))

    /*
    * Set playState to stop when there is an audio error
    */
    onMounted(() => watch([ audioError ], () => {
      if (audioError.value !== undefined) {
        store.mutations.setPlayState(PlayState.Stop)
      }
    }, { immediate: true }))

    /*
    * Update playState according to store's value
    */
    const playStateInput = computed(() => store.state.playState)
    onMounted(() => watch([ playStateInput ], () => {
      const audio = el.value
      if (!audio) {
        // Store edit playState but audio is not mounted
        return
      }

      // Set currentTimeOutput to to avoid cursor jump
      store.mutations.setCurrentTime({
        value: audio.currentTime * 1000,
        source: CurrentTimeSource.TimeUpdate
      })

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
      immediate: true
    }))

    const playbackRate = computed(() => store.state.playbackRate)
    watch([ playbackRate ], () => {
      // Silently returns for before ready
      if (!el.value) {
        return
      }
      el.value.playbackRate = playbackRate.value
    }, { immediate: true })

    // Force the browser to unload the audio element
    // Without this, switching item without restarting the page
    // plays all previously loaded audio elemenets
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
      onEnded,
      onError,
      audioError,
      onDurationChange,
      onSeeked
    }
  }
})
</script>

<style lang="less" scoped>
.audio {
  display: none;
}

.error {
  color: red;
}
</style>
