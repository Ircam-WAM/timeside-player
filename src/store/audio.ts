import { defineModule, defineGetters, defineMutations, defineActions } from 'direct-vuex'
import { moduleActionContext } from './index'

export enum PlayState {
  Stop,
  Play,
  Pause,
}

export enum Source {
  Input,
  Output
}

interface CurrentTime {
  value: number;
  source: Source;
}

export interface AudioState {
  playState: PlayState;
  // currentTime of the audio file in ms
  currentTime: CurrentTime;
  // duration of the audio file in ms
  duration: number;
}

const getDefaultState = (): AudioState => ({
  playState: PlayState.Stop,
  currentTime: { value: 0, source: Source.Output },
  duration: 0,
})

const state = getDefaultState

const getters = defineGetters<AudioState>()({
})

const mutations = defineMutations<AudioState>()({
  resetState (state) {
    Object.assign(state, getDefaultState())
  },

  setPlayState (state, playState: PlayState) {
    state.playState = playState
  },

  setDuration (state, duration: number) {
    state.duration = duration
  },

  setCurrentTimeOutput (state, value: number) {
    state.currentTime = { value, source: Source.Output }
  },

  setCurrentTimeInput (state, value: number) {
    state.currentTime = { value, source: Source.Input }
  }
})

const actions = defineActions({
})

const m = defineModule({
  state,
  getters,
  mutations,
  actions,
  namespaced: true
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const audioActionContext = (context: any) => moduleActionContext(context, m)
export default m
