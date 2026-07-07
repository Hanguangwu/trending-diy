<script setup lang="ts">
export interface Repo {
  rank: number
  author: string
  name: string
  fullName: string
  url: string
  description: string
  language: string | null
  languageColor: string | null
  starsToday: number
  totalStars: number
  forks: number
  builtBy: { username: string; avatar: string }[]
}

defineProps<{ repo: Repo }>()

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toLocaleString()
}
</script>

<template>
  <article class="trending-card">
    <div class="card-rank">#{{ repo.rank }}</div>
    <div class="card-body">
      <h3 class="repo-name">
        <a :href="repo.url" target="_blank" rel="noopener noreferrer">
          {{ repo.fullName }}
        </a>
      </h3>
      <p v-if="repo.description" class="repo-desc">{{ repo.description }}</p>
      <div class="repo-meta">
        <span v-if="repo.language" class="lang">
          <span
            class="lang-dot"
            :style="{ backgroundColor: repo.languageColor || '#888' }"
          ></span>
          {{ repo.language }}
        </span>
        <span class="stat" title="Today's stars">
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16">
            <path
              fill="currentColor"
              d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"
            />
          </svg>
          {{ formatStars(repo.starsToday) }} today
        </span>
        <span class="stat" title="Total stars">
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16">
            <path
              fill="currentColor"
              d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"
            />
          </svg>
          {{ formatStars(repo.totalStars) }}
        </span>
        <span class="stat" title="Forks">
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16">
            <path
              fill="currentColor"
              d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"
            />
          </svg>
          {{ formatStars(repo.forks) }}
        </span>
        <span v-if="repo.builtBy.length" class="built-by" title="Built by">
          <img
            v-for="user in repo.builtBy.slice(0, 5)"
            :key="user.username"
            :src="user.avatar"
            :alt="user.username"
            class="avatar"
          />
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.trending-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.trending-card:hover {
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
.repo-name {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
}
.repo-name a {
  color: var(--text-h);
  text-decoration: none;
}
.repo-name a:hover {
  color: var(--accent);
  text-decoration: underline;
}
.repo-desc {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text);
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.repo-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  font-size: 13px;
  color: var(--text);
}
.lang {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.lang-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
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
.built-by {
  display: inline-flex;
  align-items: center;
}
.avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-left: -6px;
  border: 2px solid var(--bg);
}
.avatar:first-child {
  margin-left: 0;
}
</style>
