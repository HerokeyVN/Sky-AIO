<script setup lang="ts">
import { ref } from 'vue'
import SkyInput from './SkyInput.vue'
import SkyGhostButton from './SkyGhostButton.vue'

const nickname = ref('')
const randomNames = ['Skylark', 'Sunwhisper', 'Dawnglow', 'Cloudstep', 'Starlit', 'Aurora', 'Kite', 'Halo']

const randomizeNickname = () => {
  const pick = randomNames[Math.floor(Math.random() * randomNames.length)] ?? ''
  nickname.value = pick
}

const confirmNickname = () => {
  if (!nickname.value.trim()) return
  // Demo only: real flow would submit the name.
  console.log('Nickname confirmed:', nickname.value.trim())
}
</script>

<template>
  <div class="nickname-panel">
    <div class="nickname-panel__bg" aria-hidden="true"></div>
    <div class="nickname-panel__glass">
      <header class="nickname-panel__header">
        <div class="nickname-panel__title">
          <p class="label">Nickname</p>
          <span class="line"></span>
        </div>
        <button class="close-btn" aria-label="Đóng">
          <span>&times;</span>
        </button>
      </header>

      <SkyInput v-model="nickname" icon="bi-pencil-fill" placeholder="Enter a nickname" />

      <div class="nickname-panel__actions">
        <SkyGhostButton icon="bi-arrow-repeat" @click="randomizeNickname">Random</SkyGhostButton>
        <SkyGhostButton icon="bi-check2" :disabled="!nickname.trim()" @click="confirmNickname">
          Confirm
        </SkyGhostButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nickname-panel {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0));
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
}

.nickname-panel__bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(255, 214, 152, 0.15), transparent 45%),
    radial-gradient(circle at 75% 30%, rgba(117, 186, 255, 0.18), transparent 55%),
    linear-gradient(180deg, rgba(10, 15, 24, 0.9), rgba(10, 15, 24, 0.8));
  filter: blur(2px);
  z-index: 0;
}

.nickname-panel__glass {
  position: relative;
  z-index: 1;
  border-radius: 16px;
  padding: 1.1rem 1rem 1.2rem;
  background: rgba(10, 15, 24, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.nickname-panel__header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.nickname-panel__title {
  flex: 1;
  display: grid;
  gap: 0.25rem;
}

.nickname-panel .label {
  margin: 0;
  font-weight: 800;
  letter-spacing: 0.01em;
  font-size: 1rem;
  color: #f5ecd8;
}

.line {
  height: 2px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.38), rgba(255, 255, 255, 0.05));
  border-radius: 999px;
}

.close-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #f5ecd8;
  font-size: 1.2rem;
  display: grid;
  place-items: center;
  cursor: default;
}

.nickname-panel__actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.6rem;
}

/* button/input styles now come from SkyGhostButton & SkyInput */

@media (max-width: 640px) {
  .nickname-panel__actions {
    grid-template-columns: 1fr;
  }
}
</style>
