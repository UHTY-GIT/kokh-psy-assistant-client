import { createApp } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import messagePlugin from "@/utils/message.plugin";
import 'materialize-css/dist/js/materialize.min'
import { installTextareaResize } from '@/utils/textareaResize'
import BaseSelect from '@/components/ui/BaseSelect.vue'

// розтягування textarea за власний тримач — для всіх полів CRM
installTextareaResize()

// випадний список у стилі CRM — доступні в усіх шаблонах як <BaseSelect>
createApp(App).component('BaseSelect', BaseSelect).use(store).use(router).use(useVuelidate).use(required).use(email).use(messagePlugin).mount('#app')
