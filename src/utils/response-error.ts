export function formatResponseError (err: Response | any): string {
  if (err instanceof Response) {
    return `Invalid response from the API: ${err.statusText} (${err.status})`
  } else {
    console.error('unknwown error: ', err)
    return 'Unknown error from the API. Please check the console and network logs of your browser.'
  }
}
