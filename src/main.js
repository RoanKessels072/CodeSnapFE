import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { install as VueMonacoEditorPlugin } from '@guolao/vue-monaco-editor'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { initKeycloak } from "./keycloak";
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())

initKeycloak().then(() => {
    app.use(router)
    app.mount('#app')
}).catch(() => {
    app.use(router)
    app.mount('#app')
})

app.use(VueMonacoEditorPlugin, {
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs'
  }
})
