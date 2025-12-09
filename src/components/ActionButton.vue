<script setup lang="ts">
const props = defineProps<{
  icon: string
  ariaLabel?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  click: [MouseEvent]
}>()

const onClick = (e: MouseEvent) => {
  if (props.disabled) {
    e.preventDefault()
    return
  }
  emit('click', e)
}
</script>

<template>
  <button class="btn-action" :disabled="disabled" :aria-label="ariaLabel" @click="onClick">
    <i :class="['bi', icon]" aria-hidden="true"></i>
  </button>
</template>

<style scoped>
.btn-action {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: rgba(16, 22, 32, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05), 0 12px 24px rgba(0, 0, 0, 0.45);
  color: #f6e2c6;
  cursor: pointer;
  transition: transform 140ms ease, box-shadow 140ms ease, background 140ms ease;
}

.btn-action:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  background: rgba(20, 28, 40, 0.95);
}

.btn-action:active:not(:disabled) {
  transform: translateY(0);
}

.btn-action:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-action i {
  font-size: 1.4rem;
}
</style>
