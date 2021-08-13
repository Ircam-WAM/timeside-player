import { Item, ItemAudioUrl } from '@/utils/api'

export interface AudioSrc {
  type?: string
  src: string
}

// getAudioSrc returns an array easier to use than API data
export function getAudioSrcs (item: Item): (AudioSrc[] | undefined) {
  const audioUrl = item.audioUrl

  // Use differents formats providen by item.audioUrl (if any)
  if ((audioUrl !== undefined) && Object.keys(audioUrl).length > 0) {
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
  if (item.sourceFile !== null) {
    // Need to be casted as string because the SDK define it as Blob
    // See https://github.com/Parisson/TimeSide/issues/151
    const src = item.sourceFile as unknown as string
    return [
      { type: undefined, src }
    ]
  }

  return undefined
}
