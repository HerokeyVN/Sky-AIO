import QrScanner from 'qr-scanner'

export async function scanImageFile(file: File) {
  if (typeof window === 'undefined') {
    throw new Error('Không thể đọc QR từ ảnh trong môi trường hiện tại.')
  }

  try {
    const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true })
    const text = typeof result === 'string' ? result : result.data
    return String(text)
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Không đọc được mã QR từ ảnh.')
  }
}
