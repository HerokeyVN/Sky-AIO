<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { toolService } from '../services/toolService'
import { useI18n, type LocaleKey } from '../i18n'
import logo from '../assets/logo.png'

const rawBase = import.meta.env.BASE_URL ?? '/'
const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`
const resolveAppUrl = (path = '') => {
  if (!path) return normalizedBase
  if (path.startsWith('?') || path.startsWith('#')) {
    return `${normalizedBase}${path}`
  }
  return `${normalizedBase}${path.replace(/^\/+/u, '')}`
}

const primaryNav = [
  { id: 'about', labelKey: 'header.about', target: '#about' },
  { id: 'requests', labelKey: 'header.feedback', href: 'https://forms.gle/', external: true },
]

const toolLinks = computed(() =>
  toolService
    .getTools()
    .filter((tool) => tool.status !== 'planned')
    .map((tool) => ({
      id: tool.id,
      label: t(`tools.${tool.id}.name`, tool.name),
      href: tool.externalUrl ?? resolveAppUrl(`?tool=${tool.id}`),
      external: Boolean(tool.externalUrl),
    }))
)

const isToolsOpen = ref(false)
const toolsDropdownRef = ref<HTMLElement | null>(null)
const toolsTriggerRef = ref<HTMLElement | null>(null)
const { t, locale, setLocale, availableLocales } = useI18n()
const selectedLocale = computed(() => locale.value)
const isNavOpen = ref(false)

function handleToolLink(event: MouseEvent, href: string) {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
    return
  }
  event.preventDefault()
  if (typeof window === 'undefined') {
    return
  }
  window.history.pushState({}, '', href)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function onToolClick(event: MouseEvent, href: string) {
  handleToolLink(event, href)
  isToolsOpen.value = false
  isNavOpen.value = false
}

function toggleToolsDropdown() {
  isToolsOpen.value = !isToolsOpen.value
}

const closeDropdownOnOutsideClick = (event: MouseEvent) => {
  if (!isToolsOpen.value) return
  const target = event.target as Node | null
  if (toolsDropdownRef.value?.contains(target) || toolsTriggerRef.value?.contains(target)) return
  isToolsOpen.value = false
}

const closeDropdownOnEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isToolsOpen.value = false
    isNavOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdownOnOutsideClick)
  document.addEventListener('keydown', closeDropdownOnEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdownOnOutsideClick)
  document.removeEventListener('keydown', closeDropdownOnEscape)
})

function onLocaleChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as LocaleKey
  if (value) {
    setLocale(value)
    isNavOpen.value = false
  }
}

function toggleNav() {
  isNavOpen.value = !isNavOpen.value
}

function closeNav() {
  isNavOpen.value = false
}
</script>

<template>
  <header class="site-header">
    <div class="site-header__bar">
      <a :href="resolveAppUrl()" class="brand">
        <img class="brand__logo" :src="logo" alt="Sky Tools AIO logo" />
        <span class="brand__text">Sky Tools AIO</span>
      </a>
      <button class="menu-toggle" type="button" aria-label="Toggle menu" @click="toggleNav">
        <span class="menu-toggle__line"></span>
        <span class="menu-toggle__line"></span>
        <span class="menu-toggle__line"></span>
      </button>
      <nav class="menu" :class="{ 'menu--open': isNavOpen }" aria-label="Chuyển nhanh">
        <div class="menu__group menu__group--primary">
          <a
            v-for="item in primaryNav"
            :key="item.id"
            class="menu__link"
            :href="item.external ? item.href : resolveAppUrl(item.target ?? '')"
            :target="item.external ? '_blank' : undefined"
            :rel="item.external ? 'noopener noreferrer' : undefined"
            @click="closeNav"
          >
            {{ t(item.labelKey, item.labelKey) }}
          </a>
        </div>
        <div v-if="toolLinks.length" class="menu__dropdown" aria-label="Liên kết công cụ">
          <button
            ref="toolsTriggerRef"
            type="button"
            class="menu__trigger"
            :aria-expanded="isToolsOpen"
            @click="toggleToolsDropdown"
          >
            <span class="menu__trigger-label">{{ t('header.tools') }}</span>
            <span class="menu__chevron" aria-hidden="true"></span>
          </button>
          <Transition name="fade-scale">
            <div v-show="isToolsOpen" ref="toolsDropdownRef" class="menu__popover">
              <div class="menu__list">
                <a
                  v-for="tool in toolLinks"
                  :key="tool.id"
                  class="menu__option"
                  :href="tool.href"
                  :target="tool.external ? '_blank' : undefined"
                  :rel="tool.external ? 'noopener noreferrer' : undefined"
                  @click="tool.external ? undefined : onToolClick($event, tool.href)"
                >
                  {{ tool.label }}
                </a>
              </div>
            </div>
          </Transition>
        </div>
        <label class="lang-select">
          <span class="lang-select__label">{{ t('header.language') }}</span>
          <select :value="selectedLocale" @change="onLocaleChange">
            <option v-for="code in availableLocales" :key="code" :value="code">
              {{ code.toUpperCase() }}
            </option>
          </select>
        </label>
      </nav>
    </div>
    <div class="nav-overlay" :class="{ 'nav-overlay--open': isNavOpen }" @click="closeNav"></div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 30;
  padding: 0.25rem 0 0.6rem;
}

.site-header__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 0.4rem 0.2rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #f5ecd8;
}

.brand__logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.menu {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.menu__group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.menu__link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.4rem;
  border-radius: 10px;
  font-weight: 700;
  color: #f5f1e7;
  text-decoration: none;
  letter-spacing: 0.01em;
  background: transparent;
  border: none;
  transition: color 0.2s ease;
}

.menu__link:hover {
  color: #ffffff;
}

.menu__dropdown {
  position: relative;
}

.menu__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.45rem 0.2rem 0.45rem 0.4rem;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #f5f1e7;
  font-weight: 800;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: color 0.18s ease;
}

.menu__trigger:hover {
  color: #ffffff;
}

.menu__trigger:focus-visible {
  outline: 2px solid rgba(90, 166, 255, 0.7);
  outline-offset: 4px;
}

.menu__pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.8rem;
  height: 1.4rem;
  padding: 0 0.35rem;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 700;
}

.menu__chevron {
  display: inline-block;
  width: 0.6rem;
  height: 0.6rem;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg);
  transition: transform 0.18s ease;
}

.menu__trigger[aria-expanded='true'] .menu__chevron {
  transform: rotate(225deg);
}

.menu__popover {
  position: absolute;
  top: calc(100% + 0.45rem);
  right: 0;
  min-width: 220px;
  padding: 0.3rem 0.45rem;
  border-radius: 10px;
  background: rgba(11, 16, 25, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
}

.menu__list {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.menu__option {
  display: block;
  padding: 0.45rem 0.35rem;
  border-radius: 8px;
  color: #e9edf7;
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 0.01em;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.menu__option:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.06);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
  transform-origin: 90% 0%;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

.fade-scale-enter-to,
.fade-scale-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.lang-select {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #f6f8ff;
  font-weight: 700;
}

.lang-select__label {
  font-size: 0.9rem;
  letter-spacing: 0.02em;
}

.lang-select select {
  background: transparent;
  border: none;
  color: #f6f8ff;
  font-weight: 800;
  letter-spacing: 0.04em;
  padding: 0.25rem 0.35rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  cursor: pointer;
}

.lang-select select:focus {
  outline: none;
}

.lang-select select option {
  color: #0a0b10;
  background: #f6f8ff;
  font-weight: 700;
}

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  padding: 0.4rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  cursor: pointer;
}

.menu-toggle__line {
  width: 20px;
  height: 2px;
  background: #f6f8ff;
  border-radius: 999px;
}

.nav-overlay {
  display: none;
}

@media (max-width: 768px) {
  .site-header {
    position: static;
    padding-top: 0;
  }

  .site-header__bar {
    align-items: center;
  }

  .menu-toggle {
    display: inline-flex;
  }

  .menu {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(280px, 80vw);
    padding: 1.2rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    background: rgba(6, 10, 18, 0.94);
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: -18px 0 40px rgba(0, 0, 0, 0.5);
    transform: translateX(100%);
    transition: transform 0.2s ease;
    z-index: 40;
  }

  .menu--open {
    transform: translateX(0);
  }

  .menu__group {
    flex-direction: column;
    align-items: flex-start;
  }

  .menu__dropdown {
    width: 100%;
  }

  .menu__popover {
    position: static;
    width: 100%;
    box-shadow: none;
  }

  .lang-select {
    width: 100%;
  }

  .nav-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 30;
  }

  .nav-overlay--open {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
