<template>
  <a-modal class="image-cropper" v-model:visible="visible" title="编辑图片" :footer="false" @cancel="closeModal">
    <!-- 图片裁剪器 -->
    <vue-cropper
      ref="cropperRef"
      :img="imageUrl"
      :autoCrop="true"
      :fixedBox="false"
      :centerBox="true"
      :canMoveBox="true"
      :info="true"
      :full="true"
      :infoTrue="true"
      outputType="png"
    />
    <div style="margin-bottom: 16px" />
    <!-- 图片操作 -->
    <div class="image-cropper-actions">
      <a-space>
        <a-button @click="rotateLeft">向左旋转</a-button>
        <a-button @click="rotateRight">向右旋转</a-button>
        <a-button @click="changeScale(1)">放大</a-button>
        <a-button @click="changeScale(-1)">缩小</a-button>
        <a-button type="primary" :loading="loading" @click="handleConfirm">确认</a-button>
      </a-space>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { uploadPicture } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { ref } from 'vue'

interface Props {
  imageUrl?: string
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()

// 编辑器组件的引用
const cropperRef = ref()

// 向左旋转
const rotateLeft = () => {
  cropperRef.value.rotateLeft()
}

// 向右旋转
const rotateRight = () => {
  cropperRef.value.rotateRight()
}

// 缩放
const changeScale = (num: number) => {
  cropperRef.value.changeScale(num)
}

// 是否可见
const visible = ref(false)

// 打开弹窗
const openModal = () => {
  visible.value = true
}

// 关闭弹窗
const closeModal = () => {
  visible.value = false
}

defineExpose({
  openModal,
})

const loading = ref<boolean>(false)

// 确认裁剪
const handleConfirm = () => {
  cropperRef.value.getCropBlob((blob: Blob) => {
    const fileName = (props.picture?.name || 'image') + '.webp'
    const file = new File([blob], fileName, { type: blob.type })
    // 上传图片
    handleUpload({ file })
  })
}

/**
 * 上传
 * @param file
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
    // 关键修复：编辑已有图片时（有id），不传spaceId，避免空间冲突
    const params: API.uploadPictureParams = {
      pictureUploadRequest: {
        id: props.picture?.id,
      }
    }
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
.image-cropper {
  text-align: center;
}

.image-cropper .vue-cropper {
  height: 400px;
}
</style>
