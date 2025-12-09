<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, type Component } from 'vue'
import LandingPage from './views/landingPage/index.vue'
import MeasuringHeightTool from './views/measuringHeightTool/index.vue'

type RouteState = {
  view: 'landing' | 'tool'
  toolId?: string
}

const toolViews: Record<string, Component> = {
  'qr-height': MeasuringHeightTool,
}

const currentRoute = ref<RouteState>({ view: 'landing' })

const syncRouteFromUrl = () => {
  if (typeof window === 'undefined') {
    return
  }
  const params = new URLSearchParams(window.location.search)
  const toolId = params.get('tool')
  if (toolId && toolViews[toolId]) {
    currentRoute.value = { view: 'tool', toolId }
  } else {
    currentRoute.value = { view: 'landing' }
  }
}

onMounted(() => {
  syncRouteFromUrl()
  window.addEventListener('popstate', syncRouteFromUrl)
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', syncRouteFromUrl)
})

const activeToolComponent = computed(() => {
  if (currentRoute.value.view === 'tool' && currentRoute.value.toolId) {
    return toolViews[currentRoute.value.toolId]
  }
  return null
})
</script>

<template>
  <LandingPage v-if="currentRoute.view === 'landing'" />
  <component v-else-if="activeToolComponent" :is="activeToolComponent" />
  <LandingPage v-else />
</template>
