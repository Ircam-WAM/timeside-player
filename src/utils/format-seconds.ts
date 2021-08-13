// formatSeconds takes a total number of seconds
// and returns a duration formatted as %H:%M:%S
export const formatSeconds = (val: number): string => {
  const hours = Math.floor(val / 3600)
  const minutes = Math.floor((val - (hours * 3600)) / 60)
  const seconds = val - (hours * 3600) - (minutes * 60)

  // Takes a number and returns a string with leading 0
  const fixedDigits = (val: number): string => val < 10 ? '0' : ''

  return [
    fixedDigits(hours) + hours.toString(),
    fixedDigits(minutes) + minutes.toString(),
    fixedDigits(seconds) + seconds.toFixed(2)
  ].join(':')
}
