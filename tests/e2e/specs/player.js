describe('Auth', () => {
  it('should ask to login', () => {
    // Call logout to force removing cookies
    // see https://github.com/cypress-io/cypress/issues/408
		cy.logout()
    cy.visit('/')
    cy.contains('div', 'You do not seems to be logged in.')
  })

  it('should not ask to login', () => {
    cy.login()
    cy.visit('/')
    cy.get('.loading').should('not.exist')
    cy.contains('div', 'You do not seems to be logged in.').should('not.exist')
  })
})

describe('App', () => {
  it('should include welcome message', () => {
    cy.visit('/')
    cy.contains('h1', 'Welcome to timeside-player')
  })

  it('shoud list at least two items', () => {
    cy.login()
    cy.visit('/')
    cy.get('.items > a').should('have.length.at.least', 2)
  })

  /*
  it('should go to player view', () => {
    cy.login()
    cy.visit('/')
    cy.click()
  })
  */
})
