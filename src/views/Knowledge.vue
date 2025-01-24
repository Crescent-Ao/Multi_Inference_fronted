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
            placeholder="搜索标题、描述、标签或作者" 
            round
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <n-icon><Search /></n-icon>
            </template>
          </n-input>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <div class="content-wrapper">
        <div class="card-grid">
          <knowledge-card
            v-for="item in filteredData"
            :key="item.id"
            :tool="item"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NButton, NIcon, NInput } from 'naive-ui'
import { GridOutline, ImageOutline, DocumentTextOutline, Search } from '@vicons/ionicons5'
import GlobalHeader from '@/components/layout/GlobalHeader.vue'
import KnowledgeCard from '@/components/knowledge/KnowledgeCard.vue'
import { generateTocFromMarkdown } from '@/utils/markdownUtils'
import DroneVehicleIcon from '@/assets/DroneVehicle.png'

// 类别配置
const categories = [
  { key: 'all', label: '全部', icon: GridOutline },
  { key: 'examples', label: '数据示例', icon: ImageOutline },
  { key: 'documents', label: '知识文档', icon: DocumentTextOutline }
]

// 分类状态
const activeCategory = ref('all')
const searchQuery = ref('')

const handleCategoryClick = (key: string) => {
  activeCategory.value = key
}

// 导入 Markdown 文件
const markdownFiles = import.meta.glob('/src/data/knowledge/*.md', { as: 'raw' })

// 修改数据加载逻辑
const knowledgeData = ref([])

// 加载 Markdown 文件内容
const loadMarkdownContent = async () => {
  const data = [
    {
      id: '1',
      name: 'YOLO算法详解',
      description: 'YOLO系列算法的原理与实现分析',
      author: '张三',
      tags: ['算法', 'YOLO', '目标检测'],
      type: 'documents',
      icon: '/src/assets/Pond_Semantic.png',
      contentPath: '/src/data/knowledge/yolo.md'
    },
    {
      id: '2',
      name: 'Transformer架构解析',
      description: '深入理解Transformer的结构与原理',
      author: '李四',
      tags: ['深度学习', 'Transformer', 'NLP'],
      type: 'documents',
      icon: DroneVehicleIcon,
      contentPath: '/src/data/knowledge/transformer.md'
    },
    {
      id: 'dior-r',
      name: 'DIOR-R 数据集',
      author: '王五',
      description: 'DIOR-R是一个用于遥感目标检测的大规模数据集，包含航空图像和卫星图像。',
      tags: ['遥感', '目标检测', '航空图像'],
      type: 'dataset-examples',
      icon: '/src/assets/Pond_Semantic.png',
      imagePath: '/src/data/DIOR-R/',
      stats: {
        totalImages: 1000,
        categories: ['飞机', '船舶', '建筑', '机场', '港口'],
        resolution: '800x800',
        dateCreated: '2023-06-15'
      }
    },
    {
      id: 'drone-vehicle',
      name: 'DroneVehicle 数据集',
      author: 'DAIK',
      description: 'DroneVehicle是一个专门用于无人机视角下的车辆检测数据集。',
      tags: ['无人机', '目标检测', '车辆检测'],
      type: 'dataset-examples',
       icon: '/src/assets/Pond_Semantic.png',
      imagePath: '/src/data/DroneVehicle/',
      stats: {
        totalImages: 1500,
        categories: ['小汽车', '卡车', '公交车'],
        resolution: '1920x1080',
        dateCreated: '2024-01-01'
      }
    }
  ]

  // 加载每个文档的 Markdown 内容
  const loadedData = await Promise.all(
    data.map(async (item) => {
      try {
        const getContent = markdownFiles[item.contentPath]
        if (getContent) {
          const content = await getContent()
          return {
            ...item,
            content,
            get toc() {
              return generateTocFromMarkdown(this.content)
            }
          }
        }
        console.warn(`Markdown file not found: ${item.contentPath}`)
        return item
      } catch (error) {
        console.error(`Error loading markdown for ${item.name}:`, error)
        return item
      }
    })
  )

  knowledgeData.value = loadedData
}

// 在组件挂载时加载内容
onMounted(() => {
  loadMarkdownContent()
})

// 修改筛选逻辑，加入搜索功能
const filteredData = computed(() => {
  let data = knowledgeData.value

  // 如果有搜索关键词，先进行搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter(item => {
      // 搜索条件：标签匹配
      const tagMatch = item.tags.some(tag => 
        tag.toLowerCase().includes(query)
      )

      // 搜索名称、描述和作者
      const nameMatch = item.name.toLowerCase().includes(query)
      const descMatch = item.description.toLowerCase().includes(query)
      const authorMatch = item.author.toLowerCase().includes(query)

      // 任一条件匹配即可
      return tagMatch || nameMatch || descMatch || authorMatch
    })
  }

  // 根据分类进行过滤
  if (activeCategory.value !== 'all') {
    if (activeCategory.value === 'examples') {
      // 数据示例类型
      data = data.filter(item => item.type === 'dataset-examples')
    } else if (activeCategory.value === 'documents') {
      // 文档类型
      data = data.filter(item => item.type === 'documents')
    }
  }

  return data
})

// 处理搜索输入
const handleSearch = (value: string) => {
  searchQuery.value = value
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f6f7;
}

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
}

.category-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s;
  font-weight: 400;
  font-size: 14px;
}

.category-button .n-icon {
  font-size: 16px;
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
}

.right {
  display: flex;
  align-items: center;
}

.right .n-input {
  width: 200px;
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

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style> 