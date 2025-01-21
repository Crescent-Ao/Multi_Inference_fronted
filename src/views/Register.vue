<template>
  <div class="page-container">
    <!-- 头部导航 -->
    <div class="global-header">
      <div class="left">
        <n-text class="title">MiDF</n-text>
      </div>
      <div class="right">
        <n-button text class="title">
          简体中文
        </n-button>
      </div>
    </div>

    <div class="register-container">
      <!-- 注册表单区域 -->
      <div class="register-content">
        <h1 class="welcome-text">创建您的账户</h1>
        <p class="sub-title">👋 欢迎使用MiDF</p>

        <!-- 注册表单 -->
        <n-form
          ref="formRef"
          :model="formModel"
          :rules="rules"
          class="register-form"
        >
          <n-form-item label="用户名" path="username">
            <n-input
              v-model:value="formModel.username"
              placeholder="请输入用户名"
              size="large"
            />
          </n-form-item>

          <n-form-item label="邮箱" path="email">
            <n-input
              v-model:value="formModel.email"
              placeholder="请输入邮箱"
              size="large"
            />
          </n-form-item>

          <n-form-item label="密码" path="password">
            <n-input
              v-model:value="formModel.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password-on="click"
            />
          </n-form-item>

          <n-form-item label="确认密码" path="confirmPassword">
            <n-input
              v-model:value="formModel.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              size="large"
              show-password-on="click"
            />
          </n-form-item>

          <n-button
            type="primary"
            size="large"
            block
            @click="handleRegister"
            :loading="loading"
          >
            注册
          </n-button>
        </n-form>

        <!-- 登录入口 -->
        <div class="login-text">
          已有账户？
          <n-button text type="primary" @click="handleLogin">
            立即登录
          </n-button>
          👋
        </div>

        <!-- 用户协议 -->
        <p class="terms-text">
          注册即代表您同意我们的
          <n-a href="#">使用协议</n-a>
          &
          <n-a href="#">隐私政策</n-a>
        </p>
      </div>
    </div>

    <!-- 移动页脚到页面底部 -->
    <div class="footer">
      <n-text depth="3">© 2025 FDU@Hzc, Inc. All rights reserved.</n-text>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NButton, 
  NInput, 
  NForm, 
  NFormItem, 
  NA,
  NText,
  FormRules,
  FormInst 
} from 'naive-ui'
import { useMessage } from 'naive-ui'

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

// 表单数据
const formModel = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能小于3位', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        return value === formModel.value.password
      },
      message: '两次输入的密码不一致',
      trigger: 'blur'
    }
  ]
}

// 注册处理函数
// 添加 API 调用服务
const apiService = {
  async register(userData: any) {
    const response = await fetch('http://localhost:8000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }
    
    return response.json();
  }
}

// 修改注册处理函数
const handleRegister = async (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      try {
        await apiService.register({
          username: formModel.value.username,
          email: formModel.value.email,
          password: formModel.value.password
        });
        message.success('注册成功')
        router.push('/login')
      } catch (error: any) {
        message.error(error.message || '注册失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 跳转到登录页
const handleLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.global-header {
  width: 100%;
  height: 64px;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
}

.left {
  display: flex;
  align-items: center;
}

.right {
  display: flex;
  align-items: center;
}

.title {
  font-size: 24px;
  font-weight: bold;
}

.register-container {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  margin: 20px;
  margin-top: 100px;
  flex: 1; /* 让内容区域占据剩余空间 */
}

.welcome-text {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.sub-title {
  color: #666;
  margin-bottom: 32px;
}

.register-form {
  margin-top: 24px;
}

.login-text {
  text-align: center;
  margin-top: 32px;
  color: #666;
}

.terms-text {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-top: 24px;
}

.footer {
  width: 100%;
  text-align: center;
  padding: 20px 0;
  margin-top: auto; /* 将页脚推到底部 */
}
</style> 