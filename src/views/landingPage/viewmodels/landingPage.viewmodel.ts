import { computed } from 'vue'

import type { Tool } from '../../../models/tool'
import { toolService } from '../../../services/toolService'
import { useI18n } from '../../../i18n'

export interface IntroContent {
	kicker: string
	headlinePrimary: string
	headlineSecondary: string
	subline: string
	highlights: string[]
	ctaLabel: string
}

export interface ToolboxContent {
	kicker: string
	title: string
	description: string
}

export interface InsightItem {
	id: string
	value: string
	label: string
	detail: string
}

export function useLandingPageViewModel() {
	const tools = computed<Tool[]>(() => toolService.getTools())
	const featureCount = computed(() => tools.value.length)
	const { t } = useI18n()

	const intro = computed<IntroContent>(() => ({
		kicker: t('landing.intro.kicker'),
		headlinePrimary: t('landing.intro.headlinePrimary'),
		headlineSecondary: t('landing.intro.headlineSecondary'),
		subline: t('landing.intro.subline'),
		highlights: [
			t('tools.qr-height.name'),
			t('tools.sheet-to-image.name'),
			t('tools.skycheckscam.name'),
			t('tools.sky-auto-piano.name'),
		],
		ctaLabel: t('landing.intro.cta'),
	}))

	const toolbox = computed<ToolboxContent>(() => ({
		kicker: t('landing.toolbox.kicker'),
		title: t('landing.toolbox.title'),
		description: t('landing.toolbox.description'),
	}))

	const insights = computed<InsightItem[]>(() => [
		{
			id: 'active-tools',
			value: featureCount.value.toString().padStart(2, '0'),
			label: t('tool.status.available'),
			detail: t('tool.actions.open'),
		}
	])

	return {
		intro,
		toolbox,
		tools,
		insights,
	}
}
