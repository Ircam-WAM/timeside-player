import { defineModule, defineGetters, defineMutations, defineActions } from 'direct-vuex'
import { moduleActionContext } from './index'

export enum PlayState {
  Stop,
  Play,
  Pause,
}

export interface AudioState {
  playState: PlayState;
  // currentTime of the audio file in ms
  currentTimeOutput: number;
  currentTimeInput: number;
  // duration of the audio file in ms
  duration: number;
}

const getDefaultState = (): AudioState => ({
  playState: PlayState.Stop,
  currentTimeOutput: 0,
  currentTimeInput: 0,
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

  setCurrentTimeOutput (state, currentTime: number) {
    state.currentTimeOutput = currentTime
  },

  setCurrentTimeInput (state, currentTime: number) {
    state.currentTimeInput = currentTime
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
