import { provide, inject, Ref, InjectionKey } from '@vue/composition-api'
import { SimpleDOMRect } from '@/utils/use-bounding-client-rect'

export const key: InjectionKey<Ref<SimpleDOMRect>> = Symbol('PlayerRectKey')

export function providePlayerRect (playerRect: Ref<SimpleDOMRect>): void {
  provide(key, playerRect)
}

export function usePlayerRect (): Ref<SimpleDOMRect> {
  const playerRect = inject(key)
  if (!playerRect) {
    throw new Error('playerRect not available')
  }
  return playerRect
}
