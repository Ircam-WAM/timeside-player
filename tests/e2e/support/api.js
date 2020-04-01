export const API_BASE = 'https://sandbox.wasabi.telemeta.org'
export const API_USER = 'admin'
export const API_PASS = '9DranEycsag?'
// const API_BASE = 'https://wasabi.telemeta.org'
// const API_USER = 'admin'
// const API_PASS = 'admin'

// set api-url in local storage to let app know which API URL it should use
beforeEach(() => {
  window.localStorage.setItem('api-url', API_BASE)
  cy.log(`Setting API URL: ${API_BASE}`)
})
