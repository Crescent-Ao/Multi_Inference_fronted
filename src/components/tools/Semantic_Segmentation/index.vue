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

// 定义 props
const props = defineProps<ToolProps>()

// 合并配置
const mergedConfig = computed(() => ({
  ...toolConfig,
  ...(props.name && { name: props.name }),
  ...(props.author && { author: props.author }),
  ...(props.description && { description: props.description }),
  ...(props.icon && { icon: props.icon }),
  ...(props.tags && { tags: props.tags }),
  ...(props.version && { version: props.version }),
  ...(props.createTime && { createTime: props.createTime }),
  ...(props.updateTime && { updateTime: props.updateTime }),
  ...(props.category && { category: props.category }),
  ...(props.apiUrl && { apiUrl: props.apiUrl })
}))

const showModal = ref(false)
</script> 