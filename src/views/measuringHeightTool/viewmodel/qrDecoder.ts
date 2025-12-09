export interface DecodedSkyPayload {
	scale: number
	height: number
}

export function decodeSkyQrPayload(rawText: string): DecodedSkyPayload {
	const candidates = collectBase64Candidates(rawText)
	if (!candidates.length) {
		throw new Error('Không tìm thấy dữ liệu base64 trong QR.')
	}

	for (const candidate of candidates) {
		try {
			const normalized = normalizeBase64(stripNoiseMarkers(candidate))
			if (!normalized) continue
			const decodedText = decodeBase64(normalized)
			const preferHeightKeyword = candidate.includes('ImJvZHki')
			const parsed = parseDecodedPayload(decodedText, preferHeightKeyword)
			if (parsed) {
				return parsed
			}
		} catch (_error) {
			continue
		}
	}

	throw new Error('Không thể xác định scale/height từ QR.')
}

function collectBase64Candidates(rawText: string) {
	const trimmed = rawText.trim()
	if (!trimmed) return []
	const variants = new Set<string>()

	const maybeUrlPayload = extractBase64FromUrl(trimmed)
	if (maybeUrlPayload) {
		variants.add(maybeUrlPayload)
	}

	const marker = 'ImJvZHki'
	const markerIndex = trimmed.indexOf(marker)
	if (markerIndex >= 0) {
		variants.add(trimmed.slice(markerIndex))
	}

	const oIndex = trimmed.indexOf('o=')
	if (oIndex >= 0) {
		variants.add(trimmed.slice(oIndex + 2))
	}

	variants.add(trimmed)
	return Array.from(variants).filter(Boolean)
}

function extractBase64FromUrl(rawText: string) {
	const possibleUrl = tryParseUrl(rawText)
	if (!possibleUrl) {
		const queryMatch = rawText.match(/(?:payload|data|value|q|v)=([A-Za-z0-9+/=_-]+)/i)
		return queryMatch ? queryMatch[1] : ''
	}

	const params = ['payload', 'data', 'value', 'q', 'v', 'o']
	for (const key of params) {
		const value = possibleUrl.searchParams.get(key)
		if (value) return value
	}

	const pathSegment = possibleUrl.pathname.split('/').filter(Boolean).pop()
	return pathSegment ?? ''
}

function stripNoiseMarkers(payload: string) {
	const trimmed = payload.trim()
	const bodyMarker = 'ImJvZHki'
	const markerIndex = trimmed.indexOf(bodyMarker)
	if (markerIndex >= 0) {
		return trimmed.slice(markerIndex)
	}

	const oIndex = trimmed.indexOf('o=')
	if (oIndex >= 0) {
		return trimmed.slice(oIndex + 2)
	}

	return trimmed
}

function parseDecodedPayload(decodedText: string, preferHeightKeyword: boolean) {
	const printable = decodedText.replace(/[^\x20-\x7E]/g, '')
	const attempts: Array<() => DecodedSkyPayload | null> = []

	if (preferHeightKeyword) {
		attempts.push(() => parseViaHeightKeyword(decodedText))
	}

	attempts.push(() => parseViaAnchor(decodedText))
	attempts.push(() => parseViaKeyHints(decodedText))
	if (!preferHeightKeyword) {
		attempts.push(() => parseViaHeightKeyword(printable))
	}
	attempts.push(() => parseViaAnchor(printable))
	attempts.push(() => parseViaKeyHints(printable))

	for (const tryParse of attempts) {
		const parsed = tryParse()
		if (parsed && Number.isFinite(parsed.height) && Number.isFinite(parsed.scale)) {
			return parsed
		}
	}

	return null
}

function parseViaHeightKeyword(text: string) {
	const heightKeyMatch = /eigh/i.exec(text)
	if (!heightKeyMatch || typeof heightKeyMatch.index !== 'number') {
		return null
	}
	const heightMatch = text
		.slice(heightKeyMatch.index)
		.match(/(-?\d*\.\d+|-?\d+\.?\d*)/)
	const heightRaw = heightMatch?.[1]
	if (!heightRaw) {
		return null
	}
	const height = Number.parseFloat(heightRaw)
	if (!Number.isFinite(height)) {
		return null
	}

	const scaleKeyMatch = /scale/i.exec(text)
	if (!scaleKeyMatch || typeof scaleKeyMatch.index !== 'number') {
		return null
	}
	const scaleSub = text.slice(scaleKeyMatch.index + scaleKeyMatch[0].length)
	const numPattern = /(-?\d+\.?\d*(?:[eE][-+]?\d+)?)/g
	let match: RegExpExecArray | null
	let scale: number | null = null
	while ((match = numPattern.exec(scaleSub)) !== null) {
		const raw = match[1]
		if (!raw) continue
		const val = Number.parseFloat(raw)
		if (!Number.isFinite(val)) continue
		if (raw.includes('.') || /[eE]/.test(raw)) {
			scale = val
			break
		}
		if (Math.abs(val) >= 1000) {
			scale = val / 1_000_000_000
			break
		}
	}

	if (scale === null) {
		return null
	}

	return { scale, height }
}

function parseViaAnchor(text: string) {
	const anchorMatch = /["']s/i.exec(text)
	if (!anchorMatch || typeof anchorMatch.index !== 'number') {
		return null
	}
	const anchorIndex = anchorMatch.index
	const afterS = text.slice(anchorIndex + anchorMatch[0].length)
	const scaleCandidates = afterS.match(/(-?\d+\.?\d*(?:[eE][-+]?\d+)?)/g) ?? []
	let scale: number | null = null
	for (const cand of scaleCandidates) {
		const value = Number.parseFloat(cand)
		if (!Number.isFinite(value)) continue
		if (cand.includes('.') || /[eE]/.test(cand)) {
			scale = value
			break
		}
		if (Math.abs(value) >= 1000) {
			scale = value / 1_000_000_000
			break
		}
	}

	const beforeS = text.slice(0, anchorIndex)
	const height = pickLastNumeric(beforeS)
	if (scale === null || height === null) {
		return null
	}
	return { scale, height }
}

function parseViaKeyHints(text: string) {
	const scale = findScaleValue(text)
	const height = findHeightValue(text)
	if (scale === null || height === null) {
		return null
	}
	return { scale, height }
}

function findScaleValue(text: string) {
	const namedMatch = /["']?s["']?\s*:\s*(-?\d+\.?\d*(?:[eE][-+]?\d+)?)/i.exec(text)
	if (namedMatch && namedMatch[1]) {
		const normalized = normalizeNumeric(namedMatch[1])
		if (normalized !== null) {
			return normalized
		}
	}

	const scaleKeyMatch = /scale/i.exec(text)
	if (scaleKeyMatch && typeof scaleKeyMatch.index === 'number') {
		return pickFirstNumeric(text.slice(scaleKeyMatch.index + scaleKeyMatch[0].length))
	}

	return null
}

function findHeightValue(text: string) {
	const patterns = [/height/i, /body/i, /hto/i, /["']?h["']?\s*:/i]
	for (const pattern of patterns) {
		const match = pattern.exec(text)
		if (match && typeof match.index === 'number') {
			const candidate = pickFirstNumeric(text.slice(match.index + match[0].length))
			if (candidate !== null) {
				return candidate
			}
		}
	}
	const startMatch = /^(-?\d+\.?\d*(?:[eE][-+]?\d+)?)/.exec(text)
	if (startMatch && startMatch[1]) {
		return normalizeNumeric(startMatch[1])
	}
	return null
}

function pickFirstNumeric(source: string) {
	const numPattern = /(-?\d+\.?\d*(?:[eE][-+]?\d+)?)/g
	let match: RegExpExecArray | null
	while ((match = numPattern.exec(source)) !== null) {
		const raw = match[1]
		if (typeof raw !== 'string') {
			continue
		}
		const normalized = normalizeNumeric(raw)
		if (normalized !== null) {
			return normalized
		}
	}
	return null
}

function pickLastNumeric(source: string) {
	const floatPattern = /(-?\d+\.\d+(?:[eE][-+]?\d+)?)/g
	let floatMatch: RegExpExecArray | null
	let lastFloat: number | null = null
	while ((floatMatch = floatPattern.exec(source)) !== null) {
		const raw = floatMatch[1]
		if (typeof raw !== 'string') {
			continue
		}
		const normalized = normalizeNumeric(raw)
		if (normalized !== null) {
			lastFloat = normalized
		}
	}
	if (lastFloat !== null) {
		return lastFloat
	}

	const numPattern = /(-?\d+\.?\d*(?:[eE][-+]?\d+)?)/g
	let numMatch: RegExpExecArray | null
	let lastValue: number | null = null
	while ((numMatch = numPattern.exec(source)) !== null) {
		const raw = numMatch[1]
		if (typeof raw !== 'string') {
			continue
		}
		const normalized = normalizeNumeric(raw)
		if (normalized !== null) {
			lastValue = normalized
		}
	}
	return lastValue
}

function normalizeNumeric(raw: string) {
	const value = Number.parseFloat(raw)
	if (!Number.isFinite(value)) {
		return null
	}
	const hasDecimal = raw.includes('.') || /[eE]/.test(raw)
	if (!hasDecimal && Math.abs(value) >= 1000) {
		return value / 1_000_000_000
	}
	return value
}

function decodeBase64(payload: string) {
	if (typeof window !== 'undefined' && typeof window.atob === 'function') {
		return window.atob(payload)
	}

	if (typeof globalThis !== 'undefined') {
		const globalAtob = (globalThis as { atob?: typeof atob }).atob
		if (typeof globalAtob === 'function') {
			return globalAtob(payload)
		}

		const bufferCtor = (globalThis as { Buffer?: { from: (input: string, encoding: string) => { toString: (enc: string) => string } } }).Buffer
		if (bufferCtor) {
			return bufferCtor.from(payload, 'base64').toString('binary')
		}
	}

	throw new Error('Không thể giải mã base64 trong môi trường hiện tại.')
}

function normalizeBase64(payload: string) {
	const stripped = payload.replace(/[\n\r\s]/g, '').replace(/-/g, '+').replace(/_/g, '/')
	const remainder = stripped.length % 4
	return remainder === 0 ? stripped : stripped + '='.repeat(4 - remainder)
}

function tryParseUrl(candidate: string) {
	try {
		return new URL(candidate)
	} catch (_error) {
		return null
	}
}
