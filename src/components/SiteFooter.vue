<script setup lang="ts">
import { useI18n } from '../i18n'

const rawBase = import.meta.env.BASE_URL ?? '/'
const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`
const resolveAppUrl = (path = '') => {
  if (!path) return normalizedBase
  if (path.startsWith('?') || path.startsWith('#')) {
    return `${normalizedBase}${path}`
  }
  return `${normalizedBase}${path.replace(/^\/+/u, '')}`
}

const { t } = useI18n()
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__grid">
      <div class="footer-block">
        <p class="footer-title">{{ t('footer.introTitle') }}</p>
        <p class="footer-text">
          {{ t('footer.introText1') }}
        </p>
        <p class="footer-text">
          {{ t('footer.introText2') }}
        </p>
      </div>
      <div class="footer-block">
        <p class="footer-title">{{ t('footer.quickLinks') }}</p>
        <nav class="footer-nav">
          <a :href="resolveAppUrl('#top')" class="footer-link">{{ t('footer.home') }}</a>
          <a :href="resolveAppUrl('#tools')" class="footer-link">{{ t('footer.tools') }}</a>
          <a href="https://forms.gle/" target="_blank" rel="noopener noreferrer" class="footer-link">{{ t('footer.feedback') }}</a>
        </nav>
      </div>
      <div class="footer-block">
        <p class="footer-title">{{ t('footer.community') }}</p>
        <nav class="footer-nav">
          <a href="#" class="footer-link">{{ t('footer.discord') }}</a>
          <a href="#" class="footer-link">{{ t('footer.facebook') }}</a>
          <a href="mailto:herokey.vn@gmail.com" class="footer-link">{{ t('footer.contact') }}</a>
        </nav>
      </div>
    </div>
    <hr class="footer-divider" />
    <div class="site-footer__meta">
      <p class="meta-item">{{ t('footer.copyright') }}</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  padding: clamp(1.4rem, 2vw, 2.4rem) clamp(1.5rem, 4vw, 3rem);
  background: rgba(6, 10, 18, 0.85);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: #dfe4f3;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  backdrop-filter: blur(8px);
}

.site-footer__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.4rem;
}

.footer-block {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.footer-title {
  margin: 0;
  font-weight: 800;
  color: #f3b6a0;
  letter-spacing: 0.04em;
}

.footer-text {
  margin: 0;
  color: #d0d6e3;
  line-height: 1.6;
}

.footer-nav {
  display: grid;
  gap: 0.35rem;
}

.footer-link {
  color: #e6edff;
  text-decoration: none;
  font-weight: 700;
  transition: color 0.15s ease;
}

.footer-link:hover {
  color: #ffb4b4;
}

.footer-divider {
  width: 100%;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin: 0;
}

.site-footer__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  font-weight: 600;
  color: #c7cedd;
}

.meta-item {
  margin: 0;
}

@media (max-width: 640px) {
  .site-footer {
    padding-inline: 1.2rem;
  }
}
</style>
