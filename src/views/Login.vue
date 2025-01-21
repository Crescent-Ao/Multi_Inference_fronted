<template>
  <div class="page-container">
    <!-- 调整 header 布局 -->
    <div class="global-header">
      <div class="left">
        <n-text class="title">MiDF</n-text>
      </div>
      <div class="right">
        <n-button text class="lang-switch">
          简体中文
        </n-button>
      </div>
    </div>

    <div class="login-container">
      <!-- 登录表单区域 -->
      <div class="login-content">
        <h1 class="welcome-text">嗨，近来可好</h1>
        <p class="sub-title">👋 欢迎来到 MiDF, 登录以继续</p>

        <!-- 登录表单 -->
        <n-form
          ref="formRef"
          :model="formModel"
          :rules="rules"
          class="login-form"
        >
          <n-form-item label="用户名" path="username">
            <n-input
              v-model:value="formModel.username"
              placeholder="请输入用户名"
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

          <n-button
            type="primary"
            size="large"
            block
            @click="handleLogin"
            :loading="loading"
          >
            登录
          </n-button>
        </n-form>

        <!-- 注册入口 -->
        <div class="register-text">
          还没有账户？
          <n-button text type="primary" @click="handleRegister">
            立即注册
          </n-button>
          👋
        </div>

        <!-- 用户协议 -->
        <p class="terms-text">
          使用即代表您同意我们的
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
import { useMessage } from 'naive-ui'
import { 
  NButton, 
  NInput, 
  NForm, 
  NFormItem,
  NA,
  NText,
  NCollapse,
  NCollapseItem,
  NTag,
  FormRules,
  FormInst 
} from 'naive-ui'

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

// 表单数据
const formModel = ref({
  username: '',
  password: ''
})

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

// 登录处理函数
const handleLogin = async (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      try {
        const response = await fetch('http://localhost:8000/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            username: formModel.value.username,
            password: formModel.value.password
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.detail || '登录失败')
        }

        const data = await response.json()
        
        // 存储token和用户信息
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify({
          username: data.username,
          email: data.email
        }))

        message.success('登录成功')
        router.push('/workspace')
      } catch (error: any) {
        message.error(error.message || '登录失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 跳转到注册页
const handleRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 修改全局头部样式 */
.global-header {
  width: 100%;
  height: 64px; /* 固定头部高度 */
  padding: 0 40px; /* 增加左右内边距 */
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

.lang-switch {
  font-size: 14px;
}

.login-container {
  width: 100%;
  max-width: 400px;
  min-height: 600px;
  padding: 40px;
  margin: 20px;
  margin-top: 120px; /* 增加顶部边距，从 80px 改为 120px */
  display: flex;
  flex-direction: column;
}

.login-content {
  flex: 1;
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

.login-form {
  margin-top: 24px;
}

.register-text {
  text-align: center;
  margin-top: 24px; /* 增加与登录按钮的间距 */
  color: #666;
}

.terms-text {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-top: 24px; /* 调整与注册入口的间距 */
}

.footer {
  text-align: center;
  padding: 20px 0;
}

.preset-accounts {
  margin-top: 24px;
  border-radius: 8px;
  overflow: hidden;
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.account-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.account-item span {
  font-size: 14px;
  color: #666;
  width: 80px;
}
</style>