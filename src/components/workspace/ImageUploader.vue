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
      id: 'DroneVehicle',
      name: 'DroneVehicle数据集',
      author: 'Crescent',
      description: 'DroneVehicle是一个专门用于无人机视角下的车辆检测数据集。',
      tags: ['无人机', '目标检测', '车辆检测'],
      type: 'dataset-examples',
      imagePath: '/src/data/DroneVehicle/',
      stats: {
        totalImages: 21,
        categories: ["汽车", "运输车", "卡车", "公交车", "面包车"],
        resolution: '800x800',
        dateCreated: '2025-01-26'
      }
    },
    {
      id: 'Pond_Semantic',
      name: 'Pond 数据集',
      author: 'Crescent',
      description: '池塘语义分割数据集，包含四个类别',
      tags: ['无人机', '遥感检测', '池塘检测'],
      type: 'dataset-examples',
      imagePath: '/src/data/Pond/',
      stats: {
        totalImages: 20,
        categories: ['OxyPond', 'Pond', 'DryPond', 'CagePond'],
        resolution: '1024x1024',
        dateCreated: '2025-01-26'
      }
    },
    {
      id: 'Potsdam',
      name: 'Potsdam 数据集',
      author: 'Crescent',
      description: 'Potsdam数据集由德国波茨坦市的航空影像组成，由德国摄影测量与遥感协会（ISPRS）提供。影像通过机载传感器采集，具有高空间分辨率。',
      tags: ['无人机', '遥感检测', '地物检测'],
      type: 'dataset-examples',
      imagePath: '/src/data/Potsdam/',
      stats: {
        totalImages: 20,
        categories: ['ImSurf', 'Building', 'LowVeg', 'Tree', 'Car'],
        resolution: '1024x1024',
        dateCreated: '2025-01-26'
      }
    },
    {
      id: 'Seaice',
      name: 'Seaice数据集',
      author: 'Crescent',
      description: 'Seaice数据由福州大学数字中国研究院提供，包含四个类别',
      tags: ['无人机', '遥感检测', '海冰检测'],
      type: 'dataset-examples',
      imagePath: '/src/data/seaice/',
      stats: {
        totalImages: 21,
        categories: ['OpenWater', 'Land', 'Ice', 'Snow', 'Cloud', 'Shadow'],
        resolution: '1024x1024',
        dateCreated: '2025-01-26'
      }
    },
    {
      id: 'Vahingen',
      name: 'Vaihingen数据集',
      author: 'Crescent',
      description: 'Vaihingen数据集由德国联邦环境、自然保护和核安全部提供，包含四个类别',
      tags: ['无人机', '遥感检测', '地物检测'],
      type: 'dataset-examples',
      imagePath: '/src/data/Vahingen',
      stats: {
        totalImages: 21,
        categories: ['OpenWater', 'Land', 'Ice', 'Snow', 'Cloud', 'Shadow'],
        resolution: '1024x1024',
        dateCreated: '2025-01-26'
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
  // 使用传入的 dataset.imagePath 而不是硬编码路径
  const imageContext = import.meta.glob('/src/data/**/*.{jpg,jpeg,png}', { eager: true })
  datasetImages.value = Object.entries(imageContext)
    .filter(([path]) => path.startsWith(dataset.imagePath))
    .map(([path, module]: any) => ({
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