<template>
  <div class="mermaid-wrapper">
    <div v-if="error" class="mermaid-error">
      <div class="mermaid-error-icon">⚠️</div>
      <div class="mermaid-error-content">
        <strong>Mermaid Syntax Error</strong>
        <pre>{{ error }}</pre>
      </div>
    </div>
    <div v-else ref="mermaidContainer" class="mermaid-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import mermaid from 'mermaid'

const props = defineProps({
  code: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  }
})

const mermaidContainer = ref(null)
const error = ref(null)

const renderDiagram = async () => {
  error.value = null
  
  try {
    const isDark = document.documentElement.classList.contains('dark')
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
      logLevel: 'error',
      themeVariables: isDark ? {
        // Dark mode color improvements
        primaryColor: '#3b82f6',
        primaryTextColor: '#e5e7eb',
        primaryBorderColor: '#60a5fa',
        lineColor: '#6b7280',
        secondaryColor: '#10b981',
        tertiaryColor: '#f59e0b',
        // Pie chart colors for dark mode
        pie1: '#3b82f6',
        pie2: '#10b981',
        pie3: '#f59e0b',
        pie4: '#ef4444',
        pie5: '#8b5cf6',
        pie6: '#ec4899',
        pie7: '#06b6d4',
        pie8: '#84cc16',
        pie9: '#f97316',
        pie10: '#6366f1',
        pie11: '#14b8a6',
        pie12: '#eab308'
      } : {}
    })
    
    const { svg } = await mermaid.render(props.id, decodeURIComponent(props.code))
    if (mermaidContainer.value) {
      mermaidContainer.value.innerHTML = svg
    }
  } catch (err) {
    error.value = err.message || 'Unknown Mermaid error'
    console.error('Mermaid render error:', err)
  }
}

onMounted(() => {
  renderDiagram()
})

// Watch for theme changes
if (typeof window !== 'undefined') {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        renderDiagram()
      }
    })
  })
  
  onMounted(() => {
    observer.observe(document.documentElement, { attributes: true })
  })
}
</script>

<style scoped>
.mermaid-wrapper {
  margin: 1em 0;
}

.mermaid-error {
  display: flex;
  gap: 12px;
  background-color: #fef3cd;
  border: 1px solid #f0ad4e;
  border-radius: 8px;
  padding: 16px;
  color: #8a6d3b;
}

.dark .mermaid-error {
  background-color: #3e3020;
  border-color: #8a6d3b;
  color: #f0ad4e;
}

.mermaid-error-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.mermaid-error-content {
  flex: 1;
}

.mermaid-error-content strong {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
}

.mermaid-error-content pre {
  margin: 0;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.mermaid-container {
  display: flex;
  justify-content: center;
}

.mermaid-container :deep(svg) {
  max-width: 100%;
  height: auto;
}
</style>
