export function formatResponseError (resp: Response) {
  if (resp.statusText || resp.status) {
    return `Invalid response from the API: ${resp.statusText} (${resp.status})`
  } else {
    console.error('unknwown error: ', resp)
    return 'Unknown error from the API. Please check the console and network logs of your browser.'
  }
}
