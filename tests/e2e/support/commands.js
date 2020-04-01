import { API_BASE, API_USER, API_PASS } from './api'

Cypress.Commands.add('login', () => {
  const loginUrl = `${API_BASE}/accounts/login/`

  return cy.request({
    url: loginUrl,
    followRedirect: false
  })
  .then((resp) => {
    const $html = Cypress.$(resp.body)
    const csrfmiddlewaretoken = $html.find("input[name=csrfmiddlewaretoken]").val()

    if (!csrfmiddlewaretoken) {
      throw new Error(`unable to find csrfmiddlewaretoken input element. Already logged in?`)
    }

    return cy.request({
      method: 'POST',
      url: loginUrl,
      failOnStatusCode: false,
      followRedirect: false,
      form: true,
      body: {
        username: API_USER,
        password: API_PASS,
        csrfmiddlewaretoken
      },
      headers: {
        Referer: loginUrl
      }
    })
    .then(resp => {
      expect(resp.status).to.eq(302)
      expect(resp.headers).to.have.any.keys('location')
      expect(resp.headers.location).to.equal('/')
    })
  })
})

Cypress.Commands.add('logout', () => {
  const logoutUrl = `${API_BASE}/accounts/logout/`

	cy.request(logoutUrl).then(resp => {
    expect(resp.status).to.eq(200)
	})
})
