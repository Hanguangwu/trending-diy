import { ref, computed } from 'vue'
import type { Repo } from '../components/TrendingCard.vue'

/* ── Types ─────────────────────────────────────────── */

export interface PHPost {
  rank: number
  name: string
  tagline: string
  url: string
  votes: number
  comments: number
  thumbnail: string | null
  makers: string[]
}

export interface HNStory {
  rank: number
  title: string
  url: string
  score: number
  comments: number
  author: string
}

export interface DailyData {
  date: string
  updatedAt: string
  github: { updatedAt: string; repos: Repo[] } | null
  productHunt: { updatedAt: string; posts: PHPost[] } | null
  hackerNews: { updatedAt: string; stories: HNStory[] } | null
}

export interface DateIndex {
  dates: string[]
  latest: string
}

export type SourceKey = 'github' | 'productHunt' | 'hackerNews'

/* ── State ─────────────────────────────────────────── */

const dateIndex = ref<DateIndex | null>(null)
const dailyData = ref<DailyData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const activeSource = ref<SourceKey>('github')

/* ── Composable ────────────────────────────────────── */

export function useDailyData() {
  const base = import.meta.env.BASE_URL

  async function fetchDateIndex(): Promise<DateIndex | null> {
    try {
      const res = await fetch(`${base}data/index.json`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const idx: DateIndex = await res.json()
      dateIndex.value = idx
      return idx
    } catch {
      // Fallback: if no index yet, derive from legacy trending.json
      console.warn('data/index.json not found, falling back to trending.json')
      dateIndex.value = null
      return null
    }
  }

  async function fetchDate(date: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${base}data/${date}.json`)
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      const data: DailyData = await res.json()
      dailyData.value = data

      // Set first available source as active
      const first = availableSources.value[0]
      if (first && !isSourceActive(first)) {
        activeSource.value = first
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load data'
      dailyData.value = null
    } finally {
      loading.value = false
    }
  }

  async function loadLegacyTrending(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${base}trending.json`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const legacy = await res.json()

      // Convert legacy format to DailyData
      dailyData.value = {
        date: legacy.date,
        updatedAt: legacy.updatedAt,
        github: { updatedAt: legacy.updatedAt, repos: legacy.repos },
        productHunt: null,
        hackerNews: null,
      }
      activeSource.value = 'github'
      dateIndex.value = {
        dates: [legacy.date],
        latest: legacy.date,
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load data'
    } finally {
      loading.value = false
    }
  }

  function setActiveSource(key: SourceKey) {
    activeSource.value = key
  }

  function isSourceActive(key: SourceKey): boolean {
    return activeSource.value === key
  }

  const availableSources = computed((): SourceKey[] => {
    const d = dailyData.value
    if (!d) return []
    const keys: SourceKey[] = []
    if (d.github?.repos?.length) keys.push('github')
    if (d.productHunt?.posts?.length) keys.push('productHunt')
    if (d.hackerNews?.stories?.length) keys.push('hackerNews')
    return keys
  })

  const hasMultipleSources = computed(() => availableSources.value.length > 1)

  return {
    dateIndex,
    dailyData,
    loading,
    error,
    activeSource,
    availableSources,
    hasMultipleSources,
    fetchDateIndex,
    fetchDate,
    loadLegacyTrending,
    setActiveSource,
    isSourceActive,
  }
}
