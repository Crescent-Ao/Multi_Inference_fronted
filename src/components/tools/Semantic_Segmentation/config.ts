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
}

export const toolConfig: ToolConfig = {
  id: 2,
  name: 'Semantic Segmentation',
  author: 'DAIK',
  description: '语义分割是计算机视觉中的一个重要任务，旨在将图像中的每个像素分配到预定义的类别中。这个工具支持对无人机航拍图像进行语义分割，可以识别和分割出道路、建筑物、车辆等不同类别的目标。',
  icon: new URL('@/assets/segmentation.png', import.meta.url).href,
  tags: ['语义分割', '无人机', '高精度'],
  version: '1.0.0',
  createTime: '2024-01-01',
  updateTime: '2024-01-15',
  category: 'segmentation',
  apiUrl: 'http://localhost:8000'
}

export default toolConfig; 