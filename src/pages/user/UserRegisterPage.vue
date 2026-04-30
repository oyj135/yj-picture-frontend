<script setup lang="ts">
import { reactive } from 'vue'
import { userRegister } from '@/api/userController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { message } from 'ant-design-vue'
import router from '@/router'

// 用于接收表单输入的值
const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

const loginUserStore = useLoginUserStore()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  // 校验密码是否一致
  if (values.userPassword !== values.checkPassword) {
    message.error('两次输入的密码不一致')
    return
  }
  const res = await userRegister(values)
  // 注册成功，跳转到登录页
  if (res.data.code === 0 && res.data.data) {
    message.success('注册成功')
    router.push({
      path: '/user/login',
      replace: true,
    })
  } else {
    message.error('注册失败，' + res.data.message)
  }
}
</script>

<template>
  <div id="userRegisterPage" class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h2 class="title">用户注册</h2>
        <p class="subtitle">创建您的账号</p>
      </div>
      
      <a-form 
        :model="formState" 
        name="basic" 
        autocomplete="off" 
        @finish="handleSubmit"
        class="register-form"
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
        
        <a-form-item
          name="checkPassword"
          :rules="[
            { required: true, message: '请确认密码' },
            { min: 8, message: '确认密码不能小于 8 位' },
          ]"
        >
          <a-input-password 
            v-model:value="formState.checkPassword" 
            placeholder="请确认密码" 
            size="large"
            prefix="🔒"
          />
        </a-form-item>
        
        <div class="tips">
          已有账号？
          <RouterLink to="/user/login" class="login-link">立即登录</RouterLink>
        </div>
        
        <a-form-item>
          <a-button 
            type="primary" 
            html-type="submit" 
            size="large"
            block
            class="register-button"
          >
            注 册
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  overflow: hidden;
}

.register-card {
  width: 100%;
  max-width: 380px;
  padding: 32px 28px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.register-header {
  text-align: center;
  margin-bottom: 24px;
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 6px 0;
}

.subtitle {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.register-form {
  margin-top: 20px;
}

.register-form :deep(.ant-form-item) {
  margin-bottom: 16px;
}

.register-form :deep(.ant-input),
.register-form :deep(.ant-input-password) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.register-form :deep(.ant-input:hover),
.register-form :deep(.ant-input-password:hover) {
  border-color: #667eea;
}

.register-form :deep(.ant-input:focus),
.register-form :deep(.ant-input-password:focus),
.register-form :deep(.ant-input-focused),
.register-form :deep(.ant-input-password-focused) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.tips {
  margin-bottom: 20px;
  color: #666;
  font-size: 13px;
  text-align: right;
}

.login-link {
  color: #667eea;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.login-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.register-button {
  height: 40px;
  font-size: 15px;
  border-radius: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.register-button:hover {
  opacity: 0.9;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .register-card {
    padding: 28px 24px;
  }
  
  .title {
    font-size: 20px;
  }
}
</style>