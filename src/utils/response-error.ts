export function formatResponseError (resp: Response) {
  return `Invalid response from the API: ${resp.statusText} (${resp.status})`
}
