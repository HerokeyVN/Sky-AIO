<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

type Html5QrcodeType = {
	new (elementId: string, verbose?: boolean): Html5QrcodeInstance
}

interface Html5QrcodeInstance {
	start(
		cameraConfig: { facingMode: string } | { deviceId: { exact: string } },
		config: { fps: number; qrbox: { width: number; height: number } },
		onSuccess: (decodedText: string) => void,
		onError: (errorMessage: string) => void
	): Promise<void>
	stop(): Promise<void>
	clear(): Promise<void>
}

const emit = defineEmits<{
	(event: 'decoded', value: string): void
	(event: 'error', message: string): void
	(event: 'close'): void
}>()

const scannerId = `qr-scanner-${Math.random().toString(36).slice(2)}`
const statusMessage = ref('Đang khởi động camera...')
const html5QrCode = ref<Html5QrcodeInstance | null>(null)

onMounted(async () => {
	if (typeof window === 'undefined') {
		statusMessage.value = 'Trình duyệt không hỗ trợ camera.'
		return
	}

	try {
		const { Html5Qrcode } = (await import('html5-qrcode')) as unknown as { Html5Qrcode: Html5QrcodeType }
		const instance = new Html5Qrcode(scannerId)
		html5QrCode.value = instance
		statusMessage.value = 'Đang tìm mã QR...'
		await instance.start(
			{ facingMode: 'environment' },
			{ fps: 10, qrbox: { width: 250, height: 250 } },
			handleSuccess,
			handleScanError
		)
	} catch (error) {
		statusMessage.value = 'Không thể truy cập camera.'
		emit('error', error instanceof Error ? error.message : 'Camera unavailable')
	}
})

onBeforeUnmount(() => {
	stopScanner()
})

async function stopScanner() {
	const instance = html5QrCode.value
	if (!instance) return
	html5QrCode.value = null
	try {
		await instance.stop()
		await instance.clear()
	} catch (_error) {
		// ignore cleanup issues
	}
}

function handleSuccess(decodedText: string) {
	emit('decoded', decodedText)
	statusMessage.value = 'Đã đọc được mã, đang dừng camera...'
	stopScanner()
}

function handleScanError(_message: string) {
	statusMessage.value = 'Không thấy mã, hãy giữ camera ổn định...'
}

async function closeScanner() {
	await stopScanner()
	emit('close')
}
</script>

<template>
	<div class="qr-scanner">
		<div :id="scannerId" class="qr-scanner__viewport"></div>
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
