import QrScanner from 'qr-scanner'

export async function scanImageFile(file: File) {
  if (typeof window === 'undefined') {
    throw new Error('QR_SCAN_UNSUPPORTED')
  }

  try {
    const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true })
    const text = typeof result === 'string' ? result : result.data
    return String(text)
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'QR_SCAN_FAILED')
  }
}
