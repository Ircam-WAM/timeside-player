import { usePlayerRect } from '../utils/use-player-rect'
import { useStore } from '@/store/index'

export default function useTrackHelpers () {
  const store = useStore()
  const playerSize = usePlayerRect()

  const positionToTime = (pos: number) => {
    const duration = store.state.audio.duration
    const width = playerSize.value.width

    return pos / width * duration
  }

  const timeToPosition = (time: number) => {
    const duration = store.state.audio.duration
    const width = playerSize.value.width

    return time * width / duration
  }

  return {
    positionToTime,
    timeToPosition
  }
}
