<template>
  <div class="workspace">
    <!-- 其他内容 -->
    <image-uploader v-model:image="selectedImage" />
    <!-- 其他内容 -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ImageUploader from '@/components/workspace/ImageUploader.vue'

const selectedImage = ref(null)
</script> 