import Vue from 'vue'
import Vuex from 'vuex'
import items from './items'
import itemList from './itemList'
import audio from './audio'
import waveform from './waveform'
import { createDirectStore } from 'direct-vuex'

Vue.use(Vuex)

const options = {
  modules: {
    items,
    itemList,
    audio,
    waveform
  }
}

const {
  store,
  rootActionContext,
  moduleActionContext
} = createDirectStore(options)

// The following exports will be used to enable types in the
// implementation of actions.
export { rootActionContext, moduleActionContext }

export function useStore () {
  return store
}

// Call the resetState mutation on every module
// Make sure to implement it in every module
export function resetStore () {
  Object.values(store.commit).forEach((mod) => mod.resetState())
}

export default store
