<template>
  <div id="addPictureBatchPage">
    <h2 style="margin-bottom: 16px">
      批量创建图片
    </h2>
    <!-- 图片信息表单 -->
    <a-form
      name="formData"
      layout="vertical"
      :model="formData"
      @finish="handleSubmit"
    >
      <a-form-item label="关键词" name="searchText">
        <a-input v-model:value="formData.searchText" placeholder="请输入关键词" />
      </a-form-item>
      <a-form-item label="抓取数量" name="count">
        <a-input-number
          v-model:value="formData.count"
          placeholder="请输入数量"
          :min="1"
          :man="20"
          allowClear
        />
      </a-form-item>
      <a-form-item label="图片名称前缀" name="namePrefix">
        <a-auto-complete
          v-model:value="formData.namePrefix"
          placeholder="请输入图片名称前缀"
          allowClear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading">执行</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { uploadPictureByBatch } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { reactive, ref } from 'vue'
import { useRouter} from 'vue-router'

const picture = ref<API.PictureVO>()
const formData = reactive<API.PictureUploadByBatchRequest>({
  count: 10
})

// 提交任务状态
const loading = ref(false)

const router = useRouter()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {  
  loading.value = true;  
  const res = await uploadPictureByBatch({  
    ...formData,  
  })  
  if (res.data.code === 0 && res.data.data) {  
    message.success(`创建成功，共 ${res.data.data} 条`)  
    router.push({  
      path: '/',  
    })  
  } else {  
    message.error('创建失败，' + res.data.message)  
  }  
  loading.value = false;  
}
</script>

<style scoped>
#addPictureBatchPage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
