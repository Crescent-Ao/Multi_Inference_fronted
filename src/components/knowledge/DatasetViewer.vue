<template>
  <n-modal
    :show="visible"
    preset="card"
    class="dataset-viewer"
    :style="{
      width: '95vw',
      maxWidth: '1800px',
      height: '95vh'
    }"
    @update:show="handleVisibleChange"
  >
    <div class="viewer-container">
      <!-- 数据集信息头部 -->
      <div class="dataset-header">
        <div class="header-main">
          <div class="title-section">
            <h1>{{ dataset.name }}</h1>
            <div class="meta-info">
              <span>作者：{{ dataset.author }}</span>
              <span>图像数量：{{ dataset.stats?.totalImages }}</span>
              <span>分辨率：{{ dataset.stats?.resolution }}</span>
              <span>创建日期：{{ dataset.stats?.dateCreated }}</span>
            </div>
          </div>
          <div class="tags-section">
            <n-tag
              v-for="tag in dataset.tags"
              :key="tag"
              :bordered="false"
              size="small"
            >
              {{ tag }}
            </n-tag>
          </div>
        </div>
        <div class="description">{{ dataset.description }}</div>
        <div class="categories">
          <span class="category-label">数据类别：</span>
          <n-tag
            v-for="category in dataset.stats?.categories"
            :key="category"
            :bordered="false"
            type="success"
            size="small"
          >
            {{ category }}
          </n-tag>
        </div>
      </div>

      <!-- 图片展示区域 -->
      <div class="images-container">
        <div class="images-grid">
          <div
            v-for="(image, index) in images"
            :key="index"
            class="image-card"
          >
            <n-image
              :src="image"
              object-fit="cover"
              class="image-preview"
              :preview-src="image"
            />
          </div>
        </div>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { NModal, NTag, NImage } from 'naive-ui'
import type { DatasetExample } from '@/data/datasetExamples'

const props = defineProps<{
  visible: boolean
  dataset: DatasetExample
}>()

const emit = defineEmits(['update:visible'])
const images = ref<string[]>([])
const imagesContainerRef = ref<HTMLElement | null>(null)

// 计算模态框的高度
const computedHeight = computed(() => {
  if (!images.value.length) return '95vh'
  
  // 计算需要的行数
  const columns = Math.floor((window.innerWidth * 0.95) / 224) // 200px + 24px gap
  const rows = Math.ceil(images.value.length / columns)
  
  // 计算总高度：头部高度 + 图片行高 + padding + margins
  const headerHeight = 200 // 预估头部高度
  const rowHeight = 184 // 160px 图片高度 + 24px gap
  const totalHeight = headerHeight + (rows * rowHeight) + 48 // 48px for padding
  
  // 返回计算后的高度，但不超过95vh
  return `min(${totalHeight}px, 95vh)`
})

// 处理可见性变化
const handleVisibleChange = (value: boolean) => {
  emit('update:visible', value)
}

// 加载图片
onMounted(async () => {
  try {
    // 这里需要根据你的实际情况修改图片加载逻辑
    const imageContext = import.meta.glob('/src/data/DIOR-R/**/*.{jpg,jpeg,png}', { eager: true })
    images.value = Object.values(imageContext).map((module: any) => module.default)
  } catch (error) {
    console.error('Failed to load images:', error)
  }
})
</script>

<style scoped>
.dataset-viewer {
  display: flex;
  flex-direction: column;
  background: #fff;
}

.viewer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: -20px;
  background: #fff;
}

.dataset-header {
  padding: 24px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
  background: #fff;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.title-section h1 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 500;
}

.meta-info {
  color: #666;
  font-size: 14px;
}

.meta-info span {
  margin-right: 24px;
}

.description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.categories {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-label {
  font-size: 14px;
  color: #666;
}

.images-container {
  flex: 1;
  overflow: hidden;
  padding: 24px;
  background: #fff;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
  overflow-y: auto;
  background: #fff;
  min-height: 100%;
  padding-right: 8px;  /* 为滚动条预留空间 */
}

.image-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  height: 160px;
}

.image-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 自定义滚动条样式 */
.images-grid::-webkit-scrollbar {
  width: 8px;
}

.images-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.images-grid::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.images-grid::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* 确保图片预览在视口范围内 */
:deep(.n-image-preview-container) {
  max-height: 100vh !important;
  max-width: 100vw !important;
}

/* 确保滚动条区域也有背景色 */
:deep(.n-card) {
  background: #fff;
}

:deep(.n-modal) {
  background: #fff;
}
</style> 