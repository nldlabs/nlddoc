<script setup>
import { useData } from 'vitepress'
import { computed } from 'vue'

const { page, theme } = useData()

const subPages = computed(() => {
  if (!page.value || !theme.value) return []
  
  const currentPath = page.value.relativePath.replace(/\/index\.md$/, '').replace(/\.md$/, '')
  const sidebar = theme.value.sidebar
  
  if (!sidebar) return []
  
  // Find current page's children in sidebar
  function findChildren(items, path) {
    for (const item of items) {
      // Check if this item's link matches current path
      if (item.link && item.link.replace(/^\//, '').replace(/\/$/, '') === path) {
        return item.items || []
      }
      // Check if path starts with this item (folder match)
      if (item.items) {
        // If this is a folder that matches our path
        const itemPath = item.link?.replace(/^\//, '').replace(/\/$/, '')
        if (itemPath === path) {
          return item.items || []
        }
        // Recursively search children
        const found = findChildren(item.items, path)
        if (found.length > 0) return found
      }
    }
    return []
  }
  
  const children = findChildren(sidebar, currentPath)
  return children.filter(child => child.link) // Only include items with links
})
</script>

<template>
  <div v-if="subPages.length > 0" class="sub-pages">
    <h2>Pages in this section</h2>
    <ul>
      <li v-for="page in subPages" :key="page.link">
        <a :href="page.link">{{ page.text }}</a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.sub-pages {
  margin: 1.5rem 0;
  padding: 0.5rem 1rem 0.75rem 1rem;
  background-color: var(--vp-c-bg-soft);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.sub-pages h2 {
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

.sub-pages ul {
  margin: 0;
  padding-left: 1.5rem;
}

.sub-pages li {
  margin: 0.4rem 0;
  line-height: 1.5;
}

.sub-pages a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-size: 0.9375rem;
  transition: color 0.2s;
}

.sub-pages a:hover {
  color: var(--vp-c-brand-2);
  text-decoration: underline;
}
</style>
