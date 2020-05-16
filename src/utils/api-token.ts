import jwtDecode from 'jwt-decode'

const localStorageKey = 'timeside-api-token'

interface DecodedToken {
  exp: number;
  jti: string;
  token_type: string;
  user_id: string;
}

class JWTToken {
  readonly base64: string;
  readonly decoded: DecodedToken;

  constructor (base64: string) {
    this.base64 = base64
    this.decoded = jwtDecode<DecodedToken>(base64)
  }

  // We use an offset of 100ms to anticipate
  // network latency of API requests
  isExpired (offsetMs = 100): boolean {
    return (Date.now() + offsetMs) >= this.decoded.exp * 1000
  }
}

// Use readonly to force usage of setToken
interface Token {
  readonly access: JWTToken;
  readonly refresh: JWTToken;
}

interface RawToken {
  access: string;
  refresh: string;
}

let token: Token | undefined

export function shouldRefreshToken (): boolean {
  if (!token) {
    return false
  }
  // Useless to try to refresh the access token
  // if the refresh token is expired
  if (token.refresh.isExpired()) {
    return false
  }
  return token.access.isExpired()
}

export function setToken (newToken: RawToken) {
  token = {
    access: new JWTToken(newToken.access),
    refresh: new JWTToken(newToken.refresh)
  }
  const saved = {
    access: token.access.base64,
    refresh: token.refresh.base64
  }
  localStorage.setItem(localStorageKey, JSON.stringify(saved))
}

export function updateAccessToken (accessToken: string): void {
  if (!token) {
    throw new Error('unable to set access token without refresh token')
  }
  setToken({
    refresh: token.refresh.base64,
    access: accessToken
  })
}

export function removeToken () {
  token = undefined
  localStorage.removeItem(localStorageKey)
}

export function getToken () {
  return token
}

export function hasToken () {
  return token !== undefined
}

function getFromLocalStorage (): RawToken | undefined {
  if (!window.localStorage) {
    throw new Error('window.localStorage is undefined')
  }
  const raw = localStorage.getItem(localStorageKey)
  if (!raw) {
    return undefined
  }
  const untyped = JSON.parse(raw)
  if (!untyped.access || !untyped.refresh) {
    return undefined
  }
  const typed = {
    access: untyped.access,
    refresh: untyped.refresh
  }
  return typed
}

export function initToken () {
  const tok = getFromLocalStorage()
  if (!tok) {
    return
  }
  // setToken can throw InvalidTokenError (from jwtDecode)
  try {
    setToken(tok)
    if (!token) {
      throw new Error('unexpected empty token after setToken')
    }
    if (token.refresh.isExpired()) {
      removeToken()
    }
  } catch (e) {
    console.error(`Invalid token (${JSON.stringify(tok)}). Deleting it from localStorage`)
    removeToken()
  }
}
