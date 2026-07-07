<script setup lang="ts">
const props = defineProps<{
  allDates: string[]
  currentDate: string
}>()

const emit = defineEmits<{
  'update:currentDate': [date: string]
}>()

function currentIndex(): number {
  return props.allDates.indexOf(props.currentDate)
}

function prevDate(): string | null {
  const idx = currentIndex()
  return idx < props.allDates.length - 1 ? props.allDates[idx + 1] : null
}

function nextDate(): string | null {
  const idx = currentIndex()
  return idx > 0 ? props.allDates[idx - 1] : null
}

function goPrev() {
  const d = prevDate()
  if (d) emit('update:currentDate', d)
}

function goNext() {
  const d = nextDate()
  if (d) emit('update:currentDate', d)
}

function hasPrev(): boolean {
  return prevDate() !== null
}

function hasNext(): boolean {
  return nextDate() !== null
}

function formatLabel(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatShort(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const isoToday = today.toISOString().slice(0, 10)
  const isoYest = yesterday.toISOString().slice(0, 10)

  if (iso === isoToday) return 'Today'
  if (iso === isoYest) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="date-nav">
    <button
      class="nav-btn"
      :disabled="!hasPrev()"
      @click="goPrev"
      aria-label="Previous date"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <div class="date-info">
      <span class="date-main">{{ formatLabel(currentDate) }}</span>
      <span class="date-meta">
        {{ formatShort(currentDate) }}
        <template v-if="allDates.length > 1">
          · {{ currentIndex() + 1 }} / {{ allDates.length }}
        </template>
      </span>
    </div>

    <button
      class="nav-btn"
      :disabled="!hasNext()"
      @click="goNext"
      aria-label="Next date"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.date-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: var(--accent-bg);
  border-radius: 10px;
  border: 1px solid var(--border);
}
.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-h);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  flex-shrink: 0;
}
.nav-btn:hover:not(:disabled) {
  border-color: var(--accent-border);
  background: var(--accent-bg);
}
.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.date-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
}
.date-main {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-h);
  white-space: nowrap;
}
.date-meta {
  font-size: 13px;
  color: var(--text);
}

@media (max-width: 480px) {
  .date-nav {
    gap: 8px;
    padding: 10px 12px;
  }
  .date-main {
    font-size: 15px;
  }
}
</style>
