const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // 生产环境使用相对路径
  : 'http://localhost:8000'  // 开发环境使用完整 URL

export default API_BASE_URL 