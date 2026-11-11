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
import HelpTip from '@/components/ui/HelpTip.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import * as icons from '@/components/icons'

// розтягування textarea за власний тримач — для всіх полів CRM
installTextareaResize()

// випадний список і підказка «?» у стилі CRM — доступні в усіх шаблонах як <BaseSelect> і <HelpTip>
const app = createApp(App).component('BaseSelect', BaseSelect).component('HelpTip', HelpTip).component('PageHeader', PageHeader)

// SVG-іконки CRM доступні в усіх шаблонах за назвою: <IconRefresh />, <IconTrash /> …
Object.entries(icons).forEach(([name, component]) => app.component(name, component))

app.use(store).use(router).use(useVuelidate).use(required).use(email).use(messagePlugin).mount('#app')
