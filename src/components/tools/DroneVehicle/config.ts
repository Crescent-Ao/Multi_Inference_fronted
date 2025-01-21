interface ToolConfig {
  id: number;
  name: string;
  author: string;
  description: string;
  icon: string;
  tags: Array<string>;
  version: string;
  createTime: string;
  updateTime: string;
  category: string;
  apiUrl: string;
  params: {
    confidence: {
      default: number;
      min: number;
      max: number;
      step: number;
    };
  };
}

export const toolConfig: ToolConfig = {
  id: 1,
  name: 'DroneVehicle',
  author: 'DAIK',
  description: 'DroneVehicle 数据集 是一个用于无人机视觉任务的开源数据集，包含数万张高分辨率图像，涵盖城市、乡村、高速公路等场景及多种天气条件，数据标注包括车辆、行人等目标的边界框和像素级分割，适用于目标检测、实例分割等多种视觉任务。',
  icon: new URL('@/assets/DroneVehicle.png', import.meta.url).href,
  tags: ['目标检测', '红外图像', '低精度推理','DAIK'],
  version: '1.0.0',
  createTime: '2024-01-01',
  updateTime: '2024-01-15',
  category: 'detection',
  apiUrl: 'http://localhost:8000',
  params: {
    confidence: {
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01
    }
  }
}

export default toolConfig; 