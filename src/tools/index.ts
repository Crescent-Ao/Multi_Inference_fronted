// 3. 注册工具
import { registerTool } from './register'
import { toolConfig as droneToolConfig } from '@/components/tools/DroneVehicle/config'
import { toolConfig as newToolConfig } from '@/components/tools/NewTool/config'

// 注册所有工具
export function registerAllTools() {
  registerTool(droneToolConfig)
  registerTool(newToolConfig)
  // 在这里注册更多工具...
} 