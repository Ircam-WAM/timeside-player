import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'

// This is not recommended to edit the global Vue instance for testing
// cf https://vue-test-utils.vuejs.org/guides/#applying-global-plugins-and-mixins
// However, as the composition API will be upstream in Vue 3, this fill will be deleted

Vue.use(VueCompositionApi)
