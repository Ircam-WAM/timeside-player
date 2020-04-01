import { API_BASE, API_USER, API_PASS } from '../support/api'

describe('Login on WASABI', () => {
  it('Login', () => {
    cy.visit(`${API_BASE}/admin/login`)

    cy.get('form').within(() => {
      cy.get('input[name=username]').type(API_USER)
      cy.get('input[name=password]').type(API_PASS)
      cy.root().submit()
    })

    cy.getCookie('sessionid').should('exist')
    cy.getCookie('csrftoken').should('exist')
  })
})
