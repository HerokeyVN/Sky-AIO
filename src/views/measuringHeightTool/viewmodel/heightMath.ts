export const HEIGHT_MOD_MAX_SAMPLE = 2
export const HEIGHT_MOD_MIN_SAMPLE = -2

const ratioCoefficients = {
  A: 1.095388425,
  B: 0.004983453,
  C: 0.492141518,
  D: 0.002968009,
}

const ratioCoefficients2 = {
  A: 1.224206561,
  B: 0.012636310,
  C: 0.495569563,
  D: 0.004517799,
}

const SIZE_TYPE_MIN = 1
const SIZE_TYPE_MAX = 14
const SHORTEST_HEIGHT_M = 0.8
const TALLEST_HEIGHT_M = 1.2
const RATIO_PER_STEP = Math.pow(TALLEST_HEIGHT_M / SHORTEST_HEIGHT_M, 1 / (SIZE_TYPE_MAX - 1))
const SKY_REFERENCE_HEIGHT_M = 1
const OLD_RAW_MIN = -2
const OLD_RAW_MAX = 2
const OLD_SCALE_BUCKETS = 13.5

export interface HeightSnapshot {
	factor: number
	sizeType: number
	baseHeight: number
	height: number
	heightDelta: number
}

export function computeHeightSnapshot(scaleValue: number, heightModValue: number): HeightSnapshot {
	const factor = calcFinalFactor(scaleValue, heightModValue)
	const referenceHeight = SKY_REFERENCE_HEIGHT_M * factor
	const derivedSizeType = sizeTypeFromHeight(referenceHeight)
	const baseHeight = baseHeightFromSizeType(derivedSizeType)
	const absoluteHeight = baseHeight * factor
	return {
		factor,
		sizeType: derivedSizeType,
		baseHeight,
		height: absoluteHeight,
		heightDelta: absoluteHeight - baseHeight,
	}
}

export function formatMeters(value: number, precision = 2) {
	return `${value.toFixed(precision)} m`
}

function calcFinalFactor(scaleValue: number, heightValue: number) {
	const coefficients = pickRatioCoefficients(heightValue)
	const ratio = predictRatio(scaleValue, heightValue, coefficients)
	const baseRatio = predictRatio(0, 0, coefficients)
	if (!baseRatio) return 1
	return ratio / baseRatio
}

function predictRatio(scaleValue: number, heightValue: number, coefficients = pickRatioCoefficients(heightValue)) {
	const adjustedHeight = heightValue * 10
	const s = scaleComponent(scaleValue)
	const { A, B, C, D } = coefficients
	return A + B * adjustedHeight + C * s + D * (adjustedHeight * s)
}

function pickRatioCoefficients(heightValue: number) {
	return heightValue < 0 ? ratioCoefficients2 : ratioCoefficients
}

function scaleComponent(scaleValue: number) {
	return scaleValue >= 0 ? 1 + scaleValue : 1 / (1 - scaleValue)
}

function sizeTypeFromHeight(heightMeters: number) {
	const raw = clamp(10 * (heightMeters - SKY_REFERENCE_HEIGHT_M), OLD_RAW_MIN, OLD_RAW_MAX)
	const scalar = (raw + 2) / 4
	const oldValue = Math.floor((1 - scalar) * OLD_SCALE_BUCKETS)
	return clamp(Math.round(oldValue + 1), SIZE_TYPE_MIN, SIZE_TYPE_MAX) - 1
}

function baseHeightFromSizeType(sizeTypeValue: number) {
	const stepsFromShortest = SIZE_TYPE_MAX - sizeTypeValue
	return SHORTEST_HEIGHT_M * Math.pow(RATIO_PER_STEP, stepsFromShortest)
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max)
}
