<template>
  <div class="page-container">
    <global-header />
    
    <!-- 设备分类子导航 -->
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
            placeholder="搜索设备" 
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

    <!-- 设备卡片内容区域 -->
    <div class="content">
      <div class="content-wrapper">
        <div v-if="filteredDevices.length > 0" class="tools-grid">
          <div 
            v-for="device in filteredDevices" 
            :key="device.id" 
            class="device-card"
            @click="openDeviceModal(device)"
          >
            <div class="card-header">
              <n-avatar :src="device.icon" :round="false" size="large" class="device-icon" />
              <div class="device-info">
                <h3 class="device-name">{{ device.name }}</h3>
                <span class="device-author">{{ device.author }}</span>
              </div>
            </div>
            <p class="device-description">{{ device.description }}</p>
            <div class="device-tags">
              <span v-for="tag in device.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="no-results">
          <n-empty description="没有找到相关设备">
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

    <!-- 设备模态窗口 -->
    <device-modal
      v-if="selectedDevice && showModal"
      :device="selectedDevice"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NAvatar, NButton, NIcon, NInput, NEmpty } from 'naive-ui'
import DeviceModal from '@/components/tools/DeviceModal.vue'
import GlobalHeader from '@/components/layout/GlobalHeader.vue'
import { 
  Search, 
  GridOutline, 
  HardwareChipOutline, 
  SpeedometerOutline,
  ServerOutline
} from '@vicons/ionicons5'

// 定义设备类型接口
interface ComputingDevice {
  id: number
  name: string
  icon: string
  author: string
  description: string
  tags: string[]
  version: string
  createTime: string
  updateTime: string
  apiUrl: string
  category: string
}

// 设备分类
const categories = [
  { 
    key: 'all', 
    label: '全部设备',
    icon: GridOutline 
  },
  { 
    key: 'edge-device', 
    label: '边缘计算设备',
    icon: HardwareChipOutline 
  },
  { 
    key: 'accelerator', 
    label: '加速器',
    icon: SpeedometerOutline 
  },
  { 
    key: 'single-board-computer', 
    label: '单板计算机',
    icon: ServerOutline 
  }
]

// 激活的分类
const activeCategory = ref('all')

// 模态窗口控制状态
const showModal = ref(false)
const selectedDevice = ref<ComputingDevice | null>(null)

// 搜索状态
const searchQuery = ref('')

// 打开设备模态窗口
const openDeviceModal = (device: ComputingDevice) => {
  selectedDevice.value = device
  showModal.value = true
}

// 关闭模态窗口
const closeModal = () => {
  showModal.value = false
}

// 处理分类点击
const handleCategoryClick = (key: string) => {
  activeCategory.value = key
}

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑已经通过计算属性实现
}

// 清除搜索
const clearSearch = () => {
  searchQuery.value = ''
}

// 模拟计算设备数据
const computingDevices = ref<ComputingDevice[]>([
  {
    id: 1,
    name: "NVIDIA Jetson Nano",
    icon: "/icons/jetson-nano.png",
    author: "NVIDIA",
    description: "小型AI计算设备，适用于入门级边缘计算项目，支持多种深度学习框架",
    tags: ["边缘计算", "ARM", "CUDA"],
    version: "1.0.0",
    createTime: "2023-01-15",
    updateTime: "2023-05-20",
    apiUrl: "/api/devices/jetson-nano",
    category: "edge-device"
  },
  {
    id: 2,
    name: "Intel Neural Compute Stick 2",
    icon: "/icons/intel-ncs2.png",
    author: "Intel",
    description: "USB形式的神经网络推理加速器，可轻松为边缘设备添加AI功能",
    tags: ["USB加速器", "OpenVINO", "低功耗"],
    version: "2.1.0",
    createTime: "2023-02-10",
    updateTime: "2023-06-15",
    apiUrl: "/api/devices/intel-ncs2",
    category: "accelerator"
  },
  {
    id: 3,
    name: "Google Coral TPU",
    icon: "/icons/google-coral.png",
    author: "Google",
    description: "针对TensorFlow Lite优化的边缘TPU，提供高性能的机器学习推理能力",
    tags: ["TPU", "TensorFlow Lite", "高性能"],
    version: "1.5.0",
    createTime: "2023-03-05",
    updateTime: "2023-07-10",
    apiUrl: "/api/devices/coral-tpu",
    category: "accelerator"
  },
  {
    id: 4,
    name: "Raspberry Pi 4 Model B",
    icon: "/icons/raspberry-pi4.png",
    author: "Raspberry Pi Foundation",
    description: "小型单板计算机，搭配加速器可进行轻量级AI推理任务",
    tags: ["ARM", "Linux", "轻量级"],
    version: "4.0.0",
    createTime: "2023-01-20",
    updateTime: "2023-08-05",
    apiUrl: "/api/devices/raspberry-pi4",
    category: "single-board-computer"
  },
  {
    id: 5,
    name: "NVIDIA Jetson AGX Xavier",
    icon: "/icons/jetson-xavier.png",
    author: "NVIDIA",
    description: "高性能边缘AI计算平台，针对自动驾驶和机器人应用优化",
    tags: ["边缘计算", "GPU", "高性能"],
    version: "3.0.0",
    createTime: "2023-04-12",
    updateTime: "2023-09-01",
    apiUrl: "/api/devices/jetson-xavier",
    category: "edge-device"
  },
  {
    id: 6,
    name: "Khadas VIM3",
    icon: "/icons/khadas-vim3.png",
    author: "Khadas",
    description: "配备NPU的高性能SBC，适用于边缘AI应用开发",
    tags: ["NPU", "ARM", "媒体处理"],
    version: "1.2.0",
    createTime: "2023-03-22",
    updateTime: "2023-08-18",
    apiUrl: "/api/devices/khadas-vim3",
    category: "single-board-computer"
  }
])

// 过滤设备列表
const filteredDevices = computed(() => {
  let devices = computingDevices.value

  // 如果有搜索关键词，先进行搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    devices = devices.filter(device => {
      // 搜索条件：名称、描述、标签、制造商
      const nameMatch = device.name.toLowerCase().includes(query)
      const descMatch = device.description.toLowerCase().includes(query)
      const authorMatch = device.author.toLowerCase().includes(query)
      const tagMatch = device.tags.some(tag => tag.toLowerCase().includes(query))

      return nameMatch || descMatch || authorMatch || tagMatch
    })
  }

  // 根据分类过滤
  if (activeCategory.value !== 'all') {
    devices = devices.filter(device => device.category === activeCategory.value)
  }

  return devices
})

// 页面加载时的初始化逻辑
onMounted(() => {
  // 这里可以添加API调用，从后端获取真实设备数据
  console.log('Tools页面已加载')
})
</script>

<style scoped>
/* 页面容器 */
.page-container {
  min-height: 100vh;
  background-color: #f5f6f7;
}

/* 子导航样式 */
.sub-nav {
  width: 100%;
  padding: 16px 0;
  background-color: #f5f6f7;
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

.right .n-input {
  width: 240px;
}

/* 内容区域 */
.content {
  width: 100%;
  padding-top: 16px;
}

.content-wrapper {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 32px;
}

/* 工具网格 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

/* 设备卡片 */
.device-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
  border: 1px solid #eee;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.device-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.device-icon {
  width: 48px;
  height: 48px;
  border-radius: 6px;
}

.device-info {
  flex: 1;
  min-width: 0;
}

.device-name {
  font-size: 16px;
  font-weight: 500;
  color: #1f2329;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-author {
  font-size: 13px;
  color: #86909c;
}

.device-description {
  font-size: 14px;
  color: #4e5969;
  margin: 0 0 auto 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-grow: 1;
}

.device-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.tag {
  background: #f2f3f5;
  color: #4e5969;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

/* 无结果提示样式 */
.no-results {
  width: 100%;
  padding: 40px 0;
  text-align: center;
}
</style> 