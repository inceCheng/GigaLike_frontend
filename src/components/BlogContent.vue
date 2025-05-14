<template>
  <div class="blog-content-wrapper">
    <div class="blog-content" v-html="formattedContent"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  content: {
    type: String,
    required: true
  }
});

// Add some basic formatting if content is plain text
const formattedContent = computed(() => {
  // If content already has HTML formatting, return as is
  if (props.content.includes('<p>') || props.content.includes('<div>')) {
    return props.content;
  }
  
  // Otherwise, add basic paragraph formatting
  return props.content.split('\n\n').map(paragraph => {
    if (paragraph.trim().startsWith('#')) {
      const headerLevel = paragraph.match(/^#+/)[0].length;
      const headerContent = paragraph.replace(/^#+\s*/, '');
      return `<h${headerLevel}>${headerContent}</h${headerLevel}>`;
    }
    return `<p>${paragraph.trim()}</p>`;
  }).join('');
});
</script>

<style scoped>
.blog-content-wrapper {
  margin: 2rem 0;
}

.blog-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
}

:deep(h1), :deep(h2), :deep(h3) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: #2c3e50;
}

:deep(p) {
  margin-bottom: 1em;
}

:deep(ul), :deep(ol) {
  margin-bottom: 1em;
  padding-left: 2em;
}

:deep(a) {
  color: #3498db;
  text-decoration: underline;
}

:deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 1em 0;
}

:deep(blockquote) {
  border-left: 4px solid #e0e0e0;
  padding-left: 1rem;
  font-style: italic;
  color: #555;
  margin: 1.5rem 0;
}

:deep(pre) {
  background-color: #f6f8fa;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1.5rem 0;
}

:deep(code) {
  background-color: #f6f8fa;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: monospace;
}
</style> 