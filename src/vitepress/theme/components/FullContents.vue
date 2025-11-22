<script setup>
import { useData } from 'vitepress'
import { computed } from 'vue'

const { theme } = useData()

const sections = computed(() => {
  if (!theme.value || !theme.value.sidebar) return []
  return theme.value.sidebar
})

function renderItems(items, depth = 0) {
  return items
}
</script>

<template>
  <div class="full-contents">
    <div v-for="item in sections" :key="item.text" class="section">
      <h3 v-if="item.text" class="section-title">
        <a v-if="item.link" :href="item.link">{{ item.text }}</a>
        <span v-else>{{ item.text }}</span>
      </h3>
      <ul v-if="item.items && item.items.length > 0" class="section-items">
        <li v-for="child in item.items" :key="child.link || child.text">
          <a v-if="child.link" :href="child.link">{{ child.text }}</a>
          <span v-else>{{ child.text }}</span>
          <ul v-if="child.items && child.items.length > 0" class="subsection-items">
            <li v-for="subchild in child.items" :key="subchild.link || subchild.text">
              <a v-if="subchild.link" :href="subchild.link">{{ subchild.text }}</a>
              <span v-else>{{ subchild.text }}</span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.full-contents {
  margin: 1.5rem 0;
  padding: 0.5rem 1rem 0.75rem 1rem;
  background-color: var(--vp-c-bg-soft);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.section {
  margin-bottom: 1.5rem;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0;
  margin-bottom: 0.5rem;
  padding-top: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-title a {
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.2s;
}

.section-title a:hover {
  color: var(--vp-c-brand-1);
}

.section-items {
  margin: 0;
  padding-left: 1.5rem;
  list-style: disc;
}

.section-items > li {
  margin: 0.4rem 0;
  line-height: 1.5;
}

.section-items a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-size: 0.9375rem;
  transition: color 0.2s;
}

.section-items a:hover {
  color: var(--vp-c-brand-2);
  text-decoration: underline;
}

.subsection-items {
  margin: 0.25rem 0 0 0;
  padding-left: 1.5rem;
  list-style: circle;
}

.subsection-items li {
  margin: 0.25rem 0;
  font-size: 0.875rem;
}

.subsection-items a {
  font-size: 0.875rem;
}
</style>
