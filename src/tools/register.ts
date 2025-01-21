import type { ToolConfig } from '@/types/tool'

// 工具注册表
const toolRegistry = new Map<string, ToolConfig>()

// 注册工具
export function registerTool(config: ToolConfig) {
  toolRegistry.set(config.id, config)
}

// 获取所有注册的工具
export function getAllTools(): ToolConfig[] {
  return Array.from(toolRegistry.values())
}

// 根据分类获取工具
export function getToolsByCategory(category: string): ToolConfig[] {
  return Array.from(toolRegistry.values()).filter(
    tool => tool.category === category
  )
}

// 根据ID获取工具
export function getToolById(id: string): ToolConfig | undefined {
  return toolRegistry.get(id)
} 