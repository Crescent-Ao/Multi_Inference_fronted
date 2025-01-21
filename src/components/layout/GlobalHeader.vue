<template>
  <div class="nav-header">
    <div class="left">
      <n-text class="logo">MiDF</n-text>
    </div>
    <div class="center">
      <div class="nav-items">
        <n-button
          v-for="item in navItems"
          :key="item.key"
          :class="['nav-button', { active: currentRoute === item.key }]"
          text
          @click="handleNavClick(item.key)"
        >
          <template #icon>
            <n-icon>
              <component :is="item.icon" />
            </n-icon>
          </template>
          <span class="nav-label">{{ item.label }}</span>
        </n-button>
      </div>
    </div>
    <div class="right">
      <n-button type="primary">开始</n-button>
      <n-avatar round size="small" :src="userAvatar" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton, NIcon, NText, NAvatar } from 'naive-ui'
import { Search, Cube, Book, Hammer } from '@vicons/ionicons5'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const userAvatar = ref('')

const navItems = [
  { key: 'search', label: '探索', icon: Search },
  { key: 'workspace', label: '工作箱', icon: Cube },
  { key: 'knowledge', label: '知识库', icon: Book },
  { key: 'tools', label: '工具', icon: Hammer }
]

// 根据当前路由计算激活的导航项
const currentRoute = computed(() => {
  return route.path.split('/')[1] || 'workspace'
})

const handleNavClick = (key: string) => {
  router.push(`/${key}`)
}
</script>

<style scoped>
.nav-header {
  height: 64px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f6f7;
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
</style> 