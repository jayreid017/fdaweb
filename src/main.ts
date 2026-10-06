import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { initAuth } from './services/authService'

// Initialize Supabase Auth early so recovery tokens and sessions are captured
initAuth();

const app = createApp(App)
app.use(router)
app.mount('#app')
