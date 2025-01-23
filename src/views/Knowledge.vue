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
import { ref, computed } from 'vue'
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

// 文档数据集合
const knowledgeData = [
  {
    id: '1',
    name: 'YOLO算法详解',
    description: 'YOLO系列算法的原理与实现分析',
    author: '张三',
    tags: ['算法', 'YOLO', '目标检测'],
    type: 'documents',
    icon: DroneVehicleIcon,
    content: `# YOLO算法详解

## 简介
YOLO (You Only Look Once) 是一种流行的目标检测算法...

## 核心概念
### 网络结构
YOLO采用了全卷积网络结构...

### 损失函数
YOLO的损失函数包括以下几个部分...`,
    get toc() {
      return generateTocFromMarkdown(this.content)
    }
  },
  {
    id: '2',
    name: 'Transformer架构解析',
    description: '深入理解Transformer的结构与原理',
    author: '李四',
    tags: ['深度学习', 'Transformer', 'NLP'],
    type: 'documents',
    icon: DroneVehicleIcon,
    content: `# 1. 基础概念

### 1.1 什么是Transformer
Transformer是一种基于自注意力机制的神经网络架构，最初用于自然语言处理任务。它完全摒弃了传统的循环或卷积结构，而是完全依赖于注意力机制来建模序列数据。

### 1.2 核心优势
- 并行计算能力强
- 可以捕捉长距离依赖
- 计算复杂度相对合理
- 训练稳定性好

## 2. 架构组件

### 2.1 整体架构
Transformer采用经典的编码器-解码器架构，包括：
1. 多层编码器
2. 多层解码器
3. 跨层连接机制

### 2.2 注意力机制
\`\`\`python
def self_attention(query, key, value):
    # 计算注意力分数
    scores = query @ key.transpose(-2, -1)
    # 缩放
    scaled_scores = scores / math.sqrt(key.shape[-1])
    # Softmax归一化
    weights = F.softmax(scaled_scores, dim=-1)
    # 加权求和
    return weights @ value
\`\`\`

### 2.3 位置编码
位置编码用于为模型提供序列位置信息：
\`\`\`python
def positional_encoding(length, depth):
    positions = torch.arange(length).unsqueeze(1)
    depths = torch.arange(depth).unsqueeze(0)
    angle_rates = 1 / (10000 ** (2 * depths / depth))
    angle_rads = positions * angle_rates
    
    pos_encoding = torch.zeros((length, depth))
    pos_encoding[:, 0::2] = torch.sin(angle_rads[:, 0::2])
    pos_encoding[:, 1::2] = torch.cos(angle_rads[:, 1::2])
    
    return pos_encoding
\`\`\`

## 3. 前向传播过程

### 3.1 编码器
1. 输入嵌入
2. 位置编码
3. 多头自注意力
4. 前馈神经网络

### 3.2 解码器
1. 掩码自注意力
2. 编码器-解码器注意力
3. 前馈神经网络

## 4. 训练技巧

### 4.1 预训练策略
- MLM (Masked Language Modeling)
- NSP (Next Sentence Prediction)
- RTD (Replaced Token Detection)

### 4.2 优化技巧
- 学习率预热
- Adam优化器
- Dropout正则化
- Layer Normalization

## 5. 应用场景

### 5.1 自然语言处理
- 机器翻译
- 文本摘要
- 问答系统
- 语言生成

### 5.2 计算机视觉
- 图像分类
- 目标检测
- 图像生成
- 视频理解`,
    get toc() {
      return generateTocFromMarkdown(this.content)
    }
  },
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
    imagePath: '/src/data/VisDrone',
    stats: {
      totalImages: 800,
      categories: ['人', '车辆', '自行车', '建筑物'],
      resolution: '1920x1080',
      dateCreated: '2023-08-20'
    }
  }
]

// 修改筛选逻辑，加入搜索功能
const filteredData = computed(() => {
  let data = knowledgeData

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