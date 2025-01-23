<template>
  <div class="image-uploader">
    <div v-if="!selectedImage" class="upload-area" @click="handleAreaClick">
      <div class="upload-hint">
        <n-icon size="48" class="upload-icon">
          <image-icon />
        </n-icon>
        <p>点击上传图片</p>
      </div>
    </div>

    <!-- 预览已选图片 -->
    <div v-else class="preview-area">
      <div class="preview-image-container">
        <img
          :src="selectedImage.url"
          :alt="selectedImage.name"
          class="preview-image"
        />
        <div class="preview-actions">
          <n-button quaternary circle @click.stop="handleRemove">
            <template #icon>
              <n-icon><close /></n-icon>
            </template>
          </n-button>
        </div>
      </div>
    </div>

    <!-- 选择来源的弹出菜单 -->
    <n-modal
      v-model:show="showSourceSelect"
      preset="dialog"
      title="选择图片来源"
      style="width: 400px"
    >
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>选择图片来源</span>
        </div>
      </template>
      <div class="source-options">
        <div class="source-option" @click="handleLocalSelect">
          <n-icon size="24"><cloud-upload /></n-icon>
          <span>本地上传</span>
        </div>
        <div class="source-option" @click="handleKnowledgeSelect">
          <n-icon size="24"><image-icon /></n-icon>
          <span>从知识库选择</span>
        </div>
      </div>
    </n-modal>

    <!-- 本地上传 Modal -->
    <n-modal v-model:show="showLocalUpload" preset="dialog" title="本地上传">
      <n-upload
        :custom-request="handleLocalUpload"
        :show-file-list="false"
        accept="image/*"
      >
        <n-upload-dragger>
          <div class="upload-dragger-content">
            <n-icon size="48"><image-icon /></n-icon>
            <p>点击或拖拽图片到此区域</p>
          </div>
        </n-upload-dragger>
      </n-upload>
    </n-modal>

    <!-- 知识库选择 Modal -->
    <n-modal
      v-model:show="showKnowledgeSelect"
      preset="card"
      style="width: 900px"
      title="从知识库选择"
    >
      <div class="dataset-selector">
        <div class="dataset-list">
          <n-card
            v-for="dataset in datasetExamples"
            :key="dataset.id"
            :title="dataset.name"
            size="small"
            class="dataset-card"
            @click="handleDatasetSelect(dataset)"
          >
            <template #header-extra>
              <n-tag size="small">{{ dataset.stats.totalImages }}张图片</n-tag>
            </template>
            {{ dataset.description }}
          </n-card>
        </div>
        
        <!-- 选中数据集后显示图片网格 -->
        <div v-if="selectedDataset" class="image-grid">
          <div
            v-for="image in datasetImages"
            :key="image.id"
            class="grid-item"
            @click="handleImageSelect(image)"
          >
            <n-image
              :src="image.url"
              :alt="image.name"
              object-fit="cover"
              class="thumbnail"
            />
          </div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NButton,
  NDropdown,
  NModal,
  NUpload,
  NUploadDragger,
  NImage,
  NIcon,
  NCard,
  NTag
} from 'naive-ui'
import {
  CloudUpload,
  Image as ImageIcon,
  Close
} from '@vicons/ionicons5'

// 从 Knowledge.vue 中获取数据
const datasetExamples = ref([
  {
    id: 'dior-r',
    name: 'DIOR-R 数据集',
    author: '王五',
    description: 'DIOR-R是一个用于遥感目标检测的大规模数据集，包含航空图像和卫星图像。',
    tags: ['遥感', '目标检测', '航空图像'],
    type: 'dataset-examples',
    imagePath: '/src/data/DIOR-R',
    stats: {
      totalImages: 1000,
      categories: ['飞机', '船舶', '建筑', '机场', '港口'],
      resolution: '800x800',
      dateCreated: '2023-06-15'
    }
  },
  {
    id: 'visdrone',
    name: 'VisDrone 数据集',
    author: '赵六',
    description: 'VisDrone是一个无人机视角的目标检测数据集，包含多种场景下的航拍图像。',
    tags: ['无人机', '目标检测', '航拍'],
    type: 'dataset-examples',
    imagePath: '/src/data/DIOR-R',
    stats: {
      totalImages: 800,
      categories: ['人', '车辆', '自行车', '建筑物'],
      resolution: '1920x1080',
      dateCreated: '2023-08-20'
    }
  },
  {
    id: 'levir-cd',
    name: 'LEVIR-CD 数据集',
    author: '张三',
    description: 'LEVIR-CD是一个用于遥感变化检测的数据集，包含不同时相的卫星图像对。',
    tags: ['遥感', '变化检测', '卫星图像'],
    type: 'dataset-examples',
    imagePath: '/src/data/DIOR-R',
    stats: {
      totalImages: 1200,
      categories: ['建筑变化', '植被变化', '水体变化'],
      resolution: '1024x1024',
      dateCreated: '2023-07-10'
    }
  },
  {
    id: 'rsipac',
    name: 'RSIPAC 数据集',
    author: '李四',
    description: 'RSIPAC是一个遥感图像场景分类数据集，包含多种地物类型的卫星图像。',
    tags: ['遥感', '场景分类', '卫星图像'],
    type: 'dataset-examples',
    imagePath: '/src/data/DIOR-R',
    stats: {
      totalImages: 1500,
      categories: ['农田', '城市', '森林', '水域', '草地'],
      resolution: '256x256',
      dateCreated: '2023-09-01'
    }
  },
  {
    id: 'fair1m',
    name: 'FAIR1M 数据集',
    author: '陈七',
    description: 'FAIR1M是一个大规模的遥感目标检测数据集，专注于细粒度目标识别。',
    tags: ['遥感', '目标检测', '细粒度识别'],
    type: 'dataset-examples',
    imagePath: '/src/data/DIOR-R',
    stats: {
      totalImages: 2000,
      categories: ['飞机型号', '船舶类型', '车辆品牌'],
      resolution: '1024x1024',
      dateCreated: '2023-10-15'
    }
  },
  {
    id: 'gaofen-image',
    name: '高分影像数据集',
    author: '吴八',
    description: '高分影像数据集包含了来自高分卫星的高分辨率光学遥感图像。',
    tags: ['遥感', '高分辨率', '光学影像'],
    type: 'dataset-examples',
    imagePath: '/src/data/DIOR-R',
    stats: {
      totalImages: 1800,
      categories: ['城市', '农业', '交通', '工业'],
      resolution: '2048x2048',
      dateCreated: '2023-11-20'
    }
  },
  {
    id: 'sar-detect',
    name: 'SAR目标检测数据集',
    author: '孙九',
    description: 'SAR目标检测数据集专注于雷达图像中的目标识别与检测。',
    tags: ['遥感', 'SAR', '目标检测'],
    type: 'dataset-examples',
    imagePath: '/src/data/DIOR-R',
    stats: {
      totalImages: 900,
      categories: ['舰船', '机场', '桥梁', '港口'],
      resolution: '512x512',
      dateCreated: '2023-12-05'
    }
  },
  {
    id: 'multispectral',
    name: '多光谱影像数据集',
    author: '郑十',
    description: '多光谱遥感影像数据集，包含可见光、近红外等多个波段。',
    tags: ['遥感', '多光谱', '地物分类'],
    type: 'dataset-examples',
    imagePath: '/src/data/DIOR-R',
    stats: {
      totalImages: 1600,
      categories: ['植被', '水体', '建筑', '裸地'],
      resolution: '896x896',
      dateCreated: '2024-01-10'
    }
  },
  {
    id: 'uav-mapping',
    name: 'UAV测绘数据集',
    author: '黄十一',
    description: 'UAV低空测绘数据集，包含各类地形地貌的无人机航拍图像。',
    tags: ['无人机', '测绘', '三维重建'],
    type: 'dataset-examples',
    imagePath: '/src/data/DIOR-R',
    stats: {
      totalImages: 1300,
      categories: ['建筑群', '道路网', '地形图'],
      resolution: '4096x3072',
      dateCreated: '2024-02-15'
    }
  },
  {
    id: 'night-vision',
    name: '夜视影像数据集',
    author: '林十二',
    description: '夜间遥感影像数据集，包含夜光、热红外等夜间观测数据。',
    tags: ['遥感', '夜视', '热红外'],
    type: 'dataset-examples',
    imagePath: '/src/data/DIOR-R',
    stats: {
      totalImages: 700,
      categories: ['城市夜光', '热源识别', '夜间活动'],
      resolution: '1024x768',
      dateCreated: '2024-03-01'
    }
  }
])

const emit = defineEmits(['update:image'])

const showSourceSelect = ref(false)
const showLocalUpload = ref(false)
const showKnowledgeSelect = ref(false)
const selectedImage = ref<any>(null)
const selectedDataset = ref<any>(null)
const datasetImages = ref<any[]>([])

// 处理区域点击
const handleAreaClick = () => {
  showSourceSelect.value = true
}

// 处理本地上传选择
const handleLocalSelect = () => {
  showSourceSelect.value = false
  showLocalUpload.value = true
}

// 处理知识库选择
const handleKnowledgeSelect = () => {
  showSourceSelect.value = false
  showKnowledgeSelect.value = true
}

// 处理本地上传
const handleLocalUpload = ({ file }: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    // 添加日志
    console.log('本地上传图片数据格式:', {
      resultType: typeof e.target?.result,
      dataPrefix: e.target?.result?.toString().substring(0, 50),
      length: e.target?.result?.toString().length
    })
    
    selectedImage.value = {
      url: e.target?.result,
      name: file.name,
      source: '本地上传'
    }
    emit('update:image', selectedImage.value)
  }
  reader.readAsDataURL(file.file)
  showLocalUpload.value = false
}

// 处理数据集选择
const handleDatasetSelect = async (dataset: any) => {
  selectedDataset.value = dataset
  // 统一使用 DIOR-R 的图片路径
  const imageContext = import.meta.glob('/src/data/DIOR-R/**/*.{jpg,jpeg,png}', { eager: true })
  datasetImages.value = Object.entries(imageContext).map(([path, module]: any) => ({
    id: path,
    url: module.default,
    name: path.split('/').pop(),
    dataset: dataset.name
  }))
}

// 处理图片选择
const handleImageSelect = async (image: any) => {
  try {
    // 获取图片数据并转换为 base64
    const response = await fetch(image.url)
    const blob = await response.blob()
    
    // 使用 FileReader 转换为 base64
    const reader = new FileReader()
    reader.onload = (e) => {
      // 添加日志
      console.log('预存图片转换后的数据格式:', {
        resultType: typeof e.target?.result,
        dataPrefix: e.target?.result?.toString().substring(0, 50),
        length: e.target?.result?.toString().length
      })
      
      selectedImage.value = {
        url: e.target?.result,
        name: image.name,
        source: `知识库 - ${image.dataset}`
      }
      emit('update:image', selectedImage.value)
    }
    reader.readAsDataURL(blob)
    
  } catch (error) {
    console.error('预存图片转换错误:', error)
  }
  
  showKnowledgeSelect.value = false
}

// 移除已选图片
const handleRemove = () => {
  selectedImage.value = null
  emit('update:image', null)
}

// 渲染图标的辅助函数
function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) })
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
  height: 100%;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-area {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

.preview-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}

.upload-area {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.upload-hint {
  text-align: center;
  color: #999;
}

.upload-icon {
  margin-bottom: 8px;
}

.source-options {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
}

.source-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.source-option:hover {
  background: #f5f5f5;
  color: #18a058;
}

.image-info {
  flex-shrink: 0;
  height: 32px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  font-size: 14px;
  background: #fff;
  border-top: 1px solid #eee;
}

.image-name {
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dataset-selector {
  display: flex;
  gap: 24px;
  height: 500px;
}

.dataset-list {
  width: 300px;
  overflow-y: auto;
}

.dataset-card {
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.dataset-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.image-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  overflow-y: auto;
  padding: 8px;
}

.grid-item {
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.grid-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-dragger-content {
  padding: 24px;
  text-align: center;
}

.upload-dragger-content p {
  margin-top: 16px;
  color: #666;
}
</style> 