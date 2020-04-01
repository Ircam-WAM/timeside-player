import portableFetch from 'portable-fetch'
import { TimesideApi, Configuration } from '@ircam/timeside-sdk'

/*
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'
const isNode = !isBrowser

const headers: Record<string, string> = {}
if (isNode) {
  headers['cookie'] = `${csrfCookie}; ${sessionCookie}`
}
*/

const basePath = window.localStorage.getItem('api-url') || 'https://sandbox.wasabi.telemeta.org'

const config = new Configuration({
  basePath,
  credentials: 'include',

  // For tests where fetch and cookies does not exists
  fetchApi: portableFetch,
  // headers
})

export const loginUrl = `${basePath}/admin/login/`

export default new TimesideApi(config)
export * from '@ircam/timeside-sdk'
