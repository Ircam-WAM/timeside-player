import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import Player from '@/components/Player.vue'
import { PlayState } from '@/store/audio'

import { useStore, resetStore } from '@/store/index'

const fooItem = {
  title: 'Poker Blues - Yomii',
  description: 'That\'s a song',
  uuid: 'random-uuid',
  audioUrl: {
    ogg: 'https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_1MG.mp3',
    mp3: 'https://file-examples.com/wp-content/uploads/2017/11/file_example_OOG_1MG.ogg'
  }
}

const getShallowMount = async () => {
  resetStore()
  const store = useStore()
  const wrapper = shallowMount(Player, {
    propsData: {
      itemId: fooItem.uuid
    }
  })

  // Skip initial call
  try {
    await store.getters.items.getPromiseById(fooItem.uuid)
  } catch (e) {
    expect(e === undefined)
  }

  // Set store value
  store.commit.items.unsetPromise(fooItem.uuid)
  store.commit.items.unsetError(fooItem.uuid)
  store.commit.items.setItem(fooItem)
  await wrapper.vm.$nextTick()

  return { store, wrapper }
}

describe ('Player.vue', () => {
  it('should show metadata (title, description, uuid)', async (done) => {
    const { wrapper } = await getShallowMount()
    const metadataContainer = wrapper.find('.item-metadata')
    expect(metadataContainer.exists()).toBe(true)

    expect(metadataContainer.find('.title').text()).toBe(`title: ${fooItem.title}`)
    expect(metadataContainer.find('.description').text()).toBe(`description: ${fooItem.description}`)
    expect(metadataContainer.find('.uuid').text()).toBe(`uuid: ${fooItem.uuid}`)

    // Explicit call wrapper.destroy to remove side-effects in the next test
    // Without this, the keydown event handler attached to the window will be run twice
    wrapper.destroy()
    done()
  })

  it('should set playState according to keyboard events', async (done) => {
    const { store } = await getShallowMount()

    // Initial state should be stop
    expect(store.state.audio.playState).toBe(PlayState.Stop)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
    expect(store.state.audio.playState).toBe(PlayState.Play)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
    expect(store.state.audio.playState).toBe(PlayState.Pause)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
    expect(store.state.audio.playState).toBe(PlayState.Play)

    done()
  })
})
