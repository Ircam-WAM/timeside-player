// import {
//   ref,
//   Ref
// } from '@vue/composition-api'

// import api, {
//   Analysis
// } from '@/utils/api'

// const analysis = ref<Array<Analysis>>([])
// const analysisLoading = ref(true)
// const analysisError = ref<Response>()

// async function init() {
//   try {
//     const resp = await api.listAnalysis()
//     analysis.value = resp
//     analysisLoading.value = false
//     analysisError.value = undefined
//   } catch (e) {
//     if (e instanceof Response) {
//       analysisError.value = e
//     } else {
//       console.error('Unknown error occured', e)
//     }
//   }
// }

// init()

// interface AnalysisStore {
//   analysis: Ref<Array<Analysis>>;
//   analysisLoading: Ref<boolean>;
//   analysisError: Ref<Response | undefined>;

// }

// export default function (): AnalysisStore {
//   return {
//     analysis,
//     analysisLoading,
//     analysisError
//   }
// }
