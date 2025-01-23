<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <!-- 左侧标题和图标 -->
        <div class="modal-title">
          <n-avatar :src="tool.icon" :round="false" size="medium" class="tool-icon" />
          <span>{{ tool.name }}</span>
        </div>

        <!-- 中间描述信息 -->
        <div class="tool-description">
          {{ tool.description.slice(0, 180) }}{{ tool.description.length > 180 ? '...' : '' }}
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
          <div class="image-section">
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
                  <span class="label">推理框架</span>
                  <n-select
                    v-model:value="inferenceFramework"
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
              </div>
              
              <div class="button-row">
                <n-button 
                  class="action-button model-init-button"
                  @click="handleModelInit"
                  :loading="isInitializing"
                >
                  <template #icon>
                    <n-icon>
                      <Settings v-if="!isModelInitialized" />
                      <CheckmarkCircle v-else />
                    </n-icon>
                  </template>
                  {{ isModelInitialized ? 'Re-initialize Model 🔄' : 'Model Initialization 🎯' }}
                </n-button>

                <n-button 
                  class="action-button inference-button"
                  @click="handleInference"
                  :loading="isInferencing"
                  :disabled="!isModelInitialized || !inputImage || isInferencing"
                >
                  <template #icon>
                    <n-icon>
                      <Rocket v-if="!isInferenceComplete" />
                      <CheckmarkCircle v-else />
                    </n-icon>
                  </template>
                  {{ isInferenceComplete ? 'Inference Complete ✨' : 'Let\'s start inference 🚀' }}
                </n-button>
                
                <n-button
                  class="action-button download-button"
                  @click="handleDownload"
                >
                  <template #icon>
                    <n-icon><Eye /></n-icon>
                  </template>
                  Inference Results Download 👀
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
import { NAvatar, NButton, NIcon, NSelect, NInputNumber, useMessage } from 'naive-ui'
import { Close, Image, Rocket, Eye, Settings, CheckmarkCircle } from '@vicons/ionicons5'
import ImageUploader from '@/components/workspace/ImageUploader.vue'
import axios from 'axios'

// 修改 props 的类型定义，添加必要的属性
interface ToolProps {
  tool: {
    id: number
    name: string
    icon: string
    author: string
    description: string
    tags: string[]
    version: string
    createTime: string
    updateTime: string
    params: {
      confidence: {
        default: number
        min: number
        max: number
        step: number
      }
    }
    apiUrl: string
  }
}

const props = defineProps<ToolProps>()

defineEmits<{
  (e: 'close'): void
}>()

// 添加消息提示
const message = useMessage()

// 状态管理
const selectedInputImage = ref(null)
const inputImage = ref<string>('')
const outputImage = ref<string>('')
const inferenceFramework = ref('pytorch')
const inferencePrecision = ref('fp32')

// 添加模型初始化状态
const isModelInitialized = ref(false)
const isInitializing = ref(false)

// 添加推理状态
const isInferencing = ref(false)
const isInferenceComplete = ref(false)

// 添加调试日志
console.log('Modal props:', props.tool)
console.log('API URL:', props.tool.apiUrl)

// 修改 API 基础 URL 的获取方式
const API_BASE_URL = props.tool.apiUrl

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
    link.download = 'result.png'
    link.href = outputImage.value
    link.click()
  }
}

// 处理模型初始化
const handleModelInit = async () => {
  console.log('使用的 API URL:', props.tool.apiUrl)
  if (isInitializing.value) {
    console.log('模型正在初始化中，请等待...')
    return
  }
  
  try {
    isInitializing.value = true
    const actionType = isModelInitialized.value ? '重新初始化' : '初始化'
    
    // 获取任务类型（卡片的第一个标签）
    const taskType = props.tool.tags[0] || 'unknown'
    
    // 构建初始化参数
    const initParams = {
      modelName: props.tool.name,
      framework: inferenceFramework.value,
      precision: inferencePrecision.value,
      taskType: taskType,
      timestamp: new Date().toISOString(),
      toolInfo: {
        id: props.tool.id,
        version: props.tool.version,
        author: props.tool.author,
        tags: props.tool.tags
      }
    }
    
    // 打印详细的调试信息
    console.group('模型初始化请求信息')
    console.log('请求类型:', actionType)
    console.log('完整参数:', initParams)
    console.log('推理框架:', initParams.framework)
    console.log('推理精度:', initParams.precision)
    console.log('任务类型:', initParams.taskType)
    console.log('工具信息:', initParams.toolInfo)
    console.log('请求时间:', initParams.timestamp)
    console.groupEnd()

    // 调用后端 API
    const response = await axios.post(`${props.tool.apiUrl}/initialize_model/`, {
      platform: inferenceFramework.value,
      precision: inferencePrecision.value
    })

    console.log('API响应:', response.data)

    if (response.data.message === '模型初始化成功') {
      // 初始化成功
      isModelInitialized.value = true
      console.log('模型初始化状态已更新:', isModelInitialized.value)
      console.log('成功初始化的任务类型:', taskType)
      message.success(`模型${actionType}成功 (${taskType})`)
    } else {
      throw new Error('模型初始化失败：未收到成功响应')
    }
    
  } catch (error) {
    // 初始化失败
    isModelInitialized.value = false
    console.error('模型初始化错误:', error)
    message.error(error instanceof Error ? error.message : `模型${actionType}失败`)
    
  } finally {
    isInitializing.value = false
    console.log('初始化流程结束，loading状态已重置')
  }
}

// 监听框架和精度变化，重置初始化状态
watch([inferenceFramework, inferencePrecision], () => {
  if (isModelInitialized.value) {
    isModelInitialized.value = false
  }
}) 

// 处理推理
const handleInference = async () => {
  if (!isModelInitialized.value || !inputImage.value || isInferencing.value) {
    console.log('推理条件检查:', {
      isModelInitialized: isModelInitialized.value,
      hasInputImage: !!inputImage.value,
      isInferencing: isInferencing.value
    })
    return
  }

  try {
    isInferencing.value = true
    outputImage.value = ''
    
    // 添加日志
    console.log('发送给后端的图片数据:', {
      imageType: typeof inputImage.value,
      dataPrefix: inputImage.value.substring(0, 50),
      length: inputImage.value.length,
      isBase64: inputImage.value.startsWith('data:image')
    })
    
    // 构建推理参数
    const inferenceParams = {
      image: inputImage.value.split(',')[1]  // 移除 base64 的头部信息
    }
    
    // 调用后端推理 API
    const response = await axios.post(
      `${props.tool.apiUrl}/segmentation/`,
      inferenceParams,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.data.processed_image) {
      outputImage.value = response.data.processed_image
      isInferenceComplete.value = true
      message.success('分割完成')
    } else {
      throw new Error('分割失败：未收到处理后的图像')
    }
    
  } catch (error) {
    console.error('分割错误:', error)
    isInferenceComplete.value = false
    outputImage.value = ''  // 发生错误时也清空输出图像
    message.error(error instanceof Error ? error.message : '分割失败')
  } finally {
    isInferencing.value = false
  }
}

// 监听输入图像变化，重置推理状态
watch(inputImage, () => {
  if (isInferenceComplete.value) {
    isInferenceComplete.value = false
    outputImage.value = ''
  }
})

</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f6f7; /* 整个页面使用浅灰色背景 */
}

/* 顶部导航 */
.nav-header {
  height: 64px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f6f7; /* 改为与页面相同的浅灰色背景 */
  border-bottom: 1px solid #eee;
}

.left {
  width: 200px;
}

.center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.right {
  width: 200px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
}

.nav-items {
  display: flex;
  gap: 4px;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
  font-weight: 500;
  font-size: 14px;
}

.nav-button .n-icon {
  font-size: 14px;
}

.nav-button.active {
  background-color: #e6f4ef;
  color: #18a058;
  font-weight: 600;
}

.nav-button.active .n-icon {
  color: #18a058;
  fill: currentColor;
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
  min-height: 360px;
  position: relative;
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
  width: auto;
  height: auto;
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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
  width: 100%;
}

.action-button {
  height: 40px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
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

/* 添加模型初始化按钮样式 */
.model-init-button {
  background: linear-gradient(135deg, #FF00FF 0%, #FF69B4 100%);
}

.model-init-button:hover,
.model-init-button:active,
.model-init-button:focus {
  background: linear-gradient(135deg, #FF69B4 0%, #FF00FF 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 0, 255, 0.2);
  color: #ffffff !important;
}

/* 添加初始化成功状态样式 */
.model-init-button.n-button--disabled {
  opacity: 0.7 !important;  /* 只在加载时显示半透明 */
}

/* 成功状态样式 */
.model-init-button.is-initialized {
  background: linear-gradient(135deg, #FF69B4 0%, #FF00FF 100%);
}

.model-init-button.is-initialized:hover {
  background: linear-gradient(135deg, #FF00FF 0%, #FF69B4 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 0, 255, 0.2);
}

/* 添加加载状态动画 */
@keyframes loading-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.model-init-button.n-button--loading .n-icon {
  animation: loading-spin 1s linear infinite;
}

/* 修改推理按钮样式 */
.inference-button.n-button--disabled {
  opacity: 0.7 !important;
}

/* 完成状态样式 */
.inference-button.is-complete {
  background: linear-gradient(135deg, #4cd389 0%, #36ad6a 100%);
}

.inference-button.is-complete:hover {
  background: linear-gradient(135deg, #36ad6a 0%, #4cd389 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(54, 173, 106, 0.2);
}

/* 添加加载动画 */
.inference-button.n-button--loading .n-icon {
  animation: loading-spin 1s linear infinite;
}
</style> 