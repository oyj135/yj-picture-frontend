import { getLoginUser } from '@/api/userController';
import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 存储登录用户信息的状态
 */
export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser = ref<any>({
    userName: '未登录',
  })

  async function fetchLoginUser() {
    const res = await getLoginUser();
    if (res.data.code === 0 && res.data.data) {
      loginUser.value = res.data.data;
    }
  }

  // 设置登录用户信息
  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser
  }

  return { loginUser, setLoginUser, fetchLoginUser }
})
