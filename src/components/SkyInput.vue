<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  modelValue: string | number | null
  placeholder?: string
  icon?: string
  type?: string
  block?: boolean
  hideIcon?: boolean
  size?: 'default' | 'sm'
  modelModifiers?: { number?: boolean }
}>()

const emit = defineEmits<{
  'update:modelValue': [string | number | null]
}>()

const attrs = useAttrs()

const resolvedType = computed(() => props.type ?? 'text')
const showIcon = computed(() => !props.hideIcon)
const resolvedIcon = computed(() => props.icon ?? 'bi-sliders')
const displayValue = computed(() => (props.modelValue ?? '').toString())

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let nextValue: string | number | null = target.value
  const shouldNumber = props.modelModifiers?.number || resolvedType.value === 'number'

  if (shouldNumber) {
    if (target.value === '') {
      nextValue = null
    } else {
      const parsed = Number(target.value)
      nextValue = Number.isNaN(parsed) ? null : parsed
    }
  }

  emit('update:modelValue', nextValue)
}
</script>

<template>
  <label
    class="sky-input"
    :class="[
      props.block && 'sky-input--block',
      props.hideIcon && 'sky-input--iconless',
      props.size === 'sm' && 'sky-input--small'
    ]"
  >
    <span v-if="showIcon" class="sky-input__icon">
      <i :class="['bi', resolvedIcon]" aria-hidden="true"></i>
    </span>
    <input
      v-bind="attrs"
      :value="displayValue"
      :type="resolvedType"
      :placeholder="props.placeholder"
      @input="onInput"
    />
  </label>
</template>

<style scoped>
.sky-input {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.7rem;
  border-radius: 32px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.3);
  width: 100%;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.sky-input--block {
  width: 100%;
}

.sky-input__icon {
  width: 32px;
  height: 32px;
  border-radius: 50px;
  background: rgba(0, 0, 0, 0.4);
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #f5e2c6;
}

.sky-input__icon i {
  font-size: 1.05rem;
}

.sky-input--iconless {
  grid-template-columns: 1fr;
  padding-left: 0.95rem;
  padding-right: 0.95rem;
}

.sky-input input {
  background: transparent;
  border: none;
  outline: none;
  color: #e9edf7;
  font-weight: 700;
  font-size: 1rem;
  width: 100%;
  padding: 0;
}

.sky-input input:focus-visible {
  outline: none;
}

.sky-input:focus-within {
  border-color: rgba(136, 196, 255, 0.65);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.35), 0 0 0 2px rgba(84, 164, 255, 0.25);
}

.sky-input--small {
  padding: 0.35rem 0.55rem;
  gap: 0.4rem;
  border-radius: 24px;
}

.sky-input--small .sky-input__icon {
  width: 26px;
  height: 26px;
  font-size: 0.9rem;
}

.sky-input--small input {
  font-size: 0.85rem;
  font-weight: 600;
}

.sky-input input::placeholder {
  color: #8fa2bf;
  font-weight: 600;
}
</style>
