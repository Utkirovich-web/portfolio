import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Self-hosted variable fonts (font-display: swap, unicode-range subsets for Latin + Cyrillic)
import '@fontsource-variable/inter'
import '@fontsource-variable/manrope'
import './styles/main.scss'

import App from './App.vue'
import router from './router'
import { i18n } from './plugins/i18n'

const app = createApp(App)

app.use(createPinia())
app.use(i18n)
app.use(router)

app.mount('#app')
