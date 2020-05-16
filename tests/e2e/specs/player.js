describe('Auth', () => {
  it('should ask to login', () => {
    cy.visit('/')
    cy.contains('div', 'Fill in your')
  })

  it('should not ask to login', () => {
    cy.visit('/')
    cy.login()
    cy.get('.loading').should('not.exist')
    cy.contains('div', 'Fill in your').should('not.exist')
  })
})

describe('App', () => {
  it('should include welcome message', () => {
    cy.visit('/')
    cy.contains('h1', 'Welcome to timeside-player')
  })

  it('shoud list at least two items', () => {
    cy.visit('/')
    cy.login()
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
