import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { installI18n } from './i18n'

const app = createApp(App)

installI18n(app)

app.mount('#app')

if (typeof window !== 'undefined') {
  const handleSmoothScroll = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null
    const link = target?.closest('a')
    if (!link) return
    const href = link.getAttribute('href') || ''
    if (!href.includes('#')) return
    if (link.target && link.target !== '_self') return

    const url = new URL(link.href, window.location.href)
    if (url.pathname !== window.location.pathname) return
    const hash = url.hash
    if (!hash) return

    const destination = document.querySelector(hash) as HTMLElement | null
    if (!destination) return

    event.preventDefault()
    destination.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  document.addEventListener('click', handleSmoothScroll)
}
