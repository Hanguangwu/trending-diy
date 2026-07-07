<script setup lang="ts">
export interface HNStory {
  rank: number
  title: string
  url: string
  score: number
  comments: number
  author: string
}

defineProps<{ story: HNStory }>()

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toLocaleString()
}
</script>

<template>
  <article class="hn-card">
    <div class="card-rank">#{{ story.rank }}</div>
    <div class="card-body">
      <h3 class="story-title">
        <a :href="story.url" target="_blank" rel="noopener noreferrer">
          {{ story.title }}
        </a>
      </h3>
      <div class="story-meta">
        <span class="stat" title="Points">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="18 15 12 9 6 15" />
          </svg>
          {{ formatCount(story.score) }} points
        </span>
        <span class="stat" title="Comments">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          {{ formatCount(story.comments) }} comments
        </span>
        <span class="stat author" title="Author">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {{ story.author }}
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.hn-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.hn-card:hover {
  border-color: var(--accent-border);
  box-shadow: var(--shadow);
}
.card-rank {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
  font-family: var(--mono);
  min-width: 32px;
  line-height: 1.5;
}
.card-body {
  flex: 1;
  min-width: 0;
}
.story-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
}
.story-title a {
  color: var(--text-h);
  text-decoration: none;
}
.story-title a:hover {
  color: var(--accent);
  text-decoration: underline;
}
.story-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  font-size: 13px;
  color: var(--text);
}
.stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.stat svg {
  opacity: 0.6;
  flex-shrink: 0;
}
.author {
  opacity: 0.8;
}
</style>
