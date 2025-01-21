import axios from 'axios'
import { API_BASE_URL } from '@/config/api'

interface LoginData {
  username: string
  password: string
}

interface RegisterData {
  username: string
  email: string
  password: string
}

export const authApi = {
  async login(data: LoginData) {
    const formData = new FormData()
    formData.append('username', data.username)
    formData.append('password', data.password)
    
    const response = await axios.post(`${API_BASE_URL}/token`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async register(data: RegisterData) {
    const response = await axios.post(`${API_BASE_URL}/register`, data)
    return response.data
  },

  async getUserInfo(token: string) {
    const response = await axios.get(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  }
} 