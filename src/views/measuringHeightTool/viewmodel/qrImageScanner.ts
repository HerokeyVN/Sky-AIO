type Html5QrcodeCtor = new (elementId: string, config?: unknown) => Html5QrcodeInstance

interface Html5QrcodeInstance {
	scanFile(file: File, showImage: boolean): Promise<string>
	clear(): Promise<void>
}

let scannerPromise: Promise<Html5QrcodeInstance> | null = null
let containerId: string | null = null

export async function scanImageFile(file: File) {
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		throw new Error('Không thể đọc QR từ ảnh trong môi trường hiện tại.')
	}

	const scanner = await getScanner()
	try {
		const result = await scanner.scanFile(file, false)
		return typeof result === 'string' ? result : String(result)
	} finally {
		try {
			await scanner.clear()
		} catch (_error) {
			// ignore cleanup errors
		}
	}
}

async function getScanner() {
	if (!scannerPromise) {
		scannerPromise = createScanner()
	}
	return scannerPromise
}

async function createScanner() {
	const { Html5Qrcode } = (await import('html5-qrcode')) as unknown as { Html5Qrcode: Html5QrcodeCtor }
	const elementId = ensureHiddenContainer()
	return new Html5Qrcode(elementId)
}

function ensureHiddenContainer() {
	if (containerId && document.getElementById(containerId)) {
		return containerId
	}

	const id = `qr-hidden-${Math.random().toString(36).slice(2)}`
	const div = document.createElement('div')
	div.id = id
	div.style.position = 'absolute'
	div.style.left = '-9999px'
	div.style.top = '-9999px'
	div.style.width = '1px'
	div.style.height = '1px'
	document.body.appendChild(div)
	containerId = id
	return id
}
