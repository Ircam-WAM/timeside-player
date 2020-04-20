import { computed, getCurrentInstance } from '@vue/composition-api'

export default function useRouter () {
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
