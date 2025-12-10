<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import QrScanner from 'qr-scanner'
import { useI18n } from '../i18n'

const emit = defineEmits<{
	(event: 'decoded', value: string): void
	(event: 'error', message: string): void
	(event: 'close'): void
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const scanner = ref<QrScanner | null>(null)
const statusMessage = ref('')
const { t } = useI18n()

onMounted(async () => {
	if (typeof window === 'undefined') {
		statusMessage.value = t('scanner.status.unsupported')
		return
	}

	statusMessage.value = t('scanner.status.starting')
	try {
		const video = videoRef.value
		if (!video) {
			throw new Error(t('scanner.status.videoMissing'))
		}
		const instance = new QrScanner(
			video,
			handleSuccess,
			{
				preferredCamera: 'environment',
				maxScansPerSecond: 8,
				returnDetailedScanResult: true,
				highlightScanRegion: true,
			}
		)
		scanner.value = instance
		statusMessage.value = t('scanner.status.scanning')
		await instance.start()
	} catch (error) {
		statusMessage.value = t('scanner.status.cameraError')
		emit('error', error instanceof Error ? error.message : t('scanner.status.cameraUnavailable'))
	}
})

onBeforeUnmount(() => {
	stopScanner()
})

async function stopScanner() {
	const instance = scanner.value
	if (!instance) return
	scanner.value = null
	try {
		await instance.stop()
		await instance.destroy()
	} catch (_error) {}
}

function handleSuccess(result: string | { data: string }) {
	const text = typeof result === 'string' ? result : result.data
	emit('decoded', text)
	statusMessage.value = t('scanner.status.found')
	stopScanner()
}

async function closeScanner() {
	await stopScanner()
	emit('close')
}
</script>

<template>
	<div class="qr-scanner">
		<video ref="videoRef" class="qr-scanner__viewport" playsinline muted></video>
		<p class="qr-scanner__status">{{ statusMessage }}</p>
		<button type="button" class="btn" @click="closeScanner">{{ t('scanner.actions.close') }}</button>
	</div>
</template>

<style scoped>
.qr-scanner {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: 0.75rem;
}

.qr-scanner__viewport {
	width: min(320px, 80vw);
	height: min(320px, 80vw);
	align-self: center;
	border-radius: 24px;
	border: 2px solid rgba(255, 255, 255, 0.25);
	overflow: hidden;
	background: rgba(5, 10, 18, 0.85);
	object-fit: cover;
}

.qr-scanner__status {
	margin: 0;
	text-align: center;
	color: #cdd8f4;
	font-size: 0.95rem;
}

.btn {
	align-self: center;
	padding: 0.55rem 1.2rem;
	border-radius: 999px;
	border: none;
	background: rgba(255, 255, 255, 0.12);
	color: #f5f7ff;
	font-weight: 600;
	cursor: pointer;
}

.btn:hover {
	background: rgba(255, 255, 255, 0.2);
}
</style>
