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
      id: 'DroneVehicle',
      name: 'DroneVehicle数据集',
      author: 'Crescent',
      description: 'DroneVehicle是一个专门用于无人机视角下的车辆检测数据集。',
      tags: ['无人机', '目标检测', '车辆检测'],
      type: 'dataset-examples',
      icon: '/src/data/DroneVehicle/00014.jpg',
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
      icon: '/src/data/Pond/1.1__100__0___512.jpg',
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
      icon: '/src/data/Potsdam/2_13__100__0___0.jpg',
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
      icon: '/src/data/seaice/08__100__0___25200.jpg',
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
      icon: '/src/data/Vahingen/10__100__0___0.jpg',
      imagePath: '/src/data/Vahingen',
      stats: {
        totalImages: 21,
        categories: ['OpenWater', 'Land', 'Ice', 'Snow', 'Cloud', 'Shadow'],
        resolution: '1024x1024',
        dateCreated: '2025-01-26'
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