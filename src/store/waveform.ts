/* eslint-disable @typescript-eslint/no-use-before-define */
import { defineModule, defineActions, defineMutations, defineGetters } from 'direct-vuex'
import { moduleActionContext } from './index'
import api, { ItemWaveform, ItemWaveformWaveform } from '@/utils/api'

export interface WaveformSegment {
  time: number;
  max: number;
  min: number;
}

export type Waveform = WaveformSegment[]

export interface WaveformState {
  waveformApi?: ItemWaveformWaveform;
  promise?: Promise<ItemWaveform>;
  error?: Response;
}

const getDefaultState = (): WaveformState => ({
  waveformApi: undefined,
  promise: undefined,
  error: undefined,
})

const state = getDefaultState

const getters = defineGetters<WaveformState>()({
  isLoading (state): boolean {
    return state.promise !== undefined
  },

  waveformSegments (state): (Waveform | undefined) {
    if (!state.waveformApi) {
      return undefined
    }
    const data: Waveform = []
    for (const i of state.waveformApi.time.keys()) {
      data[i] = {
        time: state.waveformApi.time[i], // from seconds to milliseconds
        min: state.waveformApi.min[i],
        max: state.waveformApi.max[i]
      }
    }
    return data
  },

  hasValidLength (state): boolean {
    const waveform = state.waveformApi
    if (!waveform) {
      return false
    }
    return (waveform.time.length > 0) &&
      (waveform.time.length === waveform.min.length) &&
      (waveform.min.length === waveform.max.length)
  },

  // A waveform should always have different values in min / max
  hasValidValues (state): boolean {
    const waveform = state.waveformApi
    if (!waveform) {
      return false
    }
    const arrayHasConstantValues = (arr: number[]): boolean => {
      const isEqualFloat = (a: number, b: number) => Math.abs(a - b) <= 0.0001
      return arr.every((val: number) => isEqualFloat(val, arr[0]))
    }
    if (arrayHasConstantValues(waveform.min)) {
      console.error('Unexpected waveform: waveform.min has constant values', waveform.min)
      return false
    }
    if (arrayHasConstantValues(waveform.max)) {
      console.error('Unexpected waveform: waveform.max has constant values', waveform.max)
      return false
    }
    return true
  },

  isValid (state, getters): boolean {
    if (!state.waveformApi) {
      return false
    }
    if (!getters.hasValidLength) {
      console.error('Unexpected waveform: waveform has invalid length', state.waveformApi)
      return false
    }
    return getters.hasValidValues
  }
})

const mutations = defineMutations<WaveformState>()({
  resetState (state) {
    Object.assign(state, getDefaultState())
  },

  setPromise (state, promise: Promise<ItemWaveform>) {
    state.promise = promise
  },

  unsetPromise (state) {
    state.promise = undefined
  },

  setError (state, error) {
    state.error = error
  },

  unsetError (state) {
    state.error = undefined
  },

  setWaveformApi (state, waveform: ItemWaveformWaveform) {
    state.waveformApi = waveform
  }
})

const actions = defineActions({
  async retrieveWaveform (context, uuid: string): Promise<void> {
    const { commit } = waveformActionContext(context)
    const promise = api.retrieveItemWaveform({ uuid })
    commit.setPromise(promise)

    try {
      const waveform = await promise
      if (!waveform.waveform) {
        throw new Error('waveform is empty')
      }
      commit.setWaveformApi(waveform.waveform)
      commit.unsetError()
    } catch (error) {
      commit.setError(error)
    }

    commit.unsetPromise()
  },
})

const m = defineModule({
  state,
  getters,
  mutations,
  actions,
  namespaced: true
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const waveformActionContext = (context: any) => moduleActionContext(context, m)
export default m
