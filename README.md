# timeside-player

> :warning: This player is in **pre-alpha stage**.

Timeside Player is an application and library for [Timeside](https://github.com/Ircam-WAM/TimeSide) Rest API.

Demo: https://ircam-wam.github.io/timeside-player/

This project is built with :
* Typescript
* Vue 3
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

<!-- Load CSS -->
<link href="https://unpkg.com/@ircam/timeside-player@latest/lib/style.css" rel="stylesheet">

<!-- Load latest version -->
<script src="https://unpkg.com/@ircam/timeside-player@latest/lib/timeside-player.umd.js"></script>

<!-- Init the player -->
<script>
	const timesideUuid = '733f655a-1c9d-4ab8-93af-53eeddb030db'
	const apiUrl = 'https://sandbox.wasabi.telemeta.org'
	const player = window.TimesidePlayer('#timeside-player', timesideUuid, apiUrl)
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
yarn install
```

## Configure environment

```
cp env.example .env.local
$EDITOR .env.local
```

### Compiles and hot-reloads for development
```
yarn run dev
```

### Compiles and minifies for production
```
yarn run build
```

### Lints and fixes files
```
yarn run lint
```

#### Authors

- [Martin Desrumaux](https://github.com/gnuletik)
