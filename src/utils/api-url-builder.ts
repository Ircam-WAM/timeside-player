import { basePath } from './api'

// Building URL from ID for API POST requests where an Hyperlink is required
// https://github.com/Parisson/TimeSide/issues/188

export function getItemUrl (uuid: string) {
  return `${basePath}/timeside/api/items/${uuid}/`
}

export function getAnalysisUrl (uuid: string) {
  return `${basePath}/timeside/api/analysis/${uuid}/`
}

export function getAnnotationTrackUrl (uuid: string) {
  return `${basePath}/timeside/api/annotation_tracks/${uuid}/`
}

export function getUuidFromResultUrl (url: string) {
  if (!url.startsWith('http')) {
    throw new Error('Unexpected URL. Not starting with "http"')
  }
  const segments = url.split('/')
  if (segments.length <= 3) {
    throw new Error(`Unexpected URL. segments: ${JSON.stringify(segments)}`)
  }
  const uuid = segments[segments.length - 2]
  return uuid
}

export function getUuidFromAnalysisUrl (url: string) {
  if (!url.startsWith('http')) {
    throw new Error('Unexpected URL. Not starting with "http"')
  }
  const segments = url.split('/')
  if (segments.length <= 3) {
    throw new Error(`Unexpected URL. segments: ${JSON.stringify(segments)}`)
  }
  const uuid = segments[segments.length - 2]
  return uuid
}
