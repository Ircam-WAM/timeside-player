import portableFetch from 'portable-fetch'

import {
  TimesideApi,
  Configuration,
  AutoRefreshConfiguration,
  AbortableFetch,

  LocalStorageJWTToken
} from '@ircam/timeside-sdk'

const defaultBaseUrls = [
  'https://sandbox.wasabi.telemeta.org',
  'https://wasabi.telemeta.org',
  'https://timeside.ircam.fr'
]

// First item is the default one
export const baseUrls: readonly string[] = process?.env?.VUE_APP_TIMESIDE_BASE_URL?.split(',') ?? defaultBaseUrls

export const basePath = window.localStorage.getItem('api-url') || baseUrls[0]

export const loginUrl = `${basePath}/admin/login/`

export const persistentToken = new LocalStorageJWTToken()
persistentToken.init()

const urlConfig = {
  basePath,
  // For tests where fetch and browser compatibility
  fetchApi: portableFetch
}

// rawApi is the the api without jwt middlewares (to refresh tokens)
export const rawApi = new TimesideApi(new Configuration(urlConfig))

// Configuration to auto-refresh token when needed
const config = AutoRefreshConfiguration(urlConfig, persistentToken)

export function newAbortableApi (abortController: AbortController): TimesideApi {
  const fetchApi = AbortableFetch(abortController, config.fetchApi)
  return new TimesideApi(new Configuration({ ...config, fetchApi }))
}

export default new TimesideApi(new Configuration(config))
export * from '@ircam/timeside-sdk'
