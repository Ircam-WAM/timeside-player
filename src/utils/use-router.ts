import {
  computed,
  ComputedRef,
  getCurrentInstance
} from '@vue/composition-api'

import Router, { Route } from 'vue-router'

interface UseRouter {
  route: ComputedRef<Route>;
  router: ComputedRef<Router>;
}

export default function useRouter (): UseRouter {
  const vm = getCurrentInstance()

  if (!vm) {
    throw new ReferenceError('Not found vue instance.');
  }

  // Reactive router
  const route = computed(() => vm.$route)
  const router = computed(() => vm.$router)

  return {
    route,
    router
  }
}
