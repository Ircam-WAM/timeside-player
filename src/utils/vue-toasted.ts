import Vue from 'vue'
import { InjectionKey, provide, inject } from '@vue/composition-api'
import { Toasted } from 'vue-toasted'

export const key: InjectionKey<Toasted> = Symbol('vue-toasted key')

export function provideToasted () {
  const toasted = Vue.toasted
  provide(key, toasted)
}

export function useToasted (): Toasted {
  const toasted = inject(key)
  if (!toasted) {
    throw new Error('Toasted not available')
  }
  return toasted
}
