import { computed, ref } from 'vue'
import { decodeSkyQrPayload } from './qrDecoder'
import { scanImageFile } from './qrImageScanner'
import { computeHeightSnapshot, formatMeters, HEIGHT_MOD_MAX_SAMPLE, HEIGHT_MOD_MIN_SAMPLE } from './heightMath'
import step1Image from '../../../assets/measuringHeightTool/B1.jpg'
import step2Image from '../../../assets/measuringHeightTool/B2.jpg'
import step3Image from '../../../assets/measuringHeightTool/B3.jpg'
import step4Image from '../../../assets/measuringHeightTool/B4.jpg'
import step5Image from '../../../assets/measuringHeightTool/B5.jpg'
import { useI18n } from '../../../i18n'

interface InstructionSlide {
	id: string
	title: string
	description: string
	step: string
	placeholderLabel: string
	imageSrc?: string
	imageAlt?: string
}

interface ComparisonStage {
	skyKidLabel: string
	lampLabel: string
	lampHeight: number
}

interface InfoMetric {
	id: string
	label: string
	value: string
}

interface InfoSection {
	id: string
	title: string
	defaultOpen?: boolean
	metrics: InfoMetric[]
}

export function useMeasuringHeightViewModel() {
	const qrPreview = ref<string | null>(null)
	const qrFileName = ref('')
	const isDragging = ref(false)
	const qrRawInput = ref('')
	const qrParseError = ref('')
	const lastDecodedPayload = ref<{ scale: number; height: number } | null>(null)
	const isImageScanning = ref(false)
	const { t } = useI18n()

	const instructionSlides = computed<InstructionSlide[]>(() => [
		{
			id: 'open-settings',
			title: t('measure.instructions.steps.openSettings.title', 'Mở menu cài đặt'),
			description: t(
				'measure.instructions.steps.openSettings.description',
				'Nhấn vào biểu tượng bánh răng ở góc phải phía trên màn hình để mở menu cài đặt trong game.'
			),
			step: t('measure.instructions.steps.openSettings.step', 'Bước 1'),
			placeholderLabel: t('measure.instructions.steps.openSettings.placeholder', 'Mở menu'),
			imageSrc: step1Image,
			imageAlt: t(
				'measure.instructions.steps.openSettings.alt',
				'Người chơi nhấn vào biểu tượng bánh răng ở góc phải để mở menu cài đặt'
			),
		},
		{
			id: 'open-account',
			title: t('measure.instructions.steps.openAccount.title', 'Mở giao diện Tài khoản'),
			description: t(
				'measure.instructions.steps.openAccount.description',
				'Trong menu cài đặt, chọn mục “Tài khoản / Account” để mở trang quản lý tài khoản Sky của bạn.'
			),
			step: t('measure.instructions.steps.openAccount.step', 'Bước 2'),
			placeholderLabel: t('measure.instructions.steps.openAccount.placeholder', 'Tài khoản'),
			imageSrc: step2Image,
			imageAlt: t(
				'measure.instructions.steps.openAccount.alt',
				'Màn hình menu cài đặt với mục Tài khoản được khoanh tròn'
			),
		},
		{
			id: 'account-info',
			title: t('measure.instructions.steps.accountInfo.title', 'Kéo xuống để xem thông tin tài khoản'),
			description: t(
				'measure.instructions.steps.accountInfo.description',
				'Kéo danh sách xuống dưới cùng để hiện ra phần Thông tin Tài khoản (Account Information). Nhấn vào mục này để tiếp tục.'
			),
			step: t('measure.instructions.steps.accountInfo.step', 'Bước 3'),
			placeholderLabel: t('measure.instructions.steps.accountInfo.placeholder', 'Thông tin tài khoản'),
			imageSrc: step3Image,
			imageAlt: t(
				'measure.instructions.steps.accountInfo.alt',
				'Giao diện tài khoản với phần Account Information ở cuối danh sách'
			),
		},
		{
			id: 'outfit-qr-option',
			title: t('measure.instructions.steps.outfitQr.title', 'Tìm mục Trang phục QR Code'),
			description: t(
				'measure.instructions.steps.outfitQr.description',
				'Tại trang Thông tin Tài khoản. Hãy nhấn vào mục “Trang Phục QR Code / Outfit QR Code” được khoanh đỏ.'
			),
			step: t('measure.instructions.steps.outfitQr.step', 'Bước 4'),
			placeholderLabel: t('measure.instructions.steps.outfitQr.placeholder', 'Trang phục QR'),
			imageSrc: step4Image,
			imageAlt: t(
				'measure.instructions.steps.outfitQr.alt',
				'Mục Trang Phục QR Code được khoanh đỏ trong danh sách lựa chọn'
			),
		},
		{
			id: 'show-qr',
			title: t('measure.instructions.steps.showQr.title', 'Mã QR sẽ xuất hiện'),
			description: t(
				'measure.instructions.steps.showQr.description',
				'Màn hình sẽ hiển thị QR Code trang phục của bạn. Chụp lại màn hình để upload vào công cụ.'
			),
			step: t('measure.instructions.steps.showQr.step', 'Bước 5'),
			placeholderLabel: t('measure.instructions.steps.showQr.placeholder', 'QR Code'),
			imageSrc: step5Image,
			imageAlt: t(
				'measure.instructions.steps.showQr.alt',
				'QR Code trang phục hiển thị trên màn hình'
			),
		},
	])

	const activeSlideIndex = ref(0)
	const fallbackSlide: InstructionSlide = {
		id: 'placeholder',
		title: 'Chưa có slide',
		description: 'Vui lòng thêm nội dung hướng dẫn.',
		step: 'Bước ?',
		placeholderLabel: 'Không có dữ liệu',
	}

	const currentSlide = computed<InstructionSlide>(() => {
		if (!instructionSlides.value.length) {
			return fallbackSlide
		}
		return instructionSlides.value[activeSlideIndex.value] ?? instructionSlides.value[0] ?? fallbackSlide
	})

	const comparisonScale = ref(0)
	const bodyHeightDelta = ref(0)
	const comparisonStage: ComparisonStage = {
		skyKidLabel: 'Sky Kid (chỉnh theo QR)',
		lampLabel: 'Ancestor Lamp cố định',
		lampHeight: 160,
	}

	const currentSnapshot = computed(() => computeHeightSnapshot(comparisonScale.value, bodyHeightDelta.value))
	const maxSnapshot = computed(() => computeHeightSnapshot(comparisonScale.value, HEIGHT_MOD_MAX_SAMPLE))
	const minSnapshot = computed(() => computeHeightSnapshot(comparisonScale.value, HEIGHT_MOD_MIN_SAMPLE))

	const finalScaleFactor = computed(() => currentSnapshot.value.factor)
	const sizeType = computed(() => currentSnapshot.value.sizeType)
	const baseHeightMeters = computed(() => currentSnapshot.value.baseHeight)
	const currentHeightMeters = computed(() => currentSnapshot.value.height)

	const infoSections = computed<InfoSection[]>(() => [
		{
			id: 'basic',
			title: t('measure.metrics.title'),
			defaultOpen: true,
			metrics: [
				{ id: 'height', label: 'Height', value: formatMeters(currentHeightMeters.value, 3) },
				{ id: 'size-type', label: 'Size type', value: `${sizeType.value}` },
			],
		},
		{
			id: 'extra',
			title: t('measure.metrics.extra', 'Thông tin khác'),
			metrics: [
				{ id: 'height-max', label: 'Height max', value: formatMeters(maxSnapshot.value.height, 3) },
				{ id: 'size-type-max', label: 'Size type max', value: `${maxSnapshot.value.sizeType}` },
				{ id: 'height-min', label: 'Height min', value: formatMeters(minSnapshot.value.height, 3) },
				{ id: 'size-type-min', label: 'Size type min', value: `${minSnapshot.value.sizeType}` },
			],
		},
		{
			id: 'advanced',
			title: t('measure.metrics.advanced', 'Thông tin nâng cao'),
			metrics: [
				{ id: 'scale', label: 'Scale raw', value: comparisonScale.value.toString() },
				{ id: 'height-raw', label: 'Height raw', value: bodyHeightDelta.value.toString() },
				{ id: 'base-height', label: 'Base height', value: formatMeters(baseHeightMeters.value, 3) },
				{ id: 'final-factor', label: 'Final factor', value: `${finalScaleFactor.value.toFixed(3)}x` },
			],
		},
	])

	const hasMeasurement = computed(() => Boolean(lastDecodedPayload.value))

	function selectQrFromInput(event: Event) {
		const target = event.target as HTMLInputElement
		const file = target.files?.[0]
		if (file) {
			void setQrFile(file)
			return
		}
		resetQrSelection()
	}

function parseQrPayload(rawInput?: string) {
	const source = (rawInput ?? qrRawInput.value).trim()
	if (!source) {
		qrParseError.value = 'Vui lòng dán chuỗi hoặc link QR trước khi giải mã.'
		lastDecodedPayload.value = null
			return null
		}

		try {
			const { scale, height } = decodeSkyQrPayload(source)
			comparisonScale.value = scale
			bodyHeightDelta.value = height
			qrParseError.value = ''
			lastDecodedPayload.value = { scale, height }
			if (typeof window !== 'undefined') {
				window.scrollTo({ top: 0, behavior: 'smooth' })
			}
			return lastDecodedPayload.value
		} catch (error) {
			qrParseError.value = error instanceof Error ? error.message : 'Không thể giải mã QR.'
			lastDecodedPayload.value = null
			return null
		}
	}


	async function setQrFile(file: File) {
		const reader = new FileReader()
		qrFileName.value = file.name
		reader.onload = () => {
			qrPreview.value = reader.result as string
		}
		reader.readAsDataURL(file)

		await decodeImageFile(file)
	}

	async function decodeImageFile(file: File) {
		isImageScanning.value = true
		try {
			const rawText = await scanImageFile(file)
			qrRawInput.value = rawText
			parseQrPayload(rawText)
		} catch (error) {
			qrParseError.value = error instanceof Error ? error.message : 'Không đọc được QR từ ảnh.'
			lastDecodedPayload.value = null
		} finally {
			isImageScanning.value = false
		}
	}

	function resetQrSelection() {
		qrPreview.value = null
		qrFileName.value = ''
	}

	function startNewMeasurement() {
		resetQrSelection()
		qrRawInput.value = ''
		qrParseError.value = ''
		lastDecodedPayload.value = null
		comparisonScale.value = 0
		bodyHeightDelta.value = 0
	}

	function handleDrop(event: DragEvent) {
		isDragging.value = false
		const file = event.dataTransfer?.files?.[0]
		if (file) {
			void setQrFile(file)
		}
	}

	function handleDragEnter() {
		isDragging.value = true
	}

	function handleDragLeave() {
		isDragging.value = false
	}

	function goToNextSlide() {
		activeSlideIndex.value = (activeSlideIndex.value + 1) % instructionSlides.value.length
	}

	function goToPrevSlide() {
		activeSlideIndex.value =
			(activeSlideIndex.value - 1 + instructionSlides.value.length) % instructionSlides.value.length
	}

	function goToSlide(index: number) {
		if (index < 0 || index >= instructionSlides.value.length) return
		activeSlideIndex.value = index
	}

	return {
		qrPreview,
		qrFileName,
		isDragging,
		isImageScanning,
		qrRawInput,
		qrParseError,
		lastDecodedPayload,
		hasMeasurement,
		instructionSlides,
		activeSlideIndex,
		currentSlide,
		comparisonScale,
		bodyHeightDelta,
		comparisonStage,
		sizeType,
		finalScaleFactor,
		infoSections,
		maxSnapshot,
		minSnapshot,
		selectQrFromInput,
		parseQrPayload,
		resetQrSelection,
		startNewMeasurement,
		handleDrop,
		handleDragEnter,
		handleDragLeave,
		goToNextSlide,
		goToPrevSlide,
		goToSlide,
	}
}
