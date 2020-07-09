# timeside-player

> :warning: This player is in **pre-alpha stage**.

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

## Library usage

### Usage (UMD)

```html
<!-- Player location -->
<div id="timeside-player"></div>

<!-- Load latest version -->
<script src="https://unpkg.com/@ircam/timeside-player@latest/dist/timeside-player.umd.min.js"></script>

<!-- Init the player -->
<script>
	const timesideUuid = '733f655a-1c9d-4ab8-93af-53eeddb030db'
	const player = window.timesidePlayer('#timeside-player', timesideUuid)
</script>
```

For a usage example, see [lib-examples/umd/index.html](lib-examples/umd/index.html)

### Usage (CommonJS): Webpack, Rollup etc...

```
npm install --save @ircam/timeside-player@latest
```

```js
import TimesidePlayer from '@ircam/timeside-player'

const playerDiv = document.querySelector('#timeside-player')
const timesideItem = '733f655a-1c9d-4ab8-93af-53eeddb030db'
const timesidePlayer = TimesidePlayer(playerDiv, timesideItem)

// You can unload it
// timesidePlayer.destroy()
```

For an integration example with React, see [lib-examples/react/src/TimesidePlayer.jsx](lib-examples/react/src/TimesidePlayer.jsx).    
If you want to load the package from a CDN for an up-to-date version, see [lib-examples/react/src/TimesidePlayerCDN.jsx](lib-examples/react/src/TimesidePlayerCDN.jsx).

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

For local environment, you may want to make use of the `cypress.env.json` file which has a template.
```
cp cypress.env.json.example cypress.env.json
```

You can edit the file to set the appropriate values.
```
$EDITOR cypress.env.json
```

And run the end-to-end test suite.
```
npm run test:e2e
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

#### Authors

- [Martin Desrumaux](https://github.com/gnuletik)
