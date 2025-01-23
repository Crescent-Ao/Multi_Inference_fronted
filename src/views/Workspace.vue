<template>
  <div class="page-container">
    <global-header />
    
    <!-- 工作室子导航 -->
    <div class="sub-nav">
      <div class="sub-nav-content">
        <div class="category-nav">
          <n-button
            v-for="category in categories"
            :key="category.key"
            :class="['category-button', { active: activeCategory === category.key }]"
            text
            @click="handleCategoryClick(category.key)"
          >
            <template #icon>
              <n-icon>
                <component :is="category.icon" />
              </n-icon>
            </template>
            {{ category.label }}
          </n-button>
        </div>
        <div class="right">
          <n-input 
            v-model:value="searchQuery" 
            placeholder="搜索" 
            round
            @input="handleSearch"
            @keydown.enter="handleSearch"
          >
            <template #prefix>
              <n-icon><Search /></n-icon>
            </template>
          </n-input>
        </div>
      </div>
    </div>

    <!-- 卡片内容区域 -->
    <div class="content">
      <div class="content-wrapper">
        <div v-if="filteredTools.length > 0" class="tools-row">
          <div v-for="tool in filteredTools" :key="tool.id" class="tool-item">
            <component 
              :is="tool.component" 
              :tags="tool.tags"
              :apiUrl="tool.apiUrl"
              :author="tool.author"
              :icon="tool.icon"
            />
          </div>
        </div>
        <div v-else class="no-results">
          <n-empty description="没有找到相关工具">
            <template #extra>
              <n-button 
                size="small" 
                @click="clearSearch"
              >
                清除搜索
              </n-button>
            </template>
          </n-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { 
  NButton, 
  NInput, 
  NIcon, 
  NAvatar,
  NText
} from 'naive-ui'
import { 
  Search,
  Cube,
  Book,
  Hammer,
  GridOutline, 
  ScanOutline, 
  ColorWandOutline,
  VideocamOutline
} from '@vicons/ionicons5'
import Object_Detection from '@/components/tools/DroneVehicle/index.vue'
import { toolConfig } from '@/components/tools/DroneVehicle/config'
import SemanticSegmentation from '@/components/tools/Semantic_Segmentation/index.vue'
import GlobalHeader from '@/components/layout/GlobalHeader.vue'

// 类别配置
const categories = [
  { 
    key: 'all', 
    label: '全部',
    icon: GridOutline 
  },
  { 
    key: 'detection', 
    label: '目标检测',
    icon: ScanOutline 
  },
  { 
    key: 'segmentation', 
    label: '语义分割',
    icon: ColorWandOutline 
  },
  { 
    key: 'tracking', 
    label: '视频跟踪',
    icon: VideocamOutline 
  }
]

const activeCategory = ref('all')
const userAvatar = ref('')

const handleCategoryClick = (key: string) => {
  activeCategory.value = key
}

// 注册工具
const registeredTools = [
  {
    id: 1,
    component: Object_Detection,
    tags: ['目标检测', '红外图像',"DAIK"],
    apiUrl: 'http://localhost:8000',
    author: 'Crescent',
    icon: new URL('@/assets/DroneVehicle.png', import.meta.url).href
  },
  {
    id: 2,
    component: Object_Detection,
    category: 'detection',
    tags: ['目标检测', '无人机'],
    apiUrl: 'http://localhost:8000',
    author: 'Crescent',
    icon: new URL('@/assets/DroneVehicle.png', import.meta.url).href
  },
  {
    id: 3,
    component: SemanticSegmentation,
    category: 'segmentation',
    tags: ['语义分割', '无人机'],
    apiUrl: 'http://localhost:8000',
    author: 'DAIK',
    icon: new URL('@/assets/segmentation.png', import.meta.url).href
  },
  {
    id: 4,
    component: Object_Detection,
    category: 'segmentation',
    tags: ['语义分割', '无人机'],
    apiUrl: 'http://localhost:8000',
  },
  {
    id: 5,
    component: Object_Detection,
    category: 'tracking',
    tags: ['视频跟踪', '红外图像'],
    apiUrl: 'http://localhost:8000',
  },
  {
    id: 6,
    component: Object_Detection,
    category: 'tracking',
    tags: ['视频跟踪', '无人机'],
    apiUrl: 'http://localhost:8000',
  },
  {
    id: 7,
    component: Object_Detection,
    category: 'detection',
    tags: ['目标检测', '低光照']
  },
  {
    id: 8,
    component: Object_Detection,
    category: 'segmentation',
    tags: ['语义分割', '低光照'],
    apiUrl: 'http://localhost:8000',
  },
  {
    id: 9,
    component: Object_Detection,
    category: 'segmentation',
    tags: ['语义分割', '低光照'],
    apiUrl: 'http://localhost:8000',
  }
]

// 添加搜索状态
const searchQuery = ref('')

// 修改筛选逻辑，加入搜索功能
const filteredTools = computed(() => {
  let tools = registeredTools

  // 如果有搜索关键词，先进行搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    tools = tools.filter(tool => {
      // 搜索条件：标签匹配
      const tagMatch = tool.tags.some(tag => 
        tag.toLowerCase().includes(query)
      )

      // 从工具配置中获取名称和描述
      const nameMatch = toolConfig.name.toLowerCase().includes(query)
      const descMatch = toolConfig.description.toLowerCase().includes(query)
      const authorMatch = toolConfig.author.toLowerCase().includes(query)

      // 任一条件匹配即可
      return tagMatch || nameMatch || descMatch || authorMatch
    })
  }

  // 再根据分类进行过滤
  if (activeCategory.value !== 'all') {
    tools = tools.filter(tool => tool.category === activeCategory.value)
  }

  return tools
})

// 可选：添加防抖处理
let searchTimeout: NodeJS.Timeout | null = null

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    // 搜索已经通过 computed 自动处理
    searchTimeout = null
  }, 300)
}

// 添加清除搜索函数
const clearSearch = () => {
  searchQuery.value = ''
}
</script>

<style scoped>
/* 整个页面容器 */
.page-container {
  min-height: 100vh;
  background-color: #f5f6f7; /* 整个页面使用浅灰色背景 */
}

/* 子导航样式 */
.sub-nav {
  width: 100%;
  padding: 16px 0;
  background-color: #f5f6f7; /* 改为与页面相同的浅灰色背景 */
  border-bottom: 1px solid #eee;
}

.sub-nav-content {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-nav {
  display: flex;
  gap: 8px;
  padding: 0;
  margin: 0;
}

.category-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 4px;
  transition: all 0.3s;
  font-weight: 400;
  font-size: 14px;
}

.category-button .n-icon {
  font-size: 14px;
}

.category-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.category-button.active {
  background-color: #e6f4ef;
  color: #18a058;
  font-weight: 500;
}

.category-button.active .n-icon {
  color: #18a058;
  fill: currentColor;
}

.content {
  width: 100%;
  padding-top: 16px;
}

.content-wrapper {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 32px;
}

.tools-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0;
}

.tool-item {
  width: calc((100% - 36px) / 4);
  margin: 0;
  padding: 0;
}

.tool-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  transition: all 0.3s;
  border: 1px solid #eee;
  cursor: pointer;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.tool-header {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
}

.tool-icon {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  flex-shrink: 0;
}

.tool-info {
  flex: 1;
  min-width: 0;
}

.tool-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2329;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.author {
  font-size: 12px;
  color: #86909c;
}

.description {
  font-size: 13px;
  color: #4e5969;
  margin: 18px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tool-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.tag {
  background: #f2f3f5;
  color: #4e5969;
  font-size: 12px;
  padding: 2px 8px;
  height: 20px;
  line-height: 16px;
  border-radius: 4px;
}

.tag .n-icon {
  font-size: 12px;
  margin-right: 4px;
}

/* 弹出层样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0 0 12px 12px; /* 只保留底部圆角 */
  width: 96%;
  height: 96vh;
  max-width: none;
  position: relative;
  animation: modal-in 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px 32px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  background: white;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 180px; /* 稍微减少最小宽度 */
  white-space: nowrap;
}

.tool-description {
  flex: 1;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 24px; /* 使用 padding 代替 margin */
}

.close-button {
  margin-left: auto; /* 将关闭按钮推到最右边 */
}

.tool-icon {
  width: 32px;
  height: 32px;
}

.modal-header .n-button {
  margin-top: 8px;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.image-containers {
  display: flex;
  gap: 24px;
  height: calc(90vh - 200px);
  padding: 16px 24px;
}

.image-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
  overflow: hidden;
  height: 100%;
}

.image-header {
  padding: 8px 16px;
  border-bottom: 1px solid #eee;
}

.image-header .title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.2;
}

.image-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f9f9f9;
  padding: 0;
  min-height: 360px;
}

.clickable {
  cursor: pointer;
  transition: all 0.3s;
}

.clickable:hover {
  background: #f5f5f5;
}

.can-download:hover {
  background: #f0f9f4;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
  height: 100%;
}

.placeholder-icon {
  color: #ccc;
}

.placeholder p {
  margin: 0;
  font-size: 14px;
  color: #999;
}

/* 拖拽状态样式 */
.image-content.dragover {
  background: #f0f9f4;
  border: 2px dashed #18a058;
}

/* 修改上传区域样式 */
.n-upload {
  width: 100%;
  height: 100%;
  display: flex;
  flex: 1;
}

/* 修改上传组件样式 */
:deep(.n-upload) {
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
}

:deep(.n-upload-trigger) {
  width: 100%;
  height: 100%;
}

.control-panel {
  margin-top: 16px;
  padding: 16px 24px;
  background: white;
  border-radius: 8px;
  border: 1px solid #eee;
}

.control-row {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px; /* 添加底部间距 */
}

.control-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.label {
  min-width: 60px;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}

:deep(.n-select) {
  flex: 1;
  min-width: 0;
}

:deep(.n-input-number) {
  flex: 1;
  min-width: 0;
}

:deep(.n-select .n-base-selection) {
  min-width: 80px;
}

:deep(.n-input-number-input) {
  text-align: left;
  min-width: 80px;
}

/* 添加按钮行样式 */
.button-row {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-top: 16px;
  width: 100%;
}

.action-button {
  flex: 1;
  height: 40px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.85);
}

.action-button:active,
.action-button:focus {
  color: rgba(255, 255, 255, 0.85) !important; /* 强制保持颜色 */
}

.inference-button {
  background: linear-gradient(135deg, #36ad6a 0%, #4cd389 100%);
}

.inference-button:hover,
.inference-button:active,
.inference-button:focus {
  background: linear-gradient(135deg, #4cd389 0%, #36ad6a 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(54, 173, 106, 0.2);
  color: #ffffff !important;
}

.download-button {
  background: linear-gradient(135deg, #4098fc 0%, #60aeff 100%);
}

.download-button:hover,
.download-button:active,
.download-button:focus {
  background: linear-gradient(135deg, #60aeff 0%, #4098fc 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 152, 252, 0.2);
  color: #ffffff !important;
}

:deep(.action-button .n-icon) {
  font-size: 18px;
  margin-right: 8px;
  opacity: 0.85; /* 图标初始状态也略微透明 */
  transition: opacity 0.3s ease; /* 添加图标透明度过渡 */
}

.action-button:hover :deep(.n-icon) {
  opacity: 1; /* 悬停时图标完全不透明 */
}

/* 添加动画效果 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

.action-button:active {
  animation: pulse 0.3s ease;
}

.tool-info-section {
  padding: 16px 32px;
  border-bottom: 1px solid #eee;
  background: #f9f9f9;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  gap: 48px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-item .label {
  font-size: 14px;
  color: #666;
  min-width: 48px;
}

.info-item .value {
  font-size: 14px;
  color: #333;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.info-tag {
  background: #f0f0f0;
  color: #666;
}

.description-row {
  display: flex;
  gap: 12px;
}

.description-row .label {
  font-size: 14px;
  color: #666;
  min-width: 48px;
}

.description {
  flex: 1;
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.content-layout {
  display: flex;
  gap: 24px;
  height: 100%;
}

.image-section {
  flex: 2; /* 占据更多空间 */
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-info-section {
  flex: 1; /* 占据较少空间 */
  padding: 0 16px;
}

.info-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #eee;
}

.info-item {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.info-item .value {
  font-size: 14px;
  color: #333;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.info-tag {
  background: #f0f0f0;
  color: #666;
}

.description {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

/* 添加搜索框样式 */
.right .n-input {
  width: 240px;
}

/* 添加无结果提示样式 */
.no-results {
  width: 100%;
  padding: 40px 0;
  text-align: center;
  color: #666;
  font-size: 14px;
}

/* 调整子导航搜索框样式 */
.sub-nav .right .n-input {
  width: 240px;
}

/* 移除顶部导航搜索框样式 */
.nav-header .right {
  gap: 16px;
}
</style> 