// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import browserUpdate from 'browser-update'

browserUpdate({
  required: {
    e: -2,
    i: 11,
    f: -3,
    o: -3,
    s: 10.1,
    c: -2,
    samsung: 7.0,
    vivaldi: 1.2
  },
  insecure: true
})
