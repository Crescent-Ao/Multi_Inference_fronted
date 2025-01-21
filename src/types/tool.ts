import type { Component } from 'vue'

export interface ToolConfig {
  id: string | number
  name: string
  icon: string
  author: string
  description: string
  tags: string[]
  category: string
  version?: string
  createTime?: string
  updateTime?: string
  component: Component
  apiUrl: string
} 