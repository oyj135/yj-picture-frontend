<template>
  <a-modal
    class="image-out-painting"
    v-model:visible="visible"
    title="AI 扩图"
    :footer="false"
    @cancel="closeModal"
  >

  <a-row gutter="16">
  <a-col span="12">
    <h4>原始图片</h4>
    <img :src="picture?.url" :alt="picture?.name" style="max-width: 100%" />
    <div v-if="originalDimensions" style="margin-top: 8px; color: #999;">
      尺寸：{{ originalDimensions.width }} × {{ originalDimensions.height }}
    </div>
  </a-col>
  <a-col span="12">
    <h4>扩图结果</h4>
    <img
      v-if="resultImageUrl"
      :src="resultImageUrl"
      :alt="picture?.name"
      style="max-width: 100%"
    />
    <div v-if="resultDimensions" style="margin-top: 8px; color: #999;">
      尺寸：{{ resultDimensions.width }} × {{ resultDimensions.height }}
    </div>
  </a-col>
</a-row>

<div style="margin: 16px 0;">
  <h4>扩图参数设置</h4>
  <a-form layout="vertical">
    <a-form-item label="水平扩展倍数 (X轴)">
      <a-slider 
        v-model:value="xScale" 
        :min="1" 
        :max="4" 
        :step="0.1"
        :marks="{ 1: '1x', 2: '2x', 3: '3x', 4: '4x' }"
      />
      <a-input-number 
        v-model:value="xScale" 
        :min="1" 
        :max="4" 
        :step="0.1"
        style="width: 100%; margin-top: 8px;"
      />
    </a-form-item>
    <a-form-item label="垂直扩展倍数 (Y轴)">
      <a-slider 
        v-model:value="yScale" 
        :min="1" 
        :max="4" 
        :step="0.1"
        :marks="{ 1: '1x', 2: '2x', 3: '3x', 4: '4x' }"
      />
      <a-input-number 
        v-model:value="yScale" 
        :min="1" 
        :max="4" 
        :step="0.1"
        style="width: 100%; margin-top: 8px;"
      />
    </a-form-item>
    <a-alert 
      v-if="predictedDimensions"
      :message="`预计扩图后尺寸：${predictedDimensions.width} × ${predictedDimensions.height}`"
      :type="isExceedLimit ? 'error' : 'info'"
      show-icon
      style="margin-top: 8px;"
    />
  </a-form>
</div>

<a-flex gap="16" justify="center">
  <a-button 
    type="primary" 
    :loading="!!taskId" 
    ghost 
    @click="createTask"
    :disabled="isExceedLimit || !canCreateTask"
  >
    生成图片
  </a-button>
  <a-button 
    type="primary" 
    v-if="resultImageUrl" 
    :loading="uploadLoading" 
    @click="handleUpload"
  >
    应用结果
  </a-button>
</a-flex>


  </a-modal>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { createPictureOutPaintingTask, getPictureOutPaintingTask, uploadPicture, uploadPictureByUrl } from '@/api/pictureController'
import { message } from 'ant-design-vue'

interface Props {
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()

// 是否可见
const visible = ref(false)

// 打开弹窗
const openModal = () => {
  visible.value = true
  // 重置参数
  xScale.value = 2
  yScale.value = 2
  resultImageUrl.value = undefined
  taskId.value = undefined
}

// 关闭弹窗
const closeModal = () => {
  visible.value = false
}

// 暴露函数给父组件
defineExpose({
  openModal,
})

const resultImageUrl = ref<string>()

// 任务 id
let taskId = ref<string>()

// 扩图倍数
const xScale = ref<number>(2)
const yScale = ref<number>(2)

// 原始图片尺寸
const originalDimensions = computed(() => {
  if (!props.picture?.picWidth || !props.picture?.picHeight) {
    return null
  }
  return {
    width: props.picture.picWidth,
    height: props.picture.picHeight
  }
})

// 预测的扩图后尺寸
const predictedDimensions = computed(() => {
  if (!originalDimensions.value) {
    return null
  }
  return {
    width: Math.round(originalDimensions.value.width * xScale.value),
    height: Math.round(originalDimensions.value.height * yScale.value)
  }
})

// 结果图片尺寸
const resultDimensions = computed(() => {
  if (!resultImageUrl.value || !originalDimensions.value) {
    return null
  }
  return predictedDimensions.value
})

// 是否超过最大限制
const isExceedLimit = computed(() => {
  if (!predictedDimensions.value) {
    return false
  }
  return predictedDimensions.value.width > 4096 || predictedDimensions.value.height > 4096
})

// 是否可以创建任务
const canCreateTask = computed(() => {
  return !!props.picture?.id && !!originalDimensions.value
})

// 监听扩图倍数变化，如果超过限制则自动调整
watch([xScale, yScale], () => {
  if (!originalDimensions.value) return
  
  const maxWidth = 4096
  const maxHeight = 4096
  
  // 如果超过限制，给出提示
  if (isExceedLimit.value) {
    message.warning(`扩图后尺寸不能超过 4096×4096，当前预测尺寸：${predictedDimensions.value?.width}×${predictedDimensions.value?.height}`)
  }
})

/**
 * 创建任务
 */
const createTask = async () => {
  if (!props.picture?.id) {
    return
  }
  
  // 再次检查是否超过限制
  if (isExceedLimit.value) {
    message.error(`扩图后尺寸不能超过 4096×4096，请调整扩图倍数`)
    return
  }
  
  const res = await createPictureOutPaintingTask({
    pictureId: props.picture.id,
    // 使用用户设置的扩图参数
    parameters: {
      xScale: xScale.value,
      yScale: yScale.value,
    },
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建任务成功，请耐心等待，不要退出界面')
    console.log(res.data.data.output?.taskId)
    taskId.value = res.data.data.output?.taskId
    // 开启轮询
    startPolling()
  } else {
    message.error('创建任务失败，' + res.data.message)
  }

}



// 轮询定时器
let pollingTimer: NoedJs.Timeout = null

// 清理轮询定时器
const clearPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
    taskId.value = null
  }
}

// 开始轮询
const startPolling = () => {
  if (!taskId.value) return

  pollingTimer = setInterval(async () => {
    try {
      const res = await getPictureOutPaintingTask({
        taskId: taskId.value,
      })
      if (res.data.code === 0 && res.data.data) {
        const taskResult = res.data.data.output
        if (taskResult.taskStatus === 'SUCCEEDED') {
          message.success('扩图任务成功')
          resultImageUrl.value = taskResult.outputImageUrl
          clearPolling()
        } else if (taskResult.taskStatus === 'FAILED') {
          message.error('扩图任务失败')
          clearPolling()
        }
      }
    } catch (error) {
      console.error('轮询任务状态失败', error)
      message.error('检测任务状态失败，请稍后重试')
      clearPolling()
    }
  }, 3000) // 每隔 3 秒轮询一次
}

// 清理定时器，避免内存泄漏
onUnmounted(() => {
  clearPolling()
})

const uploadLoading = ref<boolean>(false)

// 上传图片
const handleUpload = async () => {
  uploadLoading.value = true
  try {
    const params: API.PictureUploadRequest = {
      fileUrl: resultImageUrl.value,
    }
    if (props.picture) {
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrl(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
      // 关闭弹窗
      closeModal()
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    message.error('图片上传失败')
  } finally {
    uploadLoading.value = false
  }
}


</script>

<style scoped>
.image-out-painting {
  text-align: center;
}
</style>