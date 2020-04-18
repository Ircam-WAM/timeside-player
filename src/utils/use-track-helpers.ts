import { usePlayerRect } from '../utils/use-player-rect'
import { useStore } from '@/store/index'

export default function useTrackHelpers () {
  const store = useStore()
  const playerSize = usePlayerRect()

  const positionToTime = (pos: number) => {
    const duration = store.state.audio.duration
    const width = playerSize.value.width

    if (!width) {
      console.warn('positionToTime: unexpected width', width)
      return 0
    }

    // Use int instead of float to avoid updating-loop
    // because oldValue is not always equal newValue for float numbers
    return Math.round(pos / width * duration)
  }

  const timeToPosition = (time: number) => {
    const duration = store.state.audio.duration
    const width = playerSize.value.width

    if (!duration) {
      console.warn('timeToPosition: unexpected duration', duration)
      return 0
    }

    // Use int instead of float to avoid updating-loop
    // because oldValue is not always equal newValue for float numbers
    return Math.round(time * width / duration)
  }

  return {
    positionToTime,
    timeToPosition
  }
}
