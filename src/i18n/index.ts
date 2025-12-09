import type { App, ComputedRef } from 'vue'
import { computed, inject, reactive } from 'vue'
import en from './locales/en'
import vi from './locales/vi'

export type LocaleKey = 'en' | 'vi'

const messages: Record<LocaleKey, Record<string, any>> = {
  en,
  vi,
}

type I18nContext = {
  locale: ComputedRef<LocaleKey>
  availableLocales: LocaleKey[]
  setLocale: (locale: LocaleKey) => void
  t: (key: string, fallback?: string) => string
}

const I18N_SYMBOL = Symbol('i18n')

const getUrlLocale = (): LocaleKey | null => {
  if (typeof window === 'undefined') return null
  const lang = new URLSearchParams(window.location.search).get('lang')
  if (lang && (lang as LocaleKey) in messages) {
    return lang as LocaleKey
  }
  return null
}

const updateUrlLocale = (locale: LocaleKey) => {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set('lang', locale)
  window.history.replaceState({}, '', url.toString())
}

function resolvePath(locale: LocaleKey, path: string) {
  return path.split('.').reduce((acc: any, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), messages[locale])
}

function createI18n() {
  const urlLocale = getUrlLocale()
  const stored = typeof localStorage !== 'undefined' ? (localStorage.getItem('locale') as LocaleKey | null) : null
  const defaultLocale: LocaleKey = (urlLocale && urlLocale in messages
    ? urlLocale
    : stored && stored in messages
      ? stored
      : 'vi')

  const state = reactive({
    locale: defaultLocale as LocaleKey,
  })

  const setLocale = (locale: LocaleKey) => {
    if (!(locale in messages)) return
    state.locale = locale
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('locale', locale)
    }
    updateUrlLocale(locale)
  }

  const t = (key: string, fallback?: string) => {
    const primary = resolvePath(state.locale, key)
    if (primary !== undefined) return primary as string
    const backupLocale: LocaleKey = state.locale === 'en' ? 'vi' : 'en'
    const backup = resolvePath(backupLocale, key)
    if (backup !== undefined) return backup as string
    return fallback ?? key
  }

  return {
    locale: computed(() => state.locale),
    availableLocales: Object.keys(messages) as LocaleKey[],
    setLocale,
    t,
  }
}

export function installI18n(app: App) {
  const i18n = createI18n()
  app.provide(I18N_SYMBOL, i18n)
}

export function useI18n(): I18nContext {
  const ctx = inject<I18nContext>(I18N_SYMBOL)
  if (!ctx) {
    throw new Error('i18n context is not provided')
  }
  return ctx
}
