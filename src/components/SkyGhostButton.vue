<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  block?: boolean
  disabled?: boolean
  icon?: string
  tag?: 'button' | 'a'
  href?: string
  variant?: 'ghost' | 'primary' | 'danger'
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

const variantClass = computed(() => `sky-btn--${props.variant ?? 'ghost'}`)
</script>

<template>
  <component
    :is="props.tag === 'a' ? 'a' : 'button'"
    :type="props.tag === 'a' ? undefined : 'button'"
    :href="props.tag === 'a' ? props.href : undefined"
    class="sky-btn"
    :class="[variantClass, props.block && 'sky-btn--block', props.disabled && 'is-disabled']"
    :disabled="props.tag === 'a' ? undefined : props.disabled"
    @click="onClick"
  >
    <i v-if="props.icon" :class="['bi', props.icon]" aria-hidden="true"></i>
    <span class="sky-btn__label"><slot /></span>
  </component>
</template>

<style scoped>
.sky-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.85rem 1rem;
  border-radius: 25px;
  border: 1px solid transparent;
  font-weight: 800;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: transform 140ms ease, box-shadow 140ms ease, opacity 140ms ease, background 140ms ease;
  text-decoration: none;
}

.sky-btn--block {
  width: 100%;
}

.sky-btn--ghost {
  background: rgba(0, 0, 0, 0.35);
  color: #f3e5c8;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.35);
}

.sky-btn--primary {
  background: linear-gradient(135deg, rgba(81, 164, 255, 0.95), rgba(116, 203, 255, 0.85));
  color: #061324;
  border-color: rgba(148, 211, 255, 0.8);
  box-shadow: 0 20px 40px rgba(66, 140, 240, 0.35);
}

.sky-btn--danger {
  background: linear-gradient(135deg, rgba(255, 90, 116, 0.92), rgba(255, 128, 128, 0.85));
  color: #fff4f4;
  border-color: rgba(255, 164, 164, 0.75);
  box-shadow: 0 18px 36px rgba(255, 97, 97, 0.35);
}

.sky-btn:hover:not(.is-disabled) {
  transform: translateY(-2px);
  /* box-shadow: 0 18px 44px rgba(0, 0, 0, 0.4), 0 0 28px rgba(255, 255, 255, 0.45); */
}

.sky-btn:active:not(.is-disabled) {
  transform: translateY(0);
}

.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.sky-btn i {
  font-size: 1.05rem;
}
</style>
