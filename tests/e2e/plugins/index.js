// https://docs.cypress.io/guides/guides/plugins-guide.html

// if you need a custom webpack configuration you can uncomment the following import
// and then use the `file:preprocessor` event
// as explained in the cypress docs
// https://docs.cypress.io/api/plugins/preprocessors-api.html#Examples

/* eslint-disable import/no-extraneous-dependencies, global-require, arrow-body-style */
// const webpack = require('@cypress/webpack-preprocessor')

module.exports = (on, config) => {
  // on('file:preprocessor', webpack({
  //  webpackOptions: require('@vue/cli-service/webpack.config'),
  //  watchOptions: {}
  // }))

  /*
   * Disable Chrome's security feature until SameSite='None' is supported by Django
   * See https://github.com/Parisson/TimeSide/issues/165
  */

  on('before:browser:launch', (browser = {}, args) => {
    if (browser.family === 'chrome') {
      // Replace with the following lines for Cypress 4.x
      // and rename args to launchOptions
      // See: https://github.com/cypress-io/cypress-documentation/pull/2458/files?short_path=d0a18cb#diff-d0a18cb23b541dc1c36690ed47012707
      // launchOptions.args.push()
      // return launchOptions
      args.push('--disable-features=SameSiteByDefaultCookies')
      return args
    }
  })

  return Object.assign({}, config, {
    fixturesFolder: 'tests/e2e/fixtures',
    integrationFolder: 'tests/e2e/specs',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    supportFile: 'tests/e2e/support/index.js'
  })
}
