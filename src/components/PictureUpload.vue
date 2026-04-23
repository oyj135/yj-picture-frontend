<template>
  <div class="picture-upload">
    <a-upload
      list-type="picture-card"
      :show-upload-list="false"
      :custom-request="handleUpload"
      :before-upload="beforeUpload"
    >
      <img v-if="picture?.url" :src="picture?.url" alt="avatar" />
      <div v-else>
        <loading-outlined v-if="loading"></loading-outlined>
        <plus-outlined v-else></plus-outlined>
        <div class="ant-upload-text">点击或拖拽上传图片</div>
      </div>
    </a-upload>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { uploadPicture } from '@/api/pictureController'
import type { RcFile } from 'ant-design-vue/es/vc-upload/interface'

interface Props {
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>();

/**
 * 验证图片格式和大小
 * @param file
 */
// 2. 将参数类型修改为 RcFile (或者简单的 File)
const beforeUpload = (file: RcFile) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('不支持上传该格式的图片，推荐 jpg 或 png')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('不能上传超过 2M 的图片')
  }
  return isJpgOrPng && isLt2M
}

const loading = ref<boolean>(false)  
  
/**
 * 自定义上传图片
 */
const handleUpload = async ({ file }: any) => {
  loading.value = true
  try {
    // 1. 构造 FormData 对象用于承载文件
    const formData = new FormData()
    // 注意：'file' 这个 key 必须与后端 Controller 中 @RequestPart("file") 或 MultipartFile 参数名一致
    formData.append('file', file as Blob)

    // 2. 构造符合 API 定义的 params 参数
    // 根据 typings.d.ts，uploadPictureParams 需要包含 pictureUploadRequest 对象
    const params: API.uploadPictureParams = {
      pictureUploadRequest: {
        id: props.picture?.id,
        spaceId: props.spaceId
      }
    }
    // params.spaceId = props.spaceId;
    // 3. 调用接口
    // 关键点：通过 options 覆盖默认的 Content-Type，确保发送 multipart/form-data
    // Axios 会自动处理 boundary，所以这里指定类型即可，或者留空让 Axios 自动推断（但为了对抗生成代码的 json 头，显式指定更安全）
    const res = await uploadPicture(
      params, 
      formData as any, 
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      props.onSuccess?.(res.data.data)
    } else {
      message.error('图片上传失败：' + (res.data.message || '未知错误'))
    }
  } catch (error: any) {
    console.error('Upload error:', error)
    message.error('图片上传失败：' + (error.message || '网络错误'))
  } finally {
    loading.value = false
  }
}

</script>
<style scoped>
.picture-upload :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  min-height: 152px;
  min-width: 152px;
  border-radius: 12px;
  background: #fafcff;
  border-color: var(--border-color);
}

.picture-upload img {
  max-width: 100%;
  max-height: 480px;
  border-radius: 12px;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: var(--text-secondary);
}
</style>
