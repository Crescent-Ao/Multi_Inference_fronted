<template>
  <!-- 卡片视图 -->
  <tool-card 
    :tool="{ 
      ...toolConfig, 
      tags: props.tags,
      apiUrl: props.apiUrl,
      author: props.author,
      icon: props.icon
    }"
    @click="showModal = true"
  />
  
  <!-- 弹出框 -->
  <tool-modal
    v-if="showModal"
    :tool="{ 
      ...toolConfig, 
      tags: props.tags,
      apiUrl: props.apiUrl,
      author: props.author,
      icon: props.icon
    }"
    @close="showModal = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ToolCard from './card.vue'
import ToolModal from './modal.vue'
import { toolConfig } from './config'

const props = defineProps<{
  tags?: string[]
  apiUrl: string
  author: string
  icon: string
}>()

const showModal = ref(false)
</script> 