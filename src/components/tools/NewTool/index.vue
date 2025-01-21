<template>
  <tool-card 
    :config="toolConfig" 
    @click="showModal = true"
  />
  
  <tool-modal
    v-if="showModal"
    :config="toolConfig"
    @close="showModal = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ToolCard from '@/components/common/ToolCard.vue'
import ToolModal from './modal.vue'
import { toolConfig } from './config'

const showModal = ref(false)
</script> 