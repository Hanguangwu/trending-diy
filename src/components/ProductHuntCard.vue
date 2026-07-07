<script setup lang="ts">
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

defineProps<{ post: PHPost }>()

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toLocaleString()
}
</script>

<template>
  <article class="ph-card">
    <div class="card-rank">#{{ post.rank }}</div>
    <div class="card-body">
      <div class="card-top">
        <img
          v-if="post.thumbnail"
          :src="post.thumbnail"
          :alt="post.name"
          class="card-thumb"
          loading="lazy"
        />
        <div class="card-title-group">
          <h3 class="product-name">
            <a :href="post.url" target="_blank" rel="noopener noreferrer">
              {{ post.name }}
            </a>
          </h3>
          <p v-if="post.tagline" class="product-tagline">{{ post.tagline }}</p>
        </div>
      </div>
      <div class="product-meta">
        <span class="stat" title="Upvotes">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="18 15 12 9 6 15" />
          </svg>
          {{ formatCount(post.votes) }}
        </span>
        <span class="stat" title="Comments">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          {{ formatCount(post.comments) }}
        </span>
        <span v-if="post.makers.length" class="makers" title="Makers">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {{ post.makers.join(', ') }}
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.ph-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.ph-card:hover {
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
.card-top {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.card-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid var(--border);
}
.card-title-group {
  flex: 1;
  min-width: 0;
}
.product-name {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}
.product-name a {
  color: var(--text-h);
  text-decoration: none;
}
.product-name a:hover {
  color: var(--accent);
  text-decoration: underline;
}
.product-tagline {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.product-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  margin-top: 10px;
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
.makers {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
.makers svg {
  opacity: 0.6;
  flex-shrink: 0;
}
</style>
