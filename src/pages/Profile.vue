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
            <a-upload
              :show-upload-list="false"
              :custom-request="handleAvatarUpload"
              :before-upload="beforeUpload"
            >
              <a-button :loading="uploading">上传头像</a-button>
            </a-upload>
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
    <a-modal
      v-model:open="cropModalOpen"
      title="选择头像区域"
      ok-text="确认上传"
      cancel-text="取消"
      :confirm-loading="uploading"
      @ok="confirmCropUpload"
      @cancel="cancelCropUpload"
    >
      <div class="cropper-wrapper">
        <div class="crop-preview">
          <img
            v-if="cropImageUrl"
            :src="cropImageUrl"
            class="crop-image"
            :style="cropImageStyle"
            alt="裁剪预览"
          />
        </div>
        <a-typography-text type="secondary">拖动下方滑块选择头像显示范围</a-typography-text>
        <div class="slider-item">
          <span>缩放</span>
          <a-slider v-model:value="cropState.scale" :min="1" :max="3" :step="0.01" />
        </div>
        <div class="slider-item">
          <span>左右</span>
          <a-slider v-model:value="cropState.offsetX" :min="-120" :max="120" :step="1" />
        </div>
        <div class="slider-item">
          <span>上下</span>
          <a-slider v-model:value="cropState.offsetY" :min="-120" :max="120" :step="1" />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { RcFile, UploadRequestOption as RcCustomRequestOptions } from 'ant-design-vue/es/vc-upload/interface'
import { UserOutlined } from '@ant-design/icons-vue'
import { getLoginUser, updateUser } from '@/api/userController'
import { uploadPicture } from '@/api/pictureController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

const loginUserStore = useLoginUserStore()

const uploading = ref(false)
const saving = ref(false)
const cropModalOpen = ref(false)
const cropImageUrl = ref('')
const cropState = reactive({
  scale: 1,
  offsetX: 0,
  offsetY: 0,
})
const cropMeta = reactive({
  naturalWidth: 0,
  naturalHeight: 0,
  baseWidth: 240,
  baseHeight: 240,
})
const cropSourceFile = ref<File | null>(null)
const uploadCallbacks = ref<{
  onSuccess?: RcCustomRequestOptions['onSuccess']
  onError?: RcCustomRequestOptions['onError']
} | null>(null)

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

const handleAvatarUpload = async (options: RcCustomRequestOptions) => {
  const { file, onSuccess, onError } = options
  const rawFile = file as File
  const imageMeta = await getImageMeta(rawFile)
  if (!imageMeta) {
    onError?.(new Error('读取图片失败') as any)
    return
  }
  cropSourceFile.value = rawFile
  uploadCallbacks.value = { onSuccess, onError }
  cropImageUrl.value = imageMeta.url
  cropMeta.naturalWidth = imageMeta.width
  cropMeta.naturalHeight = imageMeta.height
  const baseSize = 240
  const imageRatio = imageMeta.width / imageMeta.height
  if (imageRatio >= 1) {
    cropMeta.baseHeight = baseSize
    cropMeta.baseWidth = baseSize * imageRatio
  } else {
    cropMeta.baseWidth = baseSize
    cropMeta.baseHeight = baseSize / imageRatio
  }
  cropState.scale = 1
  cropState.offsetX = 0
  cropState.offsetY = 0
  cropModalOpen.value = true
}

const getImageMeta = async (file: File) => {
  const imageUrl = URL.createObjectURL(file)
  const image = new Image()
  image.src = imageUrl
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = reject
    })
    return {
      url: imageUrl,
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
    }
  } catch (e) {
    URL.revokeObjectURL(imageUrl)
    return null
  }
}

const cropImageStyle = computed(() => {
  const width = cropMeta.baseWidth * cropState.scale
  const height = cropMeta.baseHeight * cropState.scale
  return {
    width: `${width}px`,
    height: `${height}px`,
    transform: `translate(${cropState.offsetX}px, ${cropState.offsetY}px)`,
  }
})

const makeCroppedBlob = async () => {
  if (!cropSourceFile.value) {
    return null
  }
  const image = new Image()
  image.src = cropImageUrl.value
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = reject
  })
  const canvas = document.createElement('canvas')
  const outputSize = 512
  canvas.width = outputSize
  canvas.height = outputSize
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return null
  }
  const previewSize = 240
  const factor = outputSize / previewSize
  const drawWidth = cropMeta.baseWidth * cropState.scale * factor
  const drawHeight = cropMeta.baseHeight * cropState.scale * factor
  const centerX = outputSize / 2 + cropState.offsetX * factor
  const centerY = outputSize / 2 + cropState.offsetY * factor
  const drawX = centerX - drawWidth / 2
  const drawY = centerY - drawHeight / 2
  ctx.clearRect(0, 0, outputSize, outputSize)
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)
  return await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92)
  })
}

const confirmCropUpload = async () => {
  if (!cropSourceFile.value) {
    return
  }
  uploading.value = true
  try {
    const croppedBlob = await makeCroppedBlob()
    if (!croppedBlob) {
      throw new Error('头像裁剪失败')
    }
    const formData = new FormData()
    formData.append('file', croppedBlob, cropSourceFile.value.name || 'avatar.jpg')
    const params: API.uploadPictureParams = {
      pictureUploadRequest: {},
    }
    const res = await uploadPicture(params, formData as any, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    if (res.data.code === 0 && res.data.data) {
      profileForm.userAvatar = res.data.data.url ?? ''
      message.success('头像上传成功')
      uploadCallbacks.value?.onSuccess?.(res.data, cropSourceFile.value as any)
      cropModalOpen.value = false
      cleanupCropData()
    } else {
      const error = new Error(res.data.message || '头像上传失败')
      message.error(error.message)
      uploadCallbacks.value?.onError?.(error as any)
    }
  } catch (e: any) {
    message.error('头像上传失败：' + (e?.message || '网络错误'))
    uploadCallbacks.value?.onError?.(e)
  } finally {
    uploading.value = false
  }
}

const cleanupCropData = () => {
  if (cropImageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(cropImageUrl.value)
  }
  cropImageUrl.value = ''
  cropSourceFile.value = null
  uploadCallbacks.value = null
}

const cancelCropUpload = () => {
  cleanupCropData()
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

#profilePage :deep(.ant-input),
#profilePage :deep(.ant-input-affix-wrapper),
#profilePage :deep(.ant-input-textarea),
#profilePage :deep(.ant-btn) {
  border-radius: 10px;
}

#profilePage :deep(.ant-btn-primary) {
  min-width: 120px;
  font-weight: 600;
}

.avatar-preview {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.18);
}

.cropper-wrapper {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 4px;
}

.crop-preview {
  width: 240px;
  height: 240px;
  margin: 0 auto;
  border-radius: 50%;
  border: 2px solid #dbeafe;
  overflow: hidden;
  background:
    linear-gradient(45deg, #f8fafc 25%, transparent 25%),
    linear-gradient(-45deg, #f8fafc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f8fafc 75%),
    linear-gradient(-45deg, transparent 75%, #f8fafc 75%);
  background-size: 16px 16px;
  background-position:
    0 0,
    0 8px,
    8px -8px,
    -8px 0;
  position: relative;
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.15);
}

.crop-image {
  width: 240px;
  height: 240px;
  object-fit: cover;
  transform-origin: center center;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -120px;
  margin-top: -120px;
}

.slider-item {
  display: grid;
  grid-template-columns: 44px 1fr;
  align-items: center;
  column-gap: 12px;
}

.slider-item span {
  color: #64748b;
  font-size: 13px;
}

:deep(.ant-modal .ant-modal-content) {
  border-radius: 14px;
  overflow: hidden;
}
</style>
