<script setup lang="ts">
import { ref, watch } from 'vue'
import skyKidRaw from '../../assets/skyKidRaw.png'
import lampRaw from '../../assets/lampRaw.png'
import SiteHeader from '../../components/SiteHeader.vue'
import SiteFooter from '../../components/SiteFooter.vue'
import SkyQrScanner from '../../components/SkyQrScanner.vue'
import SkyGhostButton from '../../components/SkyGhostButton.vue'
import SkyInput from '../../components/SkyInput.vue'
import { useMeasuringHeightViewModel } from './viewmodel/measuringHeight.ts'
import { useI18n } from '../../i18n'

const {
  qrPreview,
  qrFileName,
  isDragging,
  isImageScanning,
  qrRawInput,
  qrParseError,
  lastDecodedPayload,
  hasMeasurement,
  selectQrFromInput,
  parseQrPayload,
  resetQrSelection,
  handleDrop,
  handleDragEnter,
  handleDragLeave,
  instructionSlides,
  activeSlideIndex,
  currentSlide,
  goToPrevSlide,
  goToNextSlide,
  goToSlide,
  comparisonScale,
  bodyHeightDelta,
  finalScaleFactor,
  infoSections,
  startNewMeasurement,
} = useMeasuringHeightViewModel()

const { t } = useI18n()

const skyKidImage = skyKidRaw
const lampImage = lampRaw

const openSections = ref<Record<string, boolean>>({})
const showCameraScanner = ref(false)
const cameraError = ref('')

watch(
  infoSections,
  (sections) => {
    const nextState: Record<string, boolean> = {}
    sections.forEach((section) => {
      const existing = openSections.value[section.id]
      nextState[section.id] = typeof existing === 'boolean' ? existing : Boolean(section.defaultOpen)
    })
    openSections.value = nextState
  },
  { immediate: true }
)

function toggleSection(sectionId: string) {
  openSections.value = {
    ...openSections.value,
    [sectionId]: !openSections.value[sectionId],
  }
}

function triggerQrDecode() {
  parseQrPayload()
}

function openCameraScanner() {
  cameraError.value = ''
  showCameraScanner.value = true
}

function closeCameraScanner() {
  showCameraScanner.value = false
}

function handleCameraDecoded(payload: string) {
  cameraError.value = ''
  qrRawInput.value = payload
  parseQrPayload(payload)
  showCameraScanner.value = false
}

function handleCameraError(message: string) {
  cameraError.value = message
}

function handleStartNewMeasurement() {
  showCameraScanner.value = false
  cameraError.value = ''
  startNewMeasurement()
}
</script>

<template>
  <main class="measure-page">
    <div class="measure-glow measure-glow--sun" aria-hidden="true"></div>
    <div class="measure-glow measure-glow--moon" aria-hidden="true"></div>
    <div class="measure-glow measure-glow--horizon" aria-hidden="true"></div>

    <SiteHeader class="measure-page__header" />

    <header class="measure-hero">
      <div class="measure-hero__content">
        <h1 class="measure-hero__title">{{ t('measure.hero.title') }}</h1>
        <p class="measure-hero__lede">
          {{ t('measure.hero.lede') }}
        </p>
      </div>
    </header>

    <section v-if="!hasMeasurement" class="panel upload" id="upload">
      <header class="panel__header">
        <div>
          <h1>{{ t('measure.upload.title') }}</h1>
          <p class="panel__lede">
            {{ t('measure.upload.hint') }}
          </p>
        </div>
      </header>

      <div class="upload__grid">
        <div class="upload__primary">
          <div class="upload__card upload__card--dropzone">
            <div
              class="upload__dropzone"
              :class="{ 'upload__dropzone--active': isDragging }"
              @dragenter.prevent="handleDragEnter"
              @dragover.prevent
              @dragleave.prevent="handleDragLeave"
              @drop.prevent="handleDrop"
            >
              <label class="dropzone__label" for="qr-input">
                <input id="qr-input" type="file" accept="image/*" class="sr-only" @change="selectQrFromInput" />
                <div class="dropzone__state" v-if="!qrPreview">
                  <p class="dropzone__title">{{ t('measure.upload.dropTitle') }}</p>
                  <p class="dropzone__hint">{{ t('measure.upload.dropHint') }}</p>
                </div>
                <div v-else class="dropzone__preview">
                  <img :src="qrPreview" alt="QR preview" />
                  <div class="dropzone__meta">
                    <p class="dropzone__filename">{{ qrFileName }}</p>
                    <SkyGhostButton
                      variant="danger"
                      block
                      @click.stop.prevent="resetQrSelection"
                    >
                      {{ t('measure.upload.delete') }}
                    </SkyGhostButton>
                  </div>
                </div>
              </label>
            </div>
            <p v-if="isImageScanning" class="upload__status">{{ t('measure.upload.scanning') }}</p>
          </div>
        </div>

        <div class="upload__secondary">
          <div class="qr-manual upload__card">
            <div class="qr-manual__intro">
              <p class="qr-manual__title">{{ t('measure.upload.manualTitle') }}</p>
              <p class="qr-manual__hint">{{ t('measure.upload.manualHint') }}</p>
            </div>
            <textarea
              class="qr-manual__textarea"
              rows="3"
              v-model="qrRawInput"
              placeholder="https://sky.thatg.co/o=..."
            ></textarea>
            <div class="qr-manual__footer">
              <SkyGhostButton block @click="triggerQrDecode">{{ t('measure.upload.decode') }}</SkyGhostButton>
              <p v-if="lastDecodedPayload" class="qr-manual__status">
                Scale {{ lastDecodedPayload.scale.toFixed(5) }} · Height {{ lastDecodedPayload.height.toFixed(4) }}
              </p>
              <p v-else-if="qrParseError" class="qr-manual__status qr-manual__status--error">
                {{ qrParseError }}
              </p>
              <p v-else class="qr-manual__status qr-manual__status--muted">{{ t('measure.upload.statusEmpty') }}</p>
            </div>
          </div>

          <div class="qr-camera upload__card">
            <div>
              <p class="qr-camera__title">{{ t('measure.upload.cameraTitle') }}</p>
              <p class="qr-camera__hint">{{ t('measure.upload.cameraHint') }}</p>
            </div>
            <SkyGhostButton block @click="openCameraScanner">{{ t('measure.upload.openCamera') }}</SkyGhostButton>
          </div>
        </div>
      </div>
    </section>

    <section v-if="!hasMeasurement" class="panel instructions" id="instructions">
      <header class="panel__header">
        <div>
          <h2>{{ t('measure.instructions.title') }}</h2>
        </div>
      </header>

      <article class="slide">
        <div class="slide__media">
          <img
            v-if="currentSlide.imageSrc"
            class="slide__image"
            :src="currentSlide.imageSrc"
            :alt="currentSlide.imageAlt || currentSlide.title"
            loading="lazy"
          />
          <div v-else class="slide__placeholder">
            <span>{{ t('measure.instructions.noImage') }} ({{ currentSlide.placeholderLabel }})</span>
          </div>
        </div>
        <div class="slide__content">
          <p class="slide__step">{{ currentSlide.step }}</p>
          <h3>{{ currentSlide.title }}</h3>
          <p>{{ currentSlide.description }}</p>
        </div>
      </article>

      <div class="slide__nav">
        <SkyGhostButton icon="bi-arrow-left" @click="goToPrevSlide">{{ t('measure.instructions.prev') }}</SkyGhostButton>
        <div class="slide__dots">
          <button
            v-for="(slide, index) in instructionSlides"
            :key="slide.id"
            type="button"
            class="dot"
            :class="{ 'dot--active': index === activeSlideIndex }"
            @click="goToSlide(index)"
          ></button>
        </div>
        <SkyGhostButton icon="bi-arrow-right" @click="goToNextSlide">{{ t('measure.instructions.next') }}</SkyGhostButton>
      </div>
    </section>

    <div v-if="hasMeasurement" class="measurement-actions">
      <SkyGhostButton icon="bi-arrow-repeat" @click="handleStartNewMeasurement">
        {{ t('measure.actions.newMeasurement') }}
      </SkyGhostButton>
    </div>

    <div v-if="hasMeasurement" class="panel-grid">
      <section class="panel comparison" id="comparison">
        <header class="panel__header">
          <div>
            <h2>{{ t('measure.comparison.title') }}</h2>
            <p class="panel__lede">
            </p>
          </div>
        </header>

        <div class="comparison__stage">
          <div
            class="comparison__figure comparison__figure--skykid"
            :style="{ '--skykid-scale': finalScaleFactor * 0.7 }"
          >
            <img class="comparison__image comparison__image--skykid" :src="skyKidImage" alt="Sky Kid đối chiếu" />
            <div class="comparison__shadow"></div>
          </div>
          <div class="comparison__figure comparison__figure--lamp">
            <img class="comparison__image comparison__image--lamp" :src="lampImage" alt="Lamp chuẩn" />
            <div class="comparison__shadow"></div>
          </div>
        </div>

        <div class="comparison__controls">
          <div class="control">
            <p class="control__label">{{ t('measure.comparison.scale') }}</p>
            <div class="scale-control">
              <SkyInput
                v-model.number="comparisonScale"
                type="number"
                icon="bi-rulers"
                placeholder="-0.02"
                inputmode="decimal"
                step="0.01"
                min="-10"
                max="3"
                size="sm"
              />
            </div>
          </div>

          <div class="control">
            <p class="control__label">{{ t('measure.comparison.height') }}</p>
            <div class="scale-control">
              <SkyInput
                v-model.number="bodyHeightDelta"
                type="number"
                icon="bi-arrows-expand"
                placeholder="123.45"
                inputmode="decimal"
                step="0.1"
                min="-2000"
                max="2000"
                size="sm"
              />
            </div>
          </div>
        </div>
      </section>

      <section class="panel metrics" id="metrics">
        <header class="panel__header">
          <div>
            <h2>{{ t('measure.metrics.title') }}</h2>
            <p class="panel__lede"></p>
          </div>
        </header>
        <div class="info-accordion">
          <section v-for="section in infoSections" :key="section.id" class="info-section">
            <button type="button" class="info-section__header" @click="toggleSection(section.id)">
              <span>{{ section.title }}</span>
              <span class="info-section__chevron">{{ openSections[section.id] ? '−' : '+' }}</span>
            </button>
            <div class="info-section__body" v-show="openSections[section.id]">
              <ul class="info-grid">
                <li v-for="metric in section.metrics" :key="metric.id">
                  <p class="info-label">{{ metric.label }}</p>
                  <p class="info-value">{{ metric.value }}</p>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </section>
    </div>

    <section class="panel respect">
      <header class="panel__header">
        <div>
          <h2>{{ t('measure.respect.title') }}</h2>
          <p class="panel__lede">
            {{ t('measure.respect.description') }}
          </p>
        </div>
      </header>
      <div class="respect__links">
        <a href="https://skykidheight.com/" target="_blank" rel="noopener noreferrer" class="respect__link">
          {{ t('measure.respect.linkSkyKidHeight') }}
        </a>
        <a href="https://dream10325.github.io/sky-cotl-height-tool/" target="_blank" rel="noopener noreferrer" class="respect__link">
          {{ t('measure.respect.linkCotlHeight') }}
        </a>
      </div>
    </section>
  </main>

  <SiteFooter />

  <teleport to="body">
    <div v-if="showCameraScanner" class="qr-scanner-modal">
      <div class="qr-scanner-modal__backdrop" @click="closeCameraScanner"></div>
      <div class="qr-scanner-modal__content">
        <SkyQrScanner @decoded="handleCameraDecoded" @close="closeCameraScanner" @error="handleCameraError" />
        <p v-if="cameraError" class="qr-scanner-modal__error">{{ cameraError }}</p>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.measure-page {
  position: relative;
  min-height: 100vh;
  padding: clamp(1.5rem, 2vw + 1rem, 3rem);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  color: #f5f7ff;
  font-family: 'Work Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  overflow: hidden;
}

.measure-hero {
  position: relative;
  z-index: 1;
}

.measure-hero__content {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.measure-hero__kicker {
  margin: 0;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 800;
  color: #7ed0ff;
  font-size: 0.85rem;
}

.measure-hero__title {
  margin: 0;
  font-size: clamp(1.6rem, 1.3rem + 0.8vw, 2.1rem);
  font-weight: 800;
  color: #f5ecd8;
  letter-spacing: -0.01em;
}

.measure-hero__lede {
  margin: 0;
  color: #c5d2e6;
  max-width: 620px;
}

.measure-page__header {
  position: relative;
  z-index: 2;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.measure-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(10px);
  opacity: 0.6;
  pointer-events: none;
  z-index: 0;
}

.measure-glow--sun {
  top: -8%;
  right: -4%;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(255, 198, 152, 0.4), transparent 60%);
}

.measure-glow--moon {
  top: 35%;
  left: -12%;
  width: 380px;
  height: 380px;
  background: radial-gradient(circle, rgba(122, 173, 255, 0.35), transparent 60%);
}

.measure-glow--horizon {
  bottom: -10%;
  right: 10%;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(44, 234, 198, 0.3), transparent 70%);
}

.panel {
  position: relative;
  z-index: 1;
  border-radius: 28px;
  padding: clamp(1.25rem, 1rem + 1vw, 2rem);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 25px 50px rgba(3, 6, 12, 0.6);
  backdrop-filter: blur(18px);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.panel__header {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.panel__lede {
  margin: 0;
  color: #c6d3ea;
  max-width: 720px;
}


.upload__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(240px, 1fr);
  gap: 1.25rem;
  align-items: start;
}

.upload__primary,
.upload__secondary {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.upload__primary {
  height: 100%;
}

.upload__card {
  padding: 1.15rem;
  border-radius: 24px;
  background: rgba(9, 18, 32, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.upload__card--dropzone {
  padding: 1.6rem;
  gap: 1rem;
  height: 100%;
}

.upload__dropzone {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: clamp(1rem, 0.8vw + 0.8rem, 2rem);
  text-align: center;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.upload__dropzone--active {
  border-color: #8bd5ff;
  background: rgba(139, 213, 255, 0.08);
}

.dropzone__label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
}

.dropzone__title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.dropzone__hint {
  margin: 0;
  color: #a7b7d3;
}


.dropzone__preview {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
}

.dropzone__preview img {
  width: min(320px, 80vw);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
}

.dropzone__meta {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: center;
}

.dropzone__filename {
  margin: 0;
  font-weight: 600;
}

.upload__status {
  margin: 0.6rem 0 0;
  font-size: 0.9rem;
  color: #a7b7d3;
}

.qr-manual {
  gap: 0.75rem;
}

.qr-manual__title {
  margin: 0;
  font-weight: 600;
  color: #f5f7ff;
}

.qr-manual__hint {
  margin: 0.15rem 0 0;
  color: #a7b7d3;
  font-size: 0.9rem;
}

.qr-manual__textarea {
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(7, 12, 20, 0.85);
  color: #f5f7ff;
  padding: 0.85rem 1rem;
  resize: vertical;
  font: inherit;
}

.qr-manual__textarea::placeholder {
  color: #7382a2;
}

.qr-manual__footer {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.qr-manual__status {
  margin: 0;
  font-size: 0.9rem;
  color: #cdd8f4;
}

.qr-manual__status--error {
  color: #ff9b9b;
}

.qr-manual__status--muted {
  color: #6b7694;
}

.qr-camera {
  gap: 0.6rem;
}

.qr-camera__title {
  margin: 0;
  font-weight: 600;
  color: #f5f7ff;
}

.qr-camera__hint {
  margin: 0.15rem 0 0;
  color: #a7b7d3;
  font-size: 0.9rem;
}

.qr-scanner-modal {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-scanner-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(4, 6, 10, 0.85);
  backdrop-filter: blur(6px);
}

.qr-scanner-modal__content {
  position: relative;
  z-index: 1;
  padding: 1.5rem;
  border-radius: 28px;
  background: rgba(6, 12, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.75);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.qr-scanner-modal__error {
  margin: 0;
  text-align: center;
  color: #ff9b9b;
  font-size: 0.9rem;
}

.instructions .slide {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  align-items: center;
}

.slide__media {
  width: 100%;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide__image {
  width: 100%;
  height: clamp(220px, 30vw, 360px);
  object-fit: contain;
  object-position: center;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.05), transparent 70%);
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
}

.slide__placeholder {
  width: 100%;
  height: 100%;
  border-radius: 22px;
  background: repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08) 12px, transparent 12px, transparent 24px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aab6d1;
  font-weight: 600;
}

.slide__content h3 {
  margin: 0.2rem 0;
}

.slide__step {
  margin: 0;
  font-size: 0.9rem;
  color: #aab6d1;
}

.slide__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.slide__dots {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
}

.dot--active {
  background: #f6d0a7;
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.measurement-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}


.comparison__stage {
  position: relative;
  width: min(440px, 100%);
  margin-inline: auto;
  height: clamp(280px, 35vw, 360px);
  padding: 0 clamp(0.1rem, 1.5vw, 0.5rem);
  overflow: visible;
  --figure-gap: clamp(-2.4rem, -3.2vw, -1.4rem);
}

.comparison__figure {
  position: absolute;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 0.4rem;
  height: 100%;
}

.comparison__figure--skykid {
  --skykid-scale: 1;
  left: 50%;
  transform: translateX(calc(-100% - var(--figure-gap)));
  align-items: flex-start;
}

.comparison__image {
  max-height: 100%;
  width: auto;
  object-fit: contain;
  opacity: 0.92;
  filter: brightness(0) saturate(100%) invert(96%) sepia(6%) saturate(642%) hue-rotate(319deg) brightness(108%) contrast(96%) drop-shadow(0 18px 40px rgba(0, 0, 0, 0.55));
  transition: transform 0.2s ease, filter 0.2s ease;
}

.comparison__image--skykid {
  transform: scale(var(--skykid-scale, 1));
  transform-origin: bottom center;
}

.comparison__image--lamp {
  filter: brightness(0) saturate(100%) invert(86%) sepia(8%) saturate(1056%) hue-rotate(180deg) brightness(108%) contrast(93%) drop-shadow(0 18px 40px rgba(0, 0, 0, 0.55));
}

.comparison__shadow {
  width: 140px;
  height: 14px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  filter: blur(8px);
  margin-top: 0.5rem;
}

.comparison__figure--lamp {
  left: 50%;
  transform: translateX(var(--figure-gap));
  align-items: flex-end;
}

.comparison__figure--lamp .comparison__image {
  width: clamp(120px, 14vw, 200px);
}

.lamp__height {
  margin: 0.4rem 0 0;
  font-size: 0.9rem;
  color: #a7b7d3;
}

.comparison__controls {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.control {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.control__label {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #cdd6ef;
}

.scale-control {
  display: flex;
  align-items: stretch;
  width: min(220px, 100%);
}

.final-factor {
  margin: 0.2rem 0 0;
  font-weight: 600;
  color: #f5ecd8;
}

.comparison__extremes {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.8rem;
}

.extreme-card {
  border-radius: 18px;
  padding: 0.9rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.extreme-label {
  margin: 0;
  font-size: 0.85rem;
  color: #c5d2eb;
}

.extreme-value {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: #fff7ed;
}

.extreme-meta {
  margin: 0;
  font-size: 0.9rem;
  color: #aab6d1;
}

.info-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.info-grid li {
  padding: 1rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.info-accordion {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-section {
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 15, 24, 0.65);
  overflow: hidden;
}

.info-section__header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.1rem;
  background: transparent;
  border: none;
  color: #f5f7ff;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
}

.info-section__chevron {
  font-size: 1.4rem;
  line-height: 1;
  color: #f5ecd8;
}

.info-section__body {
  padding: 0 1.1rem 1.1rem;
}

.info-label {
  margin: 0;
  color: #aab6d1;
  font-size: 0.85rem;
}

.info-value {
  margin: 0.3rem 0 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff7ed;
}

.respect {
  align-self: stretch;
}

.respect__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.respect__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f6f8ff;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.16s ease, border-color 0.16s ease, background-color 0.16s ease;
}

.respect__link:hover {
  transform: translateY(-1px);
  border-color: rgba(124, 208, 255, 0.5);
  background: rgba(255, 255, 255, 0.12);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@media (max-width: 720px) {
  .measure-page {
    padding: 1rem;
  }

  .panel {
    padding: 1rem;
  }

  .upload__grid {
    grid-template-columns: 1fr;
  }

  .slide__image {
    height: auto;
    max-height: none;
  }
}
</style>
