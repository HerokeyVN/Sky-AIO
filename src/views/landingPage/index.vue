<script setup lang="ts">
import ToolCard from '../../components/ToolCard.vue'
import SiteHeader from '../../components/SiteHeader.vue'
import SiteFooter from '../../components/SiteFooter.vue'
import { useLandingPageViewModel } from './viewmodels/landingPage.viewmodel'

const { intro, toolbox, tools } = useLandingPageViewModel()
</script>

<template>
  <main id="top" class="landing-page">
    <div class="sky-glow sky-glow--sun" aria-hidden="true"></div>
    <div class="sky-glow sky-glow--aurora" aria-hidden="true"></div>
    <div class="sky-glow sky-glow--horizon" aria-hidden="true"></div>

    <SiteHeader />

    <section class="intro" id="about">
      <div class="hero-card">
        
        <div class="hero-card__body">
          <h1>
            <span class="gradient-text">{{ intro.headlinePrimary }}</span><br />
            <span>{{ intro.headlineSecondary }}</span>
          </h1>
          <p class="intro__lede">
            {{ intro.subline }}
          </p>
          <div class="intro__actions">
            <a class="cta cta--primary" href="#tools">{{ intro.ctaLabel }}</a>
          </div>
        </div>
        
      </div>
    </section>

    <section class="section tools" id="tools">
      <div class="section__header">
        <p class="section-kicker">{{ toolbox.kicker }}</p>
        <h2>{{ toolbox.title }}</h2>
        <p class="section-lede">{{ toolbox.description }}</p>
      </div>
      <div class="tool-grid">
        <ToolCard v-for="(tool, idx) in tools" :key="tool.id" :tool="tool" :style="{ '--card-delay': `${idx * 90}ms` }" />
      </div>
    </section>

    <SiteFooter />
  </main>
</template>

<style scoped>
.landing-page {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  gap: clamp(1.4rem, 1.2rem + 1vw, 2.2rem);
  padding: clamp(1.5rem, 3vw, 2.8rem);
  padding-bottom: 0;
  color: #e6f2ff;
  min-height: 100vh;
  overflow: hidden;
  font-family: 'Space Grotesk', 'Manrope', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
}

.landing-page::before {
  display: none;
}

.sky-glow {
  position: fixed;
  border-radius: 50%;
  filter: blur(32px);
  pointer-events: none;
  z-index: -2;
}

.sky-glow {
  display: none;
}

.intro {
  position: relative;
  display: flex;
  justify-content: center;
  margin-top: -3rem;
  padding: clamp(1rem, 3vw, 3rem);
  min-height: calc(100vh - 120px);
  align-items: center;
}

.hero-card {
  position: relative;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  overflow: visible;
}

.hero-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem clamp(0.6rem, 2vw, 1.8rem);
}

.hero-brand {
  font-weight: 800;
  color: #f6f8ff;
  letter-spacing: 0.02em;
}

.hero-social {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.hero-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #f6f8ff;
  opacity: 0.8;
}

.hero-card__body {
  padding: 1.5rem clamp(1.4rem, 4vw, 3.6rem) 0;
  text-align: center;
}

.hero-card h1 {
  margin: 0;
  font-size: clamp(2.2rem, 3vw, 3.4rem);
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.25;
  color: #f6f8ff;
}

.gradient-text {
  background: linear-gradient(120deg, #ff6ae1, #7ed0ff);
  -webkit-background-clip: text;
  color: transparent;
}

.intro__lede {
  margin: 1rem auto 0;
  max-width: 720px;
  color: #cfd5e6;
  line-height: 1.7;
  font-size: 1rem;
}

.intro__actions {
  display: flex;
  justify-content: center;
  gap: 0.9rem;
  margin: 1.4rem auto 0;
  flex-wrap: wrap;
}

.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.95rem 1.6rem;
  border-radius: 28px;
  font-weight: 800;
  text-decoration: none;
  transition: transform 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease, color 0.16s ease;
}

.cta--primary {
  background: linear-gradient(120deg, #ff6ae1, #7ed0ff);
  color: #0a0b10;
  box-shadow: 0 20px 40px rgba(255, 106, 225, 0.2);
}

.cta--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 48px rgba(255, 106, 225, 0.25);
}

.cta--outline {
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #f6f8ff;
  background: transparent;
}

.cta--outline:hover {
  transform: translateY(-2px);
  border-color: #f6f8ff;
  color: #0a0b10;
  background: #f6f8ff;
}

.hero-card__visual {
  position: relative;
  padding: clamp(1.2rem, 3vw, 2.4rem);
}

.infinity-wrap {
  position: relative;
  width: min(860px, 100%);
  margin: 0 auto;
  aspect-ratio: 16 / 7;
  background: radial-gradient(circle at 50% 40%, rgba(255, 106, 225, 0.18), transparent 50%),
    radial-gradient(circle at 30% 70%, rgba(126, 208, 255, 0.16), transparent 52%),
    radial-gradient(circle at 70% 70%, rgba(126, 208, 255, 0.12), transparent 52%);
  border-radius: 24px;
  overflow: hidden;
}

.infinity-core {
  position: absolute;
  inset: 12%;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.08);
  background: radial-gradient(circle at 30% 50%, rgba(255, 106, 225, 0.08), transparent 40%),
    radial-gradient(circle at 70% 50%, rgba(126, 208, 255, 0.08), transparent 40%),
    linear-gradient(90deg, rgba(255, 106, 225, 0.2), rgba(126, 208, 255, 0.2));
}

.pulse {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ff6ae1;
  box-shadow: 0 0 12px rgba(255, 106, 225, 0.5);
  animation: float 6s ease-in-out infinite;
}

.pulse--one {
  top: 10%;
  left: 18%;
}

.pulse--two {
  top: 36%;
  right: 22%;
  background: #7ed0ff;
  box-shadow: 0 0 12px rgba(126, 208, 255, 0.5);
  animation-delay: 1s;
}

.pulse--three {
  bottom: 12%;
  left: 46%;
  background: #8b7bff;
  box-shadow: 0 0 12px rgba(139, 123, 255, 0.45);
  animation-delay: 0.4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.9rem;
}

.metric-card {
  padding: 1rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
}

.metric-value {
  margin: 0;
  font-size: 2.1rem;
  font-weight: 800;
  color: #7cf5cf;
}

.metric-label {
  margin: 0.15rem 0 0;
  font-weight: 700;
  color: #e6f2ff;
}

.metric-detail {
  margin: 0.1rem 0 0;
  color: #b7c6de;
}

.section {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: clamp(1.1rem, 1rem + 1vw, 1.8rem);
  border-radius: 24px;
  background: linear-gradient(170deg, rgba(8, 13, 21, 0.92), rgba(12, 18, 29, 0.88));
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 20px 45px rgba(4, 8, 16, 0.65), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.section__header h2 {
  margin: 0.2rem 0 0;
  font-family: 'Space Grotesk', 'Manrope', 'Inter', system-ui, sans-serif;
  font-weight: 800;
  color: #e6f2ff;
  font-size: clamp(1.6rem, 1.3rem + 1vw, 2.3rem);
}

.section-kicker {
  margin: 0;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 800;
  color: #7cf5cf;
}

.section-lede {
  margin: 0.3rem 0 0;
  color: #c0cce1;
  max-width: 720px;
}

.tools {
  gap: 1.4rem;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

@media (max-width: 640px) {
  .landing-page {
    padding: 1.1rem;
    padding-bottom: 0;
  }

  .intro__hero {
    grid-template-columns: 1fr;
  }

.intro__actions {
  flex-direction: column;
  align-items: center;
}

  .feature-band {
    grid-template-columns: 1fr;
  }
}
</style>
