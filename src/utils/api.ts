import portableFetch from 'portable-fetch'
import { TimesideApi, Configuration, ConfigurationParameters } from '@ircam/timeside-sdk'

/*
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'
const isNode = !isBrowser

const headers: Record<string, string> = {}
if (isNode) {
  headers['cookie'] = `${csrfCookie}; ${sessionCookie}`
}
*/

// First item is the default one
export const baseUrls: readonly string[] = [
  'https://sandbox.wasabi.telemeta.org',
  'https://wasabi.telemeta.org'
]

const basePath = window.localStorage.getItem('api-url') || baseUrls[0]

const config: ConfigurationParameters = {
  basePath,
  credentials: 'include',

  // For tests where fetch and cookies does not exists
  fetchApi: portableFetch,
}

export const loginUrl = `${basePath}/admin/login/`

export function newAbortableApi (abortController: AbortController): TimesideApi {
  const abortableFetch = (url: string, params: RequestInit | undefined): Promise<Response> => {
    params = params || {}
    params.signal = abortController.signal
    const configFetch = config.fetchApi || window.fetch.bind(window)
    return configFetch(url, params)
  }

  const abortConfig = new Configuration({
    ...config,
    fetchApi: abortableFetch
  })

  return new TimesideApi(abortConfig)
}

export default new TimesideApi(new Configuration(config))
export * from '@ircam/timeside-sdk'
