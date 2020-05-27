import portableFetch from 'portable-fetch'

import {
  TimesideApi,
  Configuration,
  ConfigurationParameters,
  RequestContext,
  FetchParams
} from '@ircam/timeside-sdk'

import {
  initToken,
  getToken,
  shouldRefreshToken,
  updateAccessToken
} from './api-token'

// First item is the default one
export const baseUrls: readonly string[] = [
  'https://sandbox.wasabi.telemeta.org',
  'https://wasabi.telemeta.org'
]

export const basePath = window.localStorage.getItem('api-url') || baseUrls[0]

export const loginUrl = `${basePath}/admin/login/`

initToken()

const urlConfig: ConfigurationParameters = {
  basePath,
  // For tests where fetch and browser compatibility
  fetchApi: portableFetch,
}

// rawApi is the the api without jwt middlewares (to refresh tokens)
export const rawApi = new TimesideApi(new Configuration(urlConfig))

const config: ConfigurationParameters = {
  ...urlConfig,

  accessToken: () => {
    const token = getToken()
    if (!token) {
      return ''
    }
    return token.access.base64
  },

  middleware: [
    {
      // Refresh the access token before the request if it's expired
      pre: async (context: RequestContext): Promise<FetchParams | void> => {
        if (shouldRefreshToken()) {
          const token = getToken()
          if (!token) {
            throw new Error('unexpected error: hasToken is true but token is undefined')
          }
          const tokenRefresh = { refresh: token.refresh.base64 }
          const resp = await rawApi.createTokenRefresh({ tokenRefresh })
          if (!resp.access) {
            throw new Error('unexpected empty access token')
          }
          updateAccessToken(resp.access)

          // Override the token in the request
          const newHeaders = new Headers(context.init.headers)
          newHeaders.set('Authorization', `Bearer ${resp.access}`)
          context.init.headers = newHeaders
        }

        return {
          url: context.url,
          init: context.init
        }
      },
    }
  ]
}

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
