<template>
  <div class="tool-card" @click="$emit('click')">
    <div class="tool-header">
      <n-avatar 
        :round="false" 
        class="tool-icon"
        :src="getIconSource"
        :color="transparent"
        @error="handleIconError"
      />
      <div class="tool-info">
        <div class="tool-title">{{ tool.name }}</div>
        <div class="tool-author">{{ tool.author }}</div>
      </div>
    </div>
    <div class="tool-description">{{ tool.description }}</div>
    <div class="tool-tags">
      <n-tag 
        v-for="tag in tool.tags" 
        :key="tag" 
        size="small"
        :bordered="false"
        class="tag"
      >
        {{ tag }}
      </n-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NAvatar, NTag } from 'naive-ui'
import type { Component } from 'vue'

const props = defineProps<{
  tool: {
    icon: string | Component
    name: string
    author: string
    description: string
    tags: string[]
  }
}>()

// 计算图标源
const getIconSource = computed(() => {
  const { icon } = props.tool
  
  if (typeof icon === 'string') {
    return icon
  }
  
  return ''
})

const handleIconError = () => {
  console.warn(`图标加载失败: ${props.tool.icon}`)
}
</script>

<style scoped>
.tool-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  transition: all 0.3s;
  border: 1px solid #eee;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: transparent;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.tool-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.tool-info {
  flex: 1;
  min-width: 0;
}

.tool-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-author {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: #f5f5f5;
  color: #666;
}
</style> 