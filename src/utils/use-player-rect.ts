import { provide, inject, Ref, InjectionKey } from 'vue'

export const key: InjectionKey<Ref<DOMRectReadOnly>> = Symbol('PlayerRectKey')

export function providePlayerRect (playerRect: Ref<DOMRectReadOnly>): void {
  provide(key, playerRect)
}

export function usePlayerRect (): Ref<DOMRectReadOnly> {
  const playerRect = inject(key)
  if (playerRect === undefined) {
    throw new Error('playerRect not available')
  }
  return playerRect
}
