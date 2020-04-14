import { provide, inject, Ref, InjectionKey } from '@vue/composition-api'

export const key: InjectionKey<Ref<ClientRect>> = Symbol('PlayerRectKey')

export function providePlayerRect (playerRect: Ref<ClientRect>) {
  provide(key, playerRect)
}

export function usePlayerRect () {
  const playerRect = inject(key)
  if (!playerRect) {
    throw new Error('playerRect not available')
  }
  return playerRect
}
