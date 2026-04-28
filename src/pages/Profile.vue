<template>
  <div id="profilePage">
    <h2>个人简介</h2>
    <a-card :bordered="false">
      <a-form layout="vertical" :model="profileForm" @finish="handleSubmit">
        <a-form-item label="头像">
          <a-space direction="vertical" size="middle">
            <img
              v-if="profileForm.userAvatar"
              :src="profileForm.userAvatar"
              class="avatar-preview"
              alt="用户头像"
            />
            <a-avatar v-else :size="96">
              <template #icon>
                <UserOutlined />
              </template>
            </a-avatar>
            <a-space>
              <a-upload
                :show-upload-list="false"
                :custom-request="handleAvatarUpload"
                :before-upload="beforeUpload"
              >
                <a-button :loading="uploading">上传新头像</a-button>
              </a-upload>
              <a-button 
                v-if="profileForm.userAvatar" 
                :icon="h(EditOutlined)" 
                @click="doEditAvatar"
              >
                编辑头像
              </a-button>
            </a-space>
          </a-space>
        </a-form-item>
        <a-form-item label="用户名" name="userName">
          <a-input
            v-model:value="profileForm.userName"
            :maxlength="20"
            show-count
            placeholder="请输入用户名"
          />
        </a-form-item>
        <a-form-item label="简介" name="userProfile">
          <a-textarea
            v-model:value="profileForm.userProfile"
            :rows="4"
            show-count
            :maxlength="300"
            placeholder="请输入你的个人简介"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="saving">保存资料</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 复用 ImageCropper 组件 -->
    <ImageCropper
      ref="imageCropperRef"
      :imageUrl="profileForm.userAvatar"
      :onSuccess="onCropSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { RcFile, UploadRequestOption as RcCustomRequestOptions } from 'ant-design-vue/es/vc-upload/interface'
import { UserOutlined, EditOutlined } from '@ant-design/icons-vue'
import { getLoginUser, updateUser } from '@/api/userController'
import { uploadPicture } from '@/api/pictureController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import ImageCropper from '@/components/ImageCropper.vue'

const loginUserStore = useLoginUserStore()

const uploading = ref(false)
const saving = ref(false)
const imageCropperRef = ref()

const profileForm = reactive<API.UserUpdateRequest>({
  userName: '',
  userAvatar: '',
  userProfile: '',
})

const syncFromLoginUser = (loginUser?: API.LoginUserVO) => {
  profileForm.userName = loginUser?.userName ?? ''
  profileForm.userAvatar = loginUser?.userAvatar ?? ''
  profileForm.userProfile = loginUser?.userProfile ?? ''
}

const loadProfile = async () => {
  const res = await getLoginUser()
  if (res.data.code === 0 && res.data.data) {
    loginUserStore.setLoginUser(res.data.data)
    syncFromLoginUser(res.data.data)
  } else {
    message.error('获取个人信息失败，' + res.data.message)
  }
}

const beforeUpload = (file: RcFile) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('请上传图片文件')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('头像大小不能超过 2MB')
    return false
  }
  return true
}

// 处理头像上传（新建）
const handleAvatarUpload = async ({ file, onSuccess, onError }: RcCustomRequestOptions) => {
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file as Blob)
    
    const params: API.uploadPictureParams = {
      pictureUploadRequest: {}
    }
    
    const res = await uploadPicture(params, formData as any, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    
    if (res.data.code === 0 && res.data.data) {
      const avatarUrl = res.data.data.url ?? ''
      profileForm.userAvatar = avatarUrl
      
      // 立即保存到 user 表
      await saveAvatarToDatabase(avatarUrl)
      
      message.success('头像上传成功')
      onSuccess?.(res.data, file as any)
    } else {
      throw new Error(res.data.message || '头像上传失败')
    }
  } catch (e: any) {
    message.error(e.message || '头像上传失败')
    onError?.(e)
  } finally {
    uploading.value = false
  }
}

// 保存头像到数据库
const saveAvatarToDatabase = async (avatarUrl: string) => {
  const userId = loginUserStore.loginUser.id
  if (!userId) {
    throw new Error('当前未登录')
  }
  
  const res = await updateUser({
    id: userId,
    userAvatar: avatarUrl,
  })
  
  if (res.data.code !== 0) {
    throw new Error(res.data.message || '保存头像失败')
  }
  
  // 更新 store 中的用户信息
  await loadProfile()
}

// 裁剪成功回调
const onCropSuccess = async (newPicture: API.PictureVO) => {
  if (newPicture?.url) {
    try {
      const avatarUrl = newPicture.url
      profileForm.userAvatar = avatarUrl
      
      // 立即保存到 user 表
      await saveAvatarToDatabase(avatarUrl)
      
      message.success('头像更新成功')
    } catch (error: any) {
      message.error(error.message || '头像更新失败')
    }
  }
  
  // 关闭裁剪弹窗
  if (imageCropperRef.value) {
    imageCropperRef.value.closeModal()
  }
}

// 打开编辑头像弹窗
const doEditAvatar = () => {
  if (imageCropperRef.value) {
    imageCropperRef.value.openModal()
  }
}

const handleSubmit = async () => {
  const userId = loginUserStore.loginUser.id
  if (!userId) {
    message.error('当前未登录')
    return
  }
  saving.value = true
  try {
    const res = await updateUser({
      id: userId,
      userName: profileForm.userName,
      userAvatar: profileForm.userAvatar,
      userProfile: profileForm.userProfile,
    })
    if (res.data.code === 0) {
      await loadProfile()
      message.success('保存成功')
    } else {
      message.error('保存失败，' + res.data.message)
    }
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  syncFromLoginUser(loginUserStore.loginUser)
  loadProfile()
})
</script>

<style scoped>
#profilePage {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px;
}

#profilePage h2 {
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: 600;
  color: #1f1f1f;
}

#profilePage :deep(.ant-card) {
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

#profilePage :deep(.ant-card-body) {
  padding: 24px 24px 8px;
}

#profilePage :deep(.ant-form-item-label > label) {
  font-weight: 600;
  color: #334155;
}

.avatar-preview {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.18);
}
</style>