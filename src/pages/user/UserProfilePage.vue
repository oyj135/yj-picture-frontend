<script lang="ts" setup>
import { getUserVoById } from '@/api/userController'
import { message } from 'ant-design-vue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 用户信息
const userInfo = ref<API.UserVO>({})

// 获取用户信息
const fetchUserInfo = async () => {
  const userId = route.params.id
  if (!userId) {
    message.error('用户ID不存在')
    return
  }
  
  const res = await getUserVoById({ id: Number(userId) })
  if (res.data.code === 0 && res.data.data) {
    userInfo.value = res.data.data
  } else {
    message.error('获取用户信息失败，' + res.data.message)
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<template>
  <div id="userProfilePage" class="user-profile-page">
    <a-card class="profile-card">
      <div class="profile-header">
        <a-avatar :size="120" :src="userInfo.userAvatar" />
        <div class="profile-info">
          <h2 class="username">{{ userInfo.userName }}</h2>
          <p class="account">账号：{{ userInfo.userAccount }}</p>
          <p class="profile">{{ userInfo.userProfile || '这个人很神秘，什么都没有留下~' }}</p>
          <a-tag v-if="userInfo.userRole === 'admin'" color="green">管理员</a-tag>
          <a-tag v-else color="blue">普通用户</a-tag>
        </div>
      </div>
    </a-card>

    <a-card title="用户统计" class="stats-card" style="margin-top: 16px;">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-statistic title="上传作品" :value="0" />
        </a-col>
        <a-col :span="8">
          <a-statistic title="获得点赞" :value="0" />
        </a-col>
        <a-col :span="8">
          <a-statistic title="被浏览" :value="0" />
        </a-col>
      </a-row>
    </a-card>

    <a-card title="我的作品" class="works-card" style="margin-top: 16px;">
      <a-empty description="暂无作品" />
    </a-card>
  </div>
</template>

<style scoped>
.user-profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.profile-card {
  .profile-header {
    display: flex;
    align-items: center;
    gap: 32px;

    .profile-info {
      flex: 1;

      .username {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .account {
        color: #999;
        margin-bottom: 8px;
      }

      .profile {
        color: #666;
        margin-bottom: 12px;
        line-height: 1.6;
      }
    }
  }
}

.stats-card,
.works-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
