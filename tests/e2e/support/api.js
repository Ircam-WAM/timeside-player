function mustGetEnv (key) {
  const val = Cypress.env(key)
  if (!val) {
    throw new Error(`"${key}" is not available in environment. Check README.md`)
  }
  return val
}

export const API_BASE = mustGetEnv('TIMESIDE_BASE_URL')
export const API_USER = mustGetEnv('TIMESIDE_USER')
export const API_PASS = mustGetEnv('TIMESIDE_PASS')

if (!API_BASE)

// set api-url in local storage to let app know which API URL it should use
beforeEach(() => {
  window.localStorage.setItem('api-url', API_BASE)
  cy.log(`Setting API URL: ${API_BASE}`)
})
