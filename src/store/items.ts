/* eslint-disable @typescript-eslint/no-use-before-define */
import Vue from 'vue'
import { defineModule, defineActions, defineMutations, defineGetters } from 'direct-vuex'
import { moduleActionContext } from './index'
import { itemListActionContext } from './itemList'
import api, { Item, ItemAudioUrl, ItemListFromJSONTyped, ItemToJSON } from '@/utils/api'

export interface ItemState {
  promises: Record<string, Promise<Item>>;
  errors: Record<string, Response>;
  items: Record<string, Item>;
}

const getDefaultState = (): ItemState => ({
  promises: {},
  items: {},
  errors: {},
})

const state = getDefaultState

export interface AudioSrc {
  type?: string;
  src: string;
}

// getAudioSrc returns an array easier to use than API data
function getAudioSrcs (item: Item): (AudioSrc[] | undefined) {
  const audioUrl = item.audioUrl

  // Use differents formats providen by item.audioUrl (if any)
  if (audioUrl && Object.keys(audioUrl).length > 0) {
    const formats: Array<keyof ItemAudioUrl> = [ 'flac', 'mp3', 'ogg' ]

    const ret = []
    for (const format of formats) {
      const type = `audio/${format}`
      const src = audioUrl[format]

      if (src === undefined) {
        continue
      }

      // Check URL format
      let url: URL
      try {
        url = new URL(src)
      } catch (_) {
        console.warn(`AudioSrc: Invalid format (${src}). Skipping...`)
        continue
      }

      ret.push({
        type,
        src: url.toString()
      })
    }

    return ret
  }

  // Use source file an let the browser guess the type
  if (item.sourceFile) {
    // Need to be casted as string because the SDK define it as Blob
    // See https://github.com/Parisson/TimeSide/issues/151
    const src = item.sourceFile as unknown as string
    return [
      { type: undefined, src }
    ]
  }

  return undefined
}

const getters = defineGetters<ItemState>()({
  isLoading (state): (id: string) => boolean {
    return (id: string) => state.promises[id] !== undefined
  },

  isUnauthorized (state): (id: string) => boolean {
    return (id: string) => state.errors[id] && state.errors[id].status === 401
  },

  getPromiseById (state): (id: string) => Promise<Item> | undefined {
    return (id: string) => state.promises[id]
  },

  getItemById (state): (id: string) => Item | undefined {
    return (id: string) => state.items[id]
  },

  getErrorById (state): (id: string) => Response | undefined {
    return (id: string) => state.errors[id]
  },

  getAudioSrcs (_, getters): (id: string) => AudioSrc[] | undefined {
    return (id: string) => {
      const item = getters.getItemById(id)
      if (!item) {
        return undefined
      }

      return getAudioSrcs(item)
    }
  }
})

const mutations = defineMutations<ItemState>()({
  resetState (state) {
    Object.assign(state, getDefaultState())
  },

  setPromise (state, { uuid, promise }: { uuid: string; promise: Promise<Item> }) {
    Vue.set(state.promises, uuid, promise)
  },

  unsetPromise (state, uuid: string) {
    Vue.delete(state.promises, uuid)
  },

  setItem (state, item: Item) {
    if (!item.uuid) {
      throw new Error(`Trying to set an item without uuid: ${JSON.stringify(item)}`)
    }
    Vue.set(state.items, item.uuid, item)
  },

  setError(state, { uuid, error }: { uuid: string; error: Response } ) {
    Vue.set(state.errors, uuid, error)
  },

  unsetError(state, uuid: string) {
    Vue.delete(state.errors, uuid)
  }
})

const actions = defineActions({
  async retrieveItem (context, uuid: string): Promise<void> {
    const { commit } = itemActionContext(context)
    const promise = api.retrieveItem({ uuid })
    commit.setPromise({ uuid, promise })

    try {
      const item = await promise
      commit.setItem(item)
      commit.unsetError(uuid)
    } catch (error) {
      commit.setError({ uuid, error })
    }
    commit.unsetPromise(uuid)
  },

  // In case of error, the action will throw a Response object
  async createItem (context, item: Item): Promise<void> {
    const { commit } = itemActionContext(context)
    const apiItem = await api.createItem({ item })
    commit.setItem(apiItem)

    // Converts an Item to ItemList thanks to JSON serialization helpers
    const itemList = ItemListFromJSONTyped(ItemToJSON(apiItem), false)
    const { commit: commitItemList } = itemListActionContext(context)
    commitItemList.addItem(itemList)
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
export const itemActionContext = (context: any) => moduleActionContext(context, m)
export default m
