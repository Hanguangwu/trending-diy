<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDailyData } from '../composables/useDailyData'
import type { SourceKey } from '../composables/useDailyData'
import DateNavigator from '../components/DateNavigator.vue'
import SourceTabs from '../components/SourceTabs.vue'
import TrendingCard from '../components/TrendingCard.vue'
import ProductHuntCard from '../components/ProductHuntCard.vue'
import HackerNewsCard from '../components/HackerNewsCard.vue'

const route = useRoute()
const router = useRouter()
const {
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
} = useDailyData()

const dataReady = ref(false)

async function init() {
  // Try to load the new index
  const idx = await fetchDateIndex()
  if (idx) {
    const dateParam = route.params.date as string
    const targetDate = dateParam || idx.latest
    await fetchDate(targetDate)
    dataReady.value = true
  } else {
    // Fallback to legacy trending.json
    await loadLegacyTrending()
    dataReady.value = true
  }
}

function navigateToDate(date: string) {
  if (date === dateIndex.value?.latest) {
    router.push({ name: 'home' })
  } else {
    router.push({ name: 'daily', params: { date } })
  }
}

// Watch route param changes
watch(
  () => route.params.date,
  async (newDate) => {
    if (!dataReady.value) return
    const target = (newDate as string) || dateIndex.value?.latest
    if (target) await fetchDate(target)
  }
)

onMounted(init)

function retry() {
  init()
}

function formatDateLabel(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}
</script>

<template>
  <div class="daily-view">
    <header class="page-header">
      <h1>Trending DIY</h1>
      <p v-if="dailyData" class="page-subtitle">
        {{ formatDateLabel(dailyData.date) }} · Updated {{ formatTime(dailyData.updatedAt) }}
      </p>
    </header>

    <DateNavigator
      v-if="dateIndex"
      :all-dates="dateIndex.dates"
      :current-date="dailyData?.date || dateIndex.latest"
      @update:current-date="navigateToDate"
    />

    <SourceTabs
      v-if="hasMultipleSources && dailyData"
      :sources="availableSources"
      :active="activeSource"
      @update:active="setActiveSource"
    />

    <!-- Loading state -->
    <div v-if="loading" class="status">
      <div class="spinner"></div>
      <p>Loading trending data...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="status error">
      <p>Failed to load data: {{ error }}</p>
      <button class="retry-btn" @click="retry">Retry</button>
    </div>

    <!-- GitHub repos -->
    <div
      v-else-if="dailyData?.github && activeSource === 'github'"
      class="card-grid"
    >
      <TrendingCard
        v-for="repo in dailyData.github.repos"
        :key="repo.fullName"
        :repo="repo"
      />
    </div>

    <!-- Product Hunt posts -->
    <div
      v-else-if="dailyData?.productHunt && activeSource === 'productHunt'"
      class="card-grid"
    >
      <ProductHuntCard
        v-for="post in dailyData.productHunt.posts"
        :key="post.url || post.name"
        :post="post"
      />
    </div>

    <!-- Hacker News stories -->
    <div
      v-else-if="dailyData?.hackerNews && activeSource === 'hackerNews'"
      class="card-grid"
    >
      <HackerNewsCard
        v-for="story in dailyData.hackerNews.stories"
        :key="story.title + story.author"
        :story="story"
      />
    </div>

    <!-- Empty state -->
    <div v-else-if="!loading && dailyData" class="status empty">
      <p>No data available for this source.</p>
    </div>
  </div>
</template>

<style scoped>
.daily-view {
  padding: 32px 24px 64px;
  max-width: 960px;
  margin: 0 auto;
}
.page-header {
  margin-bottom: 8px;
}
.page-header h1 {
  margin: 0 0 4px;
  font-size: 32px;
  letter-spacing: -0.5px;
  color: var(--text-h);
}
.page-subtitle {
  font-size: 14px;
  color: var(--text);
  margin: 0 0 16px;
}
.card-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.status {
  text-align: center;
  padding: 80px 20px;
  color: var(--text);
}
.status p {
  font-size: 16px;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.retry-btn {
  margin-top: 12px;
  padding: 8px 20px;
  border-radius: 6px;
  border: 1px solid var(--accent);
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
}
.retry-btn:hover {
  background: var(--accent);
  color: #fff;
}

@media (max-width: 640px) {
  .daily-view {
    padding: 20px 12px 48px;
  }
  .page-header h1 {
    font-size: 26px;
  }
}
</style>
