<script setup lang="ts">
import { computed } from 'vue'
import type { Tool } from '../models/tool'
import SkyGhostButton from './SkyGhostButton.vue'
import { useI18n } from '../i18n'

const { tool } = defineProps<{
  tool: Tool
}>()

const { t } = useI18n()

const iconMap: Record<string, string> = {
  qr: 'bi-qr-code-scan',
  sheet: 'bi-file-earmark-spreadsheet',
  star: 'bi-star-fill',
  cloud: 'bi-cloud-fill',
  music: 'bi-music-note-beamed',
}

const resolveIcon = (icon?: string) => iconMap[icon ?? 'cloud'] ?? 'bi-cloud-fill'

const rawBase = import.meta.env.BASE_URL ?? '/'
const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`
const resolveAppUrl = (path = '') => {
  if (!path) return normalizedBase
  if (path.startsWith('?') || path.startsWith('#')) {
    return `${normalizedBase}${path}`
  }
  return `${normalizedBase}${path.replace(/^\/+/u, '')}`
}

const getToolHref = (tool: Tool) => tool.externalUrl ?? resolveAppUrl(`?tool=${tool.id}`)

const handleCtaClick = (event: MouseEvent, tool: Tool) => {
  if (tool.status !== 'available') {
    return
  }
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
    return
  }
  if (tool.externalUrl) {
    return
  }
  event.preventDefault()
  if (typeof window === 'undefined') {
    return
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
  window.history.pushState({}, '', getToolHref(tool))
  window.dispatchEvent(new PopStateEvent('popstate'))
}

const displayStatus = computed(() =>
  tool.status === 'planned' ? t('tool.status.planned') : t('tool.status.available')
)

const displayName = computed(() => t(`tools.${tool.id}.name`, tool.name))

const displayDescription = computed(() => t(`tools.${tool.id}.description`, tool.description))

const displayCta = computed(() => {
  if (tool.status === 'planned') return t('tool.actions.planned')
  if (tool.externalUrl) return t('tool.actions.openExternal')
  return t('tool.actions.open')
})
</script>

<template>
  <article class="card">
    <header class="card__header">
      <div class="card__topline">
        <span class="glyph" :class="`glyph--${tool.icon ?? 'cloud'}`" aria-hidden="true">
          <i :class="['glyph__icon', 'bi', resolveIcon(tool.icon)]" aria-hidden="true"></i>
        </span>
        <p class="badge" :class="tool.status === 'planned' ? 'badge--muted' : 'badge--accent'">
          {{ displayStatus }}
        </p>
      </div>
      <h3>{{ displayName }}</h3>
      <p class="muted">{{ displayDescription }}</p>
    </header>

    <footer class="card__footer">
      <SkyGhostButton
        :disabled="tool.status === 'planned'"
        :tag="tool.status === 'available' ? 'a' : 'button'"
        :href="tool.status === 'available' ? getToolHref(tool) : undefined"
        :target="tool.externalUrl ? '_blank' : undefined"
        :rel="tool.externalUrl ? 'noopener noreferrer' : undefined"
        block
        @click="handleCtaClick($event, tool)"
      >
        {{ displayCta }}
      </SkyGhostButton>
    </footer>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.35rem;
  border-radius: 18px;
  background: linear-gradient(160deg, rgba(15, 20, 28, 0.411), rgba(10, 14, 24, 0.466));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 50px rgba(3, 6, 10, 0.7), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  overflow: hidden;
  isolation: isolate;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
  animation: riseIn 0.9s ease both;
  animation-delay: var(--card-delay, 0ms);
}

.card::before {
  content: '';
  position: absolute;
  inset: -30% auto auto -18%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle at 40% 40%, rgba(255, 214, 152, 0.12), transparent 60%);
  z-index: 0;
}

.card::after {
  content: '';
  position: absolute;
  inset: auto -28% -30% auto;
  width: 220px;
  height: 200px;
  background: radial-gradient(circle at 50% 50%, rgba(97, 196, 220, 0.16), transparent 60%);
  z-index: 0;
  filter: blur(8px);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 28px 55px rgba(3, 6, 10, 0.75);
  border-color: rgba(246, 193, 119, 0.25);
}

.card__header {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.card__topline {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.glyph {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: inline-grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(246, 193, 119, 0.14));
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 8px 18px rgba(0, 0, 0, 0.35);
}

.glyph__icon {
  font-size: 1.2rem;
  color: #f5ecd8;
}

.glyph--qr {
  background: linear-gradient(135deg, rgba(90, 166, 255, 0.22), rgba(125, 194, 255, 0.2));
}

.glyph--sheet {
  background: linear-gradient(135deg, rgba(246, 193, 119, 0.2), rgba(255, 239, 208, 0.18));
}

.glyph--star {
  background: linear-gradient(135deg, rgba(90, 166, 255, 0.24), rgba(42, 240, 199, 0.2));
}

.glyph--music {
  background: linear-gradient(135deg, rgba(255, 106, 225, 0.22), rgba(126, 208, 255, 0.2));
}


.card__header h3 {
  margin: 0.35rem 0 0.15rem;
  font-size: 1.15rem;
  color: #f5ecd8;
}

.muted {
  margin: 0;
  color: #c5d2e6;
  line-height: 1.6;
}

.badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  border: 1px solid transparent;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45);
}

.badge--accent {
  background: rgba(42, 240, 199, 0.18);
  color: #c0c7dd;
  border-color: rgba(42, 240, 199, 0.35);
}

.badge--muted {
  background: rgba(255, 255, 255, 0.08);
  color: #c0c7dd;
  border-style: dashed;
  border-color: rgba(255, 255, 255, 0.2);
}

.card__footer {
  margin-top: auto;
  display: flex;
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
