import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { install as VueMonacoEditorPlugin } from '@guolao/vue-monaco-editor'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'


import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(VueMonacoEditorPlugin, {
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs'
  }
})

app.use(createPinia())
app.use(router)

app.mount('#app')
