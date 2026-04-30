<script setup lang="ts">
import { reactive } from 'vue'
import { userLogin } from '@/api/userController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { message } from 'ant-design-vue'
import router from '@/router'

// 用于接收表单输入的值
const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})

const loginUserStore = useLoginUserStore()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  const res = await userLogin(values)
  // 登录成功，把登录态保存到全局状态中
  if (res.data.code === 0 && res.data.data) {
    await loginUserStore.fetchLoginUser()
    message.success('登录成功')
    router.push({
      path: '/',
      replace: true,
    })
  } else {
    message.error('登录失败，' + res.data.message)
  }
}
</script>

<template>
  <div id="userLoginPage" class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2 class="title">渔夫·星辰云图库</h2>
        <p class="subtitle">企业级智能协同云图库</p>
      </div>
      
      <a-form 
        :model="formState" 
        name="basic" 
        autocomplete="off" 
        @finish="handleSubmit"
        class="login-form"
      >
        <a-form-item 
          name="userAccount" 
          :rules="[{ required: true, message: '请输入账号' }]"
        >
          <a-input 
            v-model:value="formState.userAccount" 
            placeholder="请输入账号" 
            size="large"
            prefix="👤"
          />
        </a-form-item>
        
        <a-form-item
          name="userPassword"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码不能小于 8 位' },
          ]"
        >
          <a-input-password 
            v-model:value="formState.userPassword" 
            placeholder="请输入密码" 
            size="large"
            prefix="🔒"
          />
        </a-form-item>
        
        <div class="tips">
          还没有账号？
          <RouterLink to="/user/register" class="register-link">立即注册</RouterLink>
        </div>
        
        <a-form-item>
          <a-button 
            type="primary" 
            html-type="submit" 
            size="large"
            block
            class="login-button"
          >
            登 录
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 40px 35px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
  letter-spacing: 1px;
}

.login-form {
  margin-top: 24px;
}

.login-form :deep(.ant-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.ant-input),
.login-form :deep(.ant-input-password) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.login-form :deep(.ant-input:hover),
.login-form :deep(.ant-input-password:hover) {
  border-color: #667eea;
}

.login-form :deep(.ant-input:focus),
.login-form :deep(.ant-input-password:focus),
.login-form :deep(.ant-input-focused),
.login-form :deep(.ant-input-password-focused) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.tips {
  margin-bottom: 24px;
  color: #666;
  font-size: 14px;
  text-align: right;
}

.register-link {
  color: #667eea;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.register-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.login-button {
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
  letter-spacing: 2px;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-card {
    padding: 30px 25px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .subtitle {
    font-size: 13px;
  }
}
</style>