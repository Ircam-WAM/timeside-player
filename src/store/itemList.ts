/* eslint-disable @typescript-eslint/no-use-before-define */
import { defineModule, defineActions, defineMutations, defineGetters } from 'direct-vuex'
import { moduleActionContext } from './index'

import api, { ItemList } from '@/utils/api'

export interface ItemListState {
  promise?: Promise<ItemList[]>;
  error?: Response;
  itemList?: ItemList[];
}

const getDefaultState = (): ItemListState => ({
  promise: undefined,
  error: undefined,
  itemList: undefined,
})

const state = getDefaultState

const getters = defineGetters<ItemListState>()({
  isLoading (state): boolean {
    return state.promise !== undefined
  },

  isUnauthorized (state): boolean {
    return state.error && state.error.status === 401 || false
  }
})

const mutations = defineMutations<ItemListState>()({
  resetState (state) {
    Object.assign(state, getDefaultState())
  },

  setPromise (state, promise: Promise<ItemList[]>) {
    state.promise = promise
  },

  unsetPromise (state) {
    state.promise = undefined
  },

  setItems (state, items: ItemList[]) {
    state.itemList = items
  },

  addItem (state, item: ItemList) {
    if (!state.itemList) {
      throw new Error(`state.itemList is ${state.itemList}. Unable to push`)
    }
    state.itemList.push(item)
  },

  setError(state, error: Response) {
    state.error = error
  },

  unsetError(state) {
    state.error = undefined
  }
})

const actions = defineActions({
  async getItems (context): Promise<void> {
    const { commit } = itemListActionContext(context)
    const promise = api.listItems({})
    commit.unsetError()
    commit.setPromise(promise)
    try {
      const items = await promise
      commit.setItems(items)
    } catch (e) {
      commit.setError(e)
    }
    commit.unsetPromise()
  }
})

const m = defineModule({
  state,
  getters,
  mutations,
  actions,
  namespaced: true
})

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const itemListActionContext = (context: any) => moduleActionContext(context, m)
export default m
