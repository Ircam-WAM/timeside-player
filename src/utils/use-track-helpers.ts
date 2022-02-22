import { usePlayerRect } from '../utils/use-player-rect'
import { useAudioStore } from '@/store/audio'

import { Region as RegionType } from '@/types/region'

interface TrackHelpers {
  positionToTime: (time: number, selection?: RegionType) => number
  timeToPosition: (pos: number, selection?: RegionType) => number
}

export default function useTrackHelpers (): TrackHelpers {
  const audioStore = useAudioStore()
  const playerSize = usePlayerRect()

  const positionToTime = (pos: number, selection?: RegionType): number => {
    const duration = (() => {
      if (selection !== undefined) {
        return selection.stop - selection.start
      }
      return audioStore.state.duration
    })()
    const offset = (selection !== undefined) ? selection.start : 0
    const width = playerSize.value.width

    if (width === 0) {
      console.warn('positionToTime: unexpected width', width)
      return 0
    }

    // Use int instead of float to avoid updating-loop
    // because oldValue is not always equal newValue for float numbers
    return Math.round(offset + pos / width * duration)
  }

  const timeToPosition = (time: number, selection?: RegionType): number => {
    const width = playerSize.value.width
    let selectionStart = 0
    const duration = (() => {
      if (selection !== undefined) {
        selectionStart = selection.start
        return selection.stop - selection.start
      }
      return audioStore.state.duration
    })()

    if (duration === 0) {
      console.warn('timeToPosition: unexpected duration', duration)
      return 0
    }

    // Use int instead of float to avoid updating-loop
    // because oldValue is not always equal newValue for float numbers
    return Math.round((time - selectionStart) * width / duration)
  }

  return {
    positionToTime,
    timeToPosition
  }
}
