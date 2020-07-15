import { mount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Player from '@/components/Player.vue'
import { PlayState } from '@/store/audio'

import Toasted from 'vue-toasted'
import { key as vueToastedKey } from '@/utils/vue-toasted'

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

const getMount = () => {
  const localVue = createLocalVue()

  // Router
  localVue.use(VueRouter)

  // Toasted
  localVue.use(Toasted)

  // Store
  resetStore()
  const store = useStore()

  // Set store value
  store.commit.items.setItem(fooItem)
  store.commit.audio.setDuration(3000)

  const $route = {
    name: 'Player',
    query: {}
  }

  const wrapper = mount(Player, {
    propsData: {
      item: fooItem
    },
    stubs: [ 'Audio', 'WaveformContainer' ],
    mocks: {
      $route
    },
    provide: {
      [vueToastedKey as symbol]: localVue.toasted
    }
  })

  return { store, wrapper }
}

describe ('Player.vue', () => {
  // Mock Element.animate
  beforeEach(() => {
    /* eslint-disable @typescript-eslint/no-empty-function */
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    // eslint-disable-next-line @typescript-eslint/unbound-method
    // @ts-ignore-start
    Element.prototype.animate = jest.fn(() => ({
      pause () {},
      play () {},
      effect: {
        updateTiming () {}
      }
    }))
    // @ts-ignore-end
  })
  it('should set playState according to keyboard events', () => {
    const { store } = getMount()

    // Initial state should be stop
    expect(store.state.audio.playState).toBe(PlayState.Stop)
  })
})
