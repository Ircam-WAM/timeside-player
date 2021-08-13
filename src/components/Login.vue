<template>
  <form
    class="login-form"
    @submit.prevent="submit"
  >
    <p>
      Fill in your
      <a :href="loginUrl" target="_blank">
        WASABI credentials
      </a>
    </p>
    <div class="fields">
      <input
        v-model="input.username"
        type="text"
        name="username"
        placeholder="Username"
        required
      >
      <input
        v-model="input.password"
        type="password"
        name="password"
        placeholder="Password"
        required
      >
    </div>
    <button class="submit">
      {{ loading ? 'Loading...' : 'Login' }}
    </button>
    <div v-if="apiError" class="error">
      <div v-if="isUnauthorized">
        Invalid credentials
      </div>
      <div v-else-if="errorFmt">
        {{ errorFmt }}
      </div>
      <div v-else>
        Unknown error: {{ apiError }}
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed
} from 'vue'

import { formatResponseError } from '@/utils/response-error'

import { useApi } from '@/utils/api'
import { JWTToken } from '@ircam/timeside-sdk'

export default defineComponent({
  emits: [ 'success' ],
  setup (_, { emit }) {
    const { rawApi, persistentToken, currentBaseUrl } = useApi()
    const loading = ref(false)
    const input = ref({
      username: '',
      password: ''
    })
    const apiError = ref<Response | undefined>(undefined)

    const errorFmt = computed<string | undefined>(() => {
      if (!apiError.value) {
        return undefined
      }
      return formatResponseError(apiError.value)
    })
    const isUnauthorized = computed<boolean>(() => apiError.value ? apiError.value.status === 401 : false)

    async function submit () {
      apiError.value = undefined
      loading.value = true
      try {
        const resp = await rawApi.createTokenObtainPair({ tokenObtainPair: input.value })
        if (!resp.access || !resp.refresh) {
          throw new Error('Unexpected empty token response: ' + JSON.stringify(resp))
        }
        persistentToken.token = JWTToken.fromBase64(resp.access, resp.refresh)
        emit('success')
      } catch (e) {
        if (e instanceof Response) {
          apiError.value = e
        }
        console.error(e)
      }
      loading.value = false
    }

    const loginUrl = computed(() => `${currentBaseUrl}/admin/login/`)

    return {
      submit,
      loading,
      input,
      apiError,
      errorFmt,
      isUnauthorized,
      loginUrl
    }
  }
})
</script>

<style lang="less" scoped>
* {
  box-sizing: border-box;
}

.login-form {
  max-width: 300px;
  margin: 0 auto;

  & input,
  & button {
    display: block;
    width: 100%;
  }

  & .fields {
    margin-bottom: 10px;
  }

  & .fields > *:not(:last-child) {
    margin-bottom: 5px;
  }
}

.error {
  color: red;
  margin: 10px;
}
</style>
