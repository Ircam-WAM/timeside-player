import { API_USER, API_PASS } from './api'

Cypress.Commands.add('login', () => {
  cy.visit(`/`)

  cy.get('form').within(() => {
    cy.get('input[name=username]').type(API_USER)
    cy.get('input[name=password]').type(API_PASS)
    cy.root().submit()
  })
})

Cypress.Commands.add('logout', () => {
  cy.visit(`/`)
  cy.get('.logout').click()
})
