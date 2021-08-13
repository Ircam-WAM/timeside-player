import { reactive, computed, inject, InjectionKey } from 'vue'

export enum PlayState {
  Stop,
  Play,
  Pause,
}

export enum CurrentTimeSource {
  TimeUpdate,
  Seek,
  Cursor,
}

interface CurrentTime {
  value: number
  source: CurrentTimeSource
}

export interface AudioState {
  playState: PlayState
  // currentTime of the audio file in ms
  currentTime: CurrentTime
  // duration of the audio file in ms
  duration: number
  playbackRate: number
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createAudioStore () {
  const state = reactive<AudioState>({
    playState: PlayState.Stop,
    currentTime: { value: 0, source: CurrentTimeSource.TimeUpdate },
    duration: 0,
    playbackRate: 1.0
  })

  const mutations = {
    setPlayState (playState: PlayState) {
      state.playState = playState
    },

    setDuration (duration: number) {
      state.duration = duration
    },

    setCurrentTime (value: CurrentTime) {
      state.currentTime = value
    },

    setPlayBackRate (value: number) {
      state.playbackRate = value
    }
  }

  const getters = {
    isReady: computed(() => state.duration !== 0)
  }

  return {
    state,
    getters,
    mutations
  }
}

type AudioStore = ReturnType<typeof createAudioStore>

export const audioStoreKey: InjectionKey<AudioStore> = Symbol('audio-store')

export function useAudioStore (): AudioStore {
  const resolved = inject(audioStoreKey)
  if (resolved === undefined) {
    throw new Error('store not found')
  }
  return resolved
}
