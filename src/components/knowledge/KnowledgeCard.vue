<template>
  <div class="tool-card" @click="handleClick">
    <div class="tool-header">
      <n-avatar 
        :round="false" 
        class="tool-icon"
        :color="transparent"
        :src="tool.icon"
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
  
  <document-viewer
    v-if="tool.type === 'documents'"
    v-model:visible="showViewer"
    :document="documentData"
  />

  <dataset-viewer
    v-if="tool.type === 'dataset-examples'"
    v-model:visible="showViewer"
    :dataset="tool"
    :images="datasetImages"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NIcon, NTag, NAvatar } from 'naive-ui'
import { DocumentTextOutline, ImagesOutline } from '@vicons/ionicons5'
import DocumentViewer from './DocumentViewer.vue'
import DatasetViewer from './DatasetViewer.vue'

const props = defineProps<{
  tool: {
    id: string
    name: string
    description: string
    author: string
    tags: string[]
    type: string
    icon?: string
    content: string
    toc: any[]
  }
}>()

// 根据类型选择图标
const cardIcon = computed(() => {
  switch (props.tool.type) {
    case 'documents':
      return DocumentTextOutline
    case 'dataset-examples':
      return ImagesOutline
    default:
      return DocumentTextOutline
  }
})

// 模拟从文件夹加载图片
const datasetImages = ref([
  // 这里需要实际实现从文件夹加载图片的逻辑
])

const showViewer = ref(false)

// 使用传入的数据
const documentData = computed(() => ({
  id: props.tool.id,
  title: props.tool.name,
  author: props.tool.author,
  updateTime: '2024-01-20',
  content: props.tool.content,
  toc: props.tool.toc
}))

const handleClick = () => {
  showViewer.value = true
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
  background: transparent !important;
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