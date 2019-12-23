// https://github.com/typescript-eslint/typescript-eslint/issues/363
/* eslint-disable @typescript-eslint/no-unused-vars */
import Vue, { VNode } from 'vue'

declare global {
  namespace JSX {
    /* eslint-disable @typescript-eslint/no-empty-interface */
    interface Element extends VNode {}
    interface ElementClass extends Vue {}
    /* eslint-enable @typescript-eslint/no-empty-interface */
    interface IntrinsicElements {
      [elem: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  }
}
