import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import { reveal } from './directives/reveal.js'
import './style.css'
import { config } from './config/index.js'

document.documentElement.style.setProperty('--app-font-size', `${config.typography.fontSize}px`)
document.documentElement.style.setProperty('--font-display', config.typography.fontFamily)
document.documentElement.style.setProperty('--font-body', config.typography.fontFamily)

const app = createApp(App)
app.use(router)
app.directive('reveal', reveal)
app.mount('#app')
