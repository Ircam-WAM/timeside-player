export const API_BASE = Cypress.env('TIMESIDE_BASE_URL')
export const API_USER = Cypress.env('TIMESIDE_USER')
export const API_PASS = Cypress.env('TIMESIDE_PASS')

// set api-url in local storage to let app know which API URL it should use
beforeEach(() => {
  window.localStorage.setItem('api-url', API_BASE)
  cy.log(`Setting API URL: ${API_BASE}`)
})
