<script setup lang="ts">
import type { SourceKey } from '../composables/useDailyData'

defineProps<{
  sources: SourceKey[]
  active: SourceKey
}>()

const emit = defineEmits<{
  'update:active': [key: SourceKey]
}>()

const labelMap: Record<SourceKey, { label: string; short: string }> = {
  github: { label: 'GitHub', short: 'GH' },
  productHunt: { label: 'Product Hunt', short: 'PH' },
  hackerNews: { label: 'Hacker News', short: 'HN' },
}
</script>

<template>
  <nav class="source-tabs">
    <button
      v-for="src in sources"
      :key="src"
      class="tab"
      :class="{ active: src === active }"
      @click="emit('update:active', src)"
    >
      <span class="tab-icon" v-if="src === 'github'">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
      </span>
      <span class="tab-icon" v-else-if="src === 'productHunt'">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm8-3.5a.5.5 0 01.5.5v3a.5.5 0 01-.5.5H6v-3a.5.5 0 01.5-.5H8zM6 9.5h2.5A2.5 2.5 0 0011 7a2.5 2.5 0 00-2.5-2.5H6a.5.5 0 00-.5.5v4a.5.5 0 00.5.5z"/>
        </svg>
      </span>
      <span class="tab-icon" v-else>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.227 9.48c-.113.49-.017.87.084 1.036.263.086.585-.064.858-.386a3.17 3.17 0 00.468-.799c.257-.636.2-1.133-.054-1.221-.287-.1-.823.464-1.356 1.37zM13.691.557a3.005 3.005 0 00-2.09.682C9.23 3.3 6.65 4.5 5.22 5.38c-.71.438-1.579.88-2.32 1.56-.562.516-.972 1.27-.93 2.085.042.817.5 1.5 1.08 2.086.414.414.963.774 1.773.828.788.052 1.588-.282 2.22-.665 1.543-.94 2.9-1.84 4.27-2.8 1.14-.802 2.144-1.7 2.612-2.807.443-1.05.308-2.28-.37-3.066-.67-.78-1.634-1.08-2.564-1.094z"/>
        </svg>
      </span>
      <span class="tab-label">{{ labelMap[src]?.label || src }}</span>
    </button>
  </nav>
</template>

<style scoped>
.source-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  padding: 4px;
  background: var(--accent-bg);
  border-radius: 10px;
  border: 1px solid var(--border);
}
.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  font-family: inherit;
  white-space: nowrap;
}
.tab:hover {
  color: var(--text-h);
  background: var(--bg);
}
.tab.active {
  color: var(--accent);
  background: var(--bg);
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.tab-icon {
  display: flex;
  align-items: center;
  opacity: 0.7;
}
.tab.active .tab-icon {
  opacity: 1;
}

@media (max-width: 480px) {
  .tab {
    padding: 8px 12px;
    font-size: 13px;
  }
  .tab-label {
    display: none;
  }
}
</style>
