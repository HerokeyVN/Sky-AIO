<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import QrScanner from 'qr-scanner'

const emit = defineEmits<{
	(event: 'decoded', value: string): void
	(event: 'error', message: string): void
	(event: 'close'): void
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const scanner = ref<QrScanner | null>(null)
const statusMessage = ref('Đang khởi động camera...')

onMounted(async () => {
	if (typeof window === 'undefined') {
		statusMessage.value = 'Trình duyệt không hỗ trợ camera.'
		return
	}

	try {
		const video = videoRef.value
		if (!video) {
			throw new Error('Không tìm thấy video element.')
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
		statusMessage.value = 'Đang tìm mã QR...'
		await instance.start()
	} catch (error) {
		statusMessage.value = 'Không thể truy cập camera.'
		emit('error', error instanceof Error ? error.message : 'Camera unavailable')
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
	} catch (_error) {
		// ignore cleanup issues
	}
}

function handleSuccess(result: string | { data: string }) {
	const text = typeof result === 'string' ? result : result.data
	emit('decoded', text)
	statusMessage.value = 'Đã đọc được mã, đang dừng camera...'
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
		<button type="button" class="btn" @click="closeScanner">Đóng</button>
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
