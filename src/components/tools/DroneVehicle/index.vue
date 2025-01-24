<template>
  <!-- 卡片视图 -->
  <tool-card 
    :tool="mergedConfig"
    @click="showModal = true"
  />
  
  <!-- 弹出框 -->
  <tool-modal
    v-if="showModal"
    :tool="mergedConfig"
    @close="showModal = false"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolCard from './card.vue'
import ToolModal from './modal.vue'
import { toolConfig } from './config'
import type { Component } from 'vue'

// 定义完整的 props 类型
interface ToolProps {
  name?: string
  author?: string
  description?: string
  icon?: string | Component
  tags?: string[]
  version?: string
  createTime?: string
  updateTime?: string
  category?: string
  apiUrl?: string
}

const props = withDefaults(defineProps<ToolProps>(), {
  name: toolConfig.name,
  author: toolConfig.author,
  description: toolConfig.description,
  icon: toolConfig.icon,
  tags: () => toolConfig.tags,
  version: toolConfig.version,
  createTime: toolConfig.createTime,
  updateTime: toolConfig.updateTime,
  category: toolConfig.category,
  apiUrl: toolConfig.apiUrl
})

// 合并配置
const mergedConfig = computed(() => ({
  ...toolConfig,
  name: props.name,
  author: props.author,
  description: props.description,
  icon: props.icon,
  tags: props.tags,
  version: props.version,
  createTime: props.createTime,
  updateTime: props.updateTime,
  category: props.category,
  apiUrl: props.apiUrl
}))

const showModal = ref(false)
</script>