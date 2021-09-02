import { inject, InjectionKey } from 'vue'
import {
  TimesideApi,
  Configuration,
  AutoRefreshConfiguration,
  AbortableFetch,
  PersistentJWTToken,

  LocalStorageJWTToken,

  Item as BaseItem,
  Result as BaseResult,
  AnnotationTrack as BaseAnnotationTrack
} from '@ircam/timeside-sdk'

interface API {
  baseUrls: readonly string[]
  currentBaseUrl: string
  persistentToken: PersistentJWTToken

  api: TimesideApi
  rawApi: TimesideApi
  newAbortableApi: (abortController: AbortController) => TimesideApi
}

// makes uuid of API Item never undefined
export interface Item extends BaseItem {
  uuid: string
}

export interface Result extends BaseResult {
  uuid: string
}

export interface AnnotationTrack extends BaseAnnotationTrack {
  uuid: string
}

function getBaseUrls (baseUrl?: string): readonly string[] {
  // if a baseUrl is provided as argument, then use it
  if (baseUrl !== undefined) {
    return [ baseUrl ]
  }
  // else, fallback to env config
  const envUrls = import.meta.env.VITE_TIMESIDE_BASE_URL
  if (typeof envUrls === 'string' && envUrls !== '') {
    return envUrls.split(',')
  }
  // else, use hardcoded values
  const defaultBaseUrls = [
    'https://sandbox.wasabi.telemeta.org',
    'https://wasabi.telemeta.org',
    'https://timeside.ircam.fr',
    'http://localhost:9080'
  ]
  return defaultBaseUrls
}

export function createApi (baseUrl?: string): API {
  const baseUrls: readonly string[] = getBaseUrls(baseUrl)
  const currentBaseUrl = baseUrl ?? window.localStorage.getItem('api-url') ?? baseUrls[0]

  // Persistent token that stores the JWT Access/Refresh tokens
  const persistentToken = new LocalStorageJWTToken()
  persistentToken.init()

  const urlConfig = {
    basePath: currentBaseUrl
  }

  // rawApi is the the api without jwt middlewares (to refresh tokens)
  const rawApi = new TimesideApi(new Configuration(urlConfig))

  // Configuration to auto-refresh token when needed
  const config = AutoRefreshConfiguration(urlConfig, persistentToken)

  const api = new TimesideApi(new Configuration(config))

  // API wrapper that allows to abort requests
  function newAbortableApi (abortController: AbortController): TimesideApi {
    const fetchApi = AbortableFetch(abortController, config.fetchApi)
    return new TimesideApi(new Configuration({ ...config, fetchApi }))
  }

  return {
    baseUrls,
    currentBaseUrl,
    persistentToken,

    api,
    rawApi,
    newAbortableApi
  }
}

export const apiInjectionKey: InjectionKey<API> = Symbol('api')

export function useApi (): API {
  const resolved = inject(apiInjectionKey)
  if (resolved === undefined) {
    throw new Error('api not found')
  }
  return resolved
}

export * from '@ircam/timeside-sdk'
