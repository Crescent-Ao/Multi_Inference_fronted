<template>
  <n-modal
    :show="visible"
    preset="card"
    class="document-viewer"
    :style="{ 
      width: '95vw', 
      maxWidth: '1800px', 
      height: '95vh', 
      borderRadius: '8px',
    }"
    @update:show="emit('update:visible', $event)"
  >
    <div class="viewer-container">
      <!-- 左侧目录 -->
      <div class="toc-sidebar">
        <div class="toc-header">目录</div>
        <n-tree
          :data="tocData"
          :selected-keys="selectedKeys"
          :expanded-keys="expandedKeys"
          block-line
          @update:selected-keys="handleTocSelect"
          @update:expanded-keys="handleTocExpand"
        />
      </div>
      
      <!-- 右侧内容 -->
      <div class="content-main" ref="contentRef">
        <div class="content-header">
          <h1>{{ document.title }}</h1>
          <div class="meta-info">
            <span>作者：{{ document.author }}</span>
            <span>更新时间：{{ document.updateTime }}</span>
          </div>
        </div>
        <div class="markdown-content">
          <md-preview 
            :modelValue="document.content"
            :preview-only="true"
            @onMounted="handleMdMounted"
          />
        </div>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { NModal, NTree } from 'naive-ui'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

interface Props {
  visible: boolean
  document: {
    id: string
    title: string
    author: string
    updateTime: string
    content: string
    toc: TocItem[]
  }
}

interface TocItem {
  key: string
  label: string
  children?: TocItem[]
  content?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:visible'])

const selectedKeys = ref<string[]>([])
const expandedKeys = ref<string[]>([])
const contentRef = ref<HTMLElement | null>(null)

// 将文档目录转换为树形数据
const tocData = computed(() => {
  const convertTocItem = (item: any) => ({
    key: item.key,
    label: item.label,
    children: item.children?.map(convertTocItem)
  })
  
  return props.document.toc.map(convertTocItem)
})

// 处理目录选择
const handleTocSelect = async (keys: string[]) => {
  if (!keys.length) return
  selectedKeys.value = keys
  
  // 等待下一个 DOM 更新周期
  await nextTick()
  
  // 查找选中的目录项
  const selectedItem = findTocItem(props.document.toc, keys[0])
  if (!selectedItem) return
  
  // 构建标题文本（用于匹配）
  const headingText = selectedItem.label
  
  // 查找对应的标题元素
  if (contentRef.value) {
    const headings = contentRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const targetHeading = Array.from(headings).find(
      heading => heading.textContent?.trim() === headingText
    )
    
    if (targetHeading) {
      targetHeading.scrollIntoView({ behavior: 'smooth' })
    }
  }
}

// 处理目录展开/折叠
const handleTocExpand = (keys: string[]) => {
  expandedKeys.value = keys
}

// 递归查找目录项
const findTocItem = (items: any[], key: string): any => {
  for (const item of items) {
    if (item.key === key) return item
    if (item.children) {
      const found = findTocItem(item.children, key)
      if (found) return found
    }
  }
  return null
}

// 处理 Markdown 渲染完成
const handleMdMounted = async () => {
  await nextTick()
  
  if (contentRef.value) {
    // 获取所有标题元素
    const headings = contentRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
    
    // 为每个标题添加 id，使用标题文本作为 id 的一部分
    headings.forEach((heading) => {
      const text = heading.textContent?.trim() || ''
      const id = `heading-${text.replace(/\s+/g, '-').toLowerCase()}`
      heading.id = id
    })
  }
}

// 获取所有目录项的 key
const getAllKeys = (items: any[]): string[] => {
  let keys: string[] = []
  items.forEach(item => {
    keys.push(item.key)
    if (item.children) {
      keys = keys.concat(getAllKeys(item.children))
    }
  })
  return keys
}

// 初始化展开所有目录
onMounted(() => {
  // 获取所有目录项的 key 并设置为展开状态
  expandedKeys.value = getAllKeys(props.document.toc)
})
</script>

<style scoped>
.document-viewer {
  display: flex;
  flex-direction: column;
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);  /* 添加阴影 */
}

.viewer-container {
  display: flex;
  height: calc(95vh - 80px);
  gap: 32px;
  margin: -20px;
  padding: 24px;  /* 增加内边距 */
  background: white;
}

.toc-sidebar {
  width: 300px;
  border-right: 1px solid #eee;
  padding: 0 24px 0 0;
  overflow-y: auto;
}

.toc-header {
  font-size: 18px;
  font-weight: 500;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 16px;
}

.content-main {
  flex: 1;
  overflow-y: auto;
  padding: 0 32px;
  min-width: 0; /* 防止内容溢出 */
  scroll-behavior: smooth;
  padding-top: 20px;  /* 添加顶部内边距 */
}

.content-header {
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
  margin-bottom: 32px;
}

.content-header h1 {
  margin: 0 0 16px 0;
  font-size: 28px;
  font-weight: 500;
  color: #333;
}

.meta-info {
  color: #666;
  font-size: 14px;
}

.meta-info span {
  margin-right: 32px;
}

.markdown-content {
  padding-bottom: 40px;
  font-size: 16px;
  line-height: 1.8;
}

:deep(.md-editor-preview) {
  background: transparent;
}

/* 自定义滚动条样式 */
.toc-sidebar::-webkit-scrollbar,
.content-main::-webkit-scrollbar {
  width: 6px;
}

.toc-sidebar::-webkit-scrollbar-thumb,
.content-main::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 3px;
}

.toc-sidebar::-webkit-scrollbar-track,
.content-main::-webkit-scrollbar-track {
  background-color: transparent;
}

/* 优化标题的滚动偏移 */
:deep(h1),
:deep(h2),
:deep(h3),
:deep(h4),
:deep(h5),
:deep(h6) {
  scroll-margin-top: 80px;  /* 增加偏移量，确保标题不会被顶部遮挡 */
  padding-top: 16px;
  margin-top: 12px;
}

:deep(.n-modal) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

:deep(.n-card) {
  background: white;
  border-radius: 8px;
}
</style> 