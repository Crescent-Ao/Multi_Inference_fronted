<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <!-- 左侧标题和图标 -->
        <div class="modal-title">
          <n-avatar :src="device.icon" :round="false" size="medium" class="device-icon" />
          <span>{{ device.name }}</span>
        </div>

        <!-- 中间描述信息 - 改为连贯的设备介绍文本 -->
        <div class="device-description">
          <p>
            {{ device.description }} 
            这是一款由 {{ device.author }} 生产的{{ getCategoryName(device.category) }}，
            当前版本 {{ device.version }}，最近更新于 {{ device.updateTime }}。
            特点包括：{{ device.tags.join('、') }}。
          </p>
        </div>

        <!-- 右侧关闭按钮 -->
        <div class="close-button">
          <n-button quaternary circle @click="$emit('close')">
            <template #icon><n-icon><Close /></n-icon></template>
          </n-button>
        </div>
      </div>

      <div class="modal-body">
        <div class="content-layout">
          <div class="main-section">
            <div class="image-containers">
              <!-- 输入图像区域 -->
              <div class="image-container">
                <div class="image-header">
                  <span class="title">输入图像</span>
                </div>
                <div class="image-content">
                  <image-uploader 
                    v-model:image="selectedInputImage" 
                    @update:image="handleImageSelect"
                  />
                </div>
              </div>

              <!-- 输出图像区域 -->
              <div class="image-container">
                <div class="image-header">
                  <span class="title">输出图像</span>
                </div>
                <div 
                  class="image-content clickable"
                  @click="handleDownload"
                  :class="{ 'can-download': outputImage }"
                >
                  <img 
                    v-if="outputImage" 
                    :src="outputImage" 
                    alt="输出图像"
                    class="preview-image"
                  />
                  <div v-else class="placeholder">
                    <n-icon size="48" class="placeholder-icon">
                      <Image />
                    </n-icon>
                    <p>处理结果将显示在这里</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="control-panel">
              <div class="control-row">
                <div class="control-item">
                  <span class="label">推理平台</span>
                  <n-select
                    v-model:value="inferencePlatform"
                    :options="[
                      { label: 'Pytorch', value: 'pytorch' },
                      { label: 'ONNX', value: 'onnx' },
                      { label: 'TensorRT', value: 'tensorrt' }
                    ]"
                    size="small"
                  />
                </div>
                <div class="control-item">
                  <span class="label">推理精度</span>
                  <n-select
                    v-model:value="inferencePrecision"
                    :options="[
                      { label: 'FP32', value: 'fp32' },
                      { label: 'FP16', value: 'fp16' },
                      { label: 'INT8', value: 'int8' }
                    ]"
                    size="small"
                  />
                </div>
                <div class="control-item">
                  <span class="label">推理任务</span>
                  <n-select
                    v-model:value="inferenceTask"
                    :options="[
                      { label: '图像分类', value: 'classification' },
                      { label: '目标检测', value: 'detection' },
                      { label: '语义分割', value: 'segmentation' }
                    ]"
                    size="small"
                  />
                </div>
              </div>
              
              <div class="button-row">
                <n-button 
                  class="action-button model-init-button"
                  @click="handleModelInit"
                  :loading="isInitializing"
                  :class="{ 'is-initialized': isModelInitialized }"
                >
                  <template #icon>
                    <n-icon>
                      <Settings v-if="!isModelInitialized" />
                      <CheckmarkCircle v-else />
                    </n-icon>
                  </template>
                  {{ isModelInitialized ? '重新初始化模型 🔄' : '模型初始化 🎯' }}
                </n-button>

                <n-button 
                  class="action-button inference-button"
                  @click="handleInference"
                  :loading="isInferencing"
                  :disabled="!isModelInitialized || !inputImage || isInferencing"
                  :class="{ 'is-complete': isInferenceComplete }"
                >
                  <template #icon>
                    <n-icon>
                      <Rocket v-if="!isInferenceComplete" />
                      <CheckmarkCircle v-else />
                    </n-icon>
                  </template>
                  {{ isInferenceComplete ? '推理完成 ✨' : '开始推理 🚀' }}
                </n-button>
                
                <n-button
                  class="action-button download-button"
                  @click="handleDownload"
                  :disabled="!outputImage"
                >
                  <template #icon>
                    <n-icon><Download /></n-icon>
                  </template>
                  推理结果下载 👀
                </n-button>
                
                <n-button
                  class="action-button stats-button"
                  @click="handleStats"
                  :disabled="!isInferenceComplete"
                >
                  <template #icon>
                    <n-icon><Stats /></n-icon>
                  </template>
                  推理结果统计 📊
                </n-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NAvatar, NButton, NIcon, NSelect, useMessage } from 'naive-ui'
import { Close, Image, Rocket, Download, Settings, CheckmarkCircle, StatsChart as Stats } from '@vicons/ionicons5'
import ImageUploader from '@/components/workspace/ImageUploader.vue'
import axios from 'axios'

// 定义接口
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

const props = defineProps<{
  device: ComputingDevice
}>()

defineEmits<{
  (e: 'close'): void
}>()

// 添加消息提示
const message = useMessage()

// 状态管理
const selectedInputImage = ref(null)
const inputImage = ref<string>('')
const outputImage = ref<string>('')
const inferencePlatform = ref('pytorch')
const inferencePrecision = ref('fp32')
const inferenceTask = ref('classification')

// 模型初始化状态
const isModelInitialized = ref(false)
const isInitializing = ref(false)

// 推理状态
const isInferencing = ref(false)
const isInferenceComplete = ref(false)

// 获取类别名称
const getCategoryName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'edge-device': '边缘计算设备',
    'accelerator': '加速器',
    'single-board-computer': '单板计算机'
  }
  return categoryMap[category] || category
}

// 处理图片选择
const handleImageSelect = (image: any) => {
  if (image) {
    inputImage.value = image.url
    // 重置推理状态
    isInferenceComplete.value = false
    outputImage.value = ''
  } else {
    inputImage.value = ''
  }
}

// 处理结果下载
const handleDownload = () => {
  if (outputImage.value) {
    const link = document.createElement('a')
    link.download = `${props.device.name}_result.png`
    link.href = outputImage.value
    link.click()
    message.success('下载成功')
  } else {
    message.warning('暂无可下载的结果')
  }
}

// 处理模型初始化
const handleModelInit = async () => {
  if (isInitializing.value) return
  
  try {
    isInitializing.value = true
    const actionType = isModelInitialized.value ? '重新初始化' : '初始化'
    
    // 构建初始化参数
    const initParams = {
      deviceName: props.device.name,
      category: props.device.category,
      platform: inferencePlatform.value,
      precision: inferencePrecision.value,
      task: inferenceTask.value,
      timestamp: new Date().toISOString()
    }
    
    console.log('初始化参数:', initParams)

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    isModelInitialized.value = true
    message.success(`模型${actionType}成功`)
    
  } catch (error) {
    isModelInitialized.value = false
    console.error('模型初始化错误:', error)
    message.error(error instanceof Error ? error.message : `模型初始化失败`)
  } finally {
    isInitializing.value = false
  }
}

// 处理推理
const handleInference = async () => {
  if (!isModelInitialized.value || !inputImage.value || isInferencing.value) return

  try {
    isInferencing.value = true
    outputImage.value = ''
    
    // 构建推理参数
    const inferenceParams = {
      image: inputImage.value,
      device: props.device.name,
      platform: inferencePlatform.value,
      precision: inferencePrecision.value,
      task: inferenceTask.value
    }
    
    console.log('推理参数:', inferenceParams)
    
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟输出图像
    outputImage.value = inputImage.value
    isInferenceComplete.value = true
    message.success('推理完成')
    
  } catch (error) {
    console.error('推理错误:', error)
    isInferenceComplete.value = false
    outputImage.value = ''
    message.error(error instanceof Error ? error.message : '推理失败')
  } finally {
    isInferencing.value = false
  }
}

// 处理统计功能
const handleStats = () => {
  message.info('推理结果统计功能尚未实现')
}

// 监听下拉框变化
watch([inferencePlatform, inferencePrecision, inferenceTask], () => {
  if (isModelInitialized.value) {
    isModelInitialized.value = false
    isInferenceComplete.value = false
    outputImage.value = ''
    message.info('参数已更改，请重新初始化模型')
  }
})

// 监听输入图像变化
watch(inputImage, () => {
  if (isInferenceComplete.value) {
    isInferenceComplete.value = false
    outputImage.value = ''
  }
})
</script>

<style scoped>
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
  border-radius: 12px;
  width: 96%;
  height: 96vh;
  max-width: none;
  position: relative;
  animation: modal-in 0.3s ease-out;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  background: white;
  min-height: 64px;
  flex-shrink: 0;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 180px;
  white-space: nowrap;
}

.device-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

.device-description {
  flex: 1;
  padding: 0 24px;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.device-description p {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.close-button {
  margin-left: auto;
}

.modal-body {
  flex: 1;
  overflow: hidden;
  padding: 24px;
  display: flex;
  flex-direction: column;
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

.content-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.main-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  overflow: auto;
}

.image-containers {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
  height: auto;
}

.image-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
  overflow: hidden;
  min-height: 0;
}

.image-header {
  padding: 8px 16px;
  border-bottom: 1px solid #eee;
}

.image-header .title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.image-content {
  flex: 1;
  position: relative;
  min-height: 0;
  display: flex;
  flex-direction: column;
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
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.placeholder-icon {
  color: #ccc;
}

.placeholder p {
  margin: 0;
  font-size: 14px;
  color: #999;
}

.control-panel {
  margin-top: 16px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #eee;
  flex-shrink: 0;
}

.control-row {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.control-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.button-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.action-button {
  height: 40px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  transition: all 0.3s ease;
  color: white !important;
}

.action-button:hover,
.action-button:active,
.action-button:focus {
  color: white !important;
}

.action-button :deep(.n-icon) {
  color: white !important;
}

.model-init-button {
  background: linear-gradient(135deg, #FF00FF 0%, #FF69B4 100%);
}

.model-init-button:hover {
  background: linear-gradient(135deg, #FF69B4 0%, #FF00FF 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 0, 255, 0.2);
}

.inference-button {
  background: linear-gradient(135deg, #36ad6a 0%, #4cd389 100%);
}

.inference-button:hover {
  background: linear-gradient(135deg, #4cd389 0%, #36ad6a 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(54, 173, 106, 0.2);
}

.download-button {
  background: linear-gradient(135deg, #4098fc 0%, #60aeff 100%);
}

.download-button:hover {
  background: linear-gradient(135deg, #60aeff 0%, #4098fc 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 152, 252, 0.2);
}

.stats-button {
  background: linear-gradient(135deg, #f5a623 0%, #f8c256 100%);
}

.stats-button:hover {
  background: linear-gradient(135deg, #f8c256 0%, #f5a623 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 166, 35, 0.2);
}

.action-button:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

:deep(.image-uploader) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.upload-area) {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.action-button .n-button__content) {
  color: white !important;
}
</style> 