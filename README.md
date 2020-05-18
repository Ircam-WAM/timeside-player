# timeside-player

Timeside Player is an application and library for [Timeside](https://github.com/parisson/timeside) Rest API.

Demo: https://ircam-web.github.io/timeside-player/

This project is built with :
* Typescript
* Vue.JS (with Composition API)
* ESLint: Linting
* Jest: Unit Testing
* Cypress: End-to-end testing
* EditorConfig
* Github Actions: CI & Deployment
* Dependabot

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Run your end-to-end tests

In order to run unit tests, you'll to set the following [cypress environments variables](https://docs.cypress.io/guides/guides/environment-variables.html):
- `TIMESIDE_USER`: Username for the Timeside API
- `TIMESIDE_PASS`: Password for the Timeside API
- `TIMESIDE_BASE_URL`: Base URL for the Timeside API (e.g 'https://sandbox.wasabi.telemeta.org')

For local environment, you may want to make use of the `cypress.env.json` file which has a template:
```
cp cypress.env.json.example cypress.env.json
```
You can edit the file to set the appropriate values.

```
$EDITOR cypress.env.json
```

```
npm run test:e2e
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
