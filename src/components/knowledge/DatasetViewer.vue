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
              :preview-src="image"
              object-fit="cover"
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
import { useMessage } from 'naive-ui'

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
    // 添加.tif到支持的文件类型中
    const imagePattern = `${props.dataset.imagePath}**/*.{jpg,jpeg,png,tif}`
    const imageContext = import.meta.glob('/src/data/**/*.{jpg,jpeg,png,tif}', { eager: true })
    
    // 过滤出匹配指定路径的图片
    images.value = Object.entries(imageContext)
      .filter(([path]) => path.startsWith(props.dataset.imagePath))
      .map(([, module]: [string, any]) => module.default)
      
  } catch (error) {
    console.error('Failed to load images:', error)
  }
})

// 自定义全屏预览
const showFullScreenImage = (imageSrc: string) => {
  const img = new Image()
  img.src = imageSrc
  img.onload = () => {
    const previewDiv = document.createElement('div')
    previewDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `
    
    const previewImg = document.createElement('img')
    previewImg.src = imageSrc
    previewImg.style.cssText = `
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    `
    
    previewDiv.appendChild(previewImg)
    document.body.appendChild(previewDiv)
    
    // 点击关闭预览
    previewDiv.onclick = () => {
      document.body.removeChild(previewDiv)
    }
  }
}
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
  max-height: 95vh;  /* 限制最大高度 */
}

.dataset-header {
  padding: 24px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;  /* 防止头部被压缩 */
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
  overflow: hidden;  /* 隐藏容器自身的滚动条 */
  padding: 24px;
  background: #fff;
  min-height: 0;  /* 重要：允许内容区域收缩 */
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
  overflow-y: auto;  /* 只在网格内滚动 */
  height: 100%;  /* 填充容器高度 */
  padding-right: 8px;  /* 为滚动条预留空间 */
  padding-bottom: 24px;  /* 为最后一行添加底部间距 */
}

.image-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  height: 160px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  cursor: pointer;
}

.image-card :deep(img) {
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

/* 移除任何可能的外层容器padding */
:deep(.n-modal-body-wrapper),
:deep(.n-modal-body) {
  padding: 0 !important;
  margin: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

/* 确保滚动条区域也有背景色 */
:deep(.n-card) {
  background: #fff;
}

:deep(.n-modal) {
  background: #fff;
}

/* 修改预览样式以移除留白 */
:deep(.n-image-preview-container) {
  width: auto !important;
  height: auto !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  background: rgba(0, 0, 0, 0.9) !important;
}

:deep(.n-image-preview-img-container) {
  width: auto !important;
  height: auto !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.n-image-preview-img) {
  max-width: 100vw !important;
  max-height: 100vh !important;
  object-fit: contain !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* 移除预览工具栏的边距 */
:deep(.n-image-preview-toolbar) {
  margin: 0 !important;
  padding: 8px !important;
}
</style> 