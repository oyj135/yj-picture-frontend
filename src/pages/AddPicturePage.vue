<template>
  <div id="addPicturePage">
    <h2 style="margin-bottom: 16px">
      {{ route.query?.id ? '修改图片' : '创建图片' }}
    </h2>
    <a-typography-paragraph v-if="spaceId" type="secondary">
      保存至空间：<a :href="`/space/${spaceId}`" target="_blank">{{ spaceId }}</a>
    </a-typography-paragraph>

    <!-- 选择上传方式 -->
    <a-tabs v-model:activeKey="uploadType">
      <a-tab-pane key="file" tab="文件上传">
        <!-- 图片上传组件 -->
        <PictureUpload :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
      </a-tab-pane>
      <a-tab-pane key="url" tab="URL 上传" force-render>
        <!-- Url 上传组件 -->
        <UrlPictureUpload :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
      </a-tab-pane>
    </a-tabs>
    <!-- 图片编辑 -->
    <div v-if="picture" class="edit-bar">
      <a-space size="middle" v-if="canEditPicture">
        <a-button :icon="h(EditOutlined)" @click="doEditPicture">编辑图片</a-button>
        <a-tooltip
          v-if="!canUseImageOutPainting && imageOutPaintingDisabledReason"
          :title="imageOutPaintingDisabledReason"
          placement="top"
        >
          <a-button type="primary" ghost :icon="h(FullscreenOutlined)" disabled> AI 扩图 </a-button>
        </a-tooltip>
        <a-button
          v-else-if="canUseImageOutPainting"
          type="primary"
          ghost
          :icon="h(FullscreenOutlined)"
          @click="doImagePainting"
        >
          AI 扩图
        </a-button>
        <ImageCropper
          ref="imageCropperRef"
          :imageUrl="picture?.url"
          :picture="picture"
          :spaceId="spaceId"
          :space="space"
          :onSuccess="onCropSuccess"
        />
        <ImageOutPainting
          ref="imageOutPaintingRef"
          :picture="picture"
          :spaceId="spaceId"
          :onSuccess="onImageOutPaintingSuccess"
        />
      </a-space>
    </div>
    <!-- 图片信息表单 -->
    <a-form
      v-if="picture"
      name="pictureForm"
      layout="vertical"
      :model="pictureForm"
      @finish="handleSubmit"
    >
      <a-form-item label="名称" name="name">
        <a-input v-model:value="pictureForm.name" placeholder="请输入名称" />
      </a-form-item>
      <a-form-item label="简介" name="introduction">
        <a-textarea
          v-model:value="pictureForm.introduction"
          placeholder="请输入简介"
          :rows="2"
          autoSize="{minRows: 2, maxRows: 5}"
          allowClear
        />
      </a-form-item>
      <a-form-item label="分类" name="category">
        <a-auto-complete
          v-model:value="pictureForm.category"
          placeholder="请输入分类"
          :options="categoryOptions"
          allowClear
        />
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          v-model:value="pictureForm.tags"
          mode="tags"
          placeholder="请输入标签"
          :options="tagOptions"
          allowClear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">
          {{ route.query?.id ? '修改' : '创建' }}
        </a-button>
      </a-form-item>
    </a-form>
    <ImageCropper
      :imageUrl="picture?.url"
      :picture="picture"
      :spaceId="spaceId"
      @crop-success="onSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { editPicture, getPictureVoById, listPictureTagCategory } from '@/api/pictureController'
import PictureUpload from '@/components/PictureUpload.vue'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'
import { message } from 'ant-design-vue'
import { computed, h, onMounted, reactive, ref, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ImageCropper from '@/components/ImageCropper.vue'
import { EditOutlined, FullscreenOutlined } from '@ant-design/icons-vue'
import ImageOutPainting from '@/components/ImageOutPainting.vue'
import { getSpaceById, getSpaceVoById } from '@/api/spaceController'

const picture = ref<API.PictureVO>()

const uploadType = ref<'file' | 'url'>('file')

// 空间 id
const spaceId = computed(() => {
  return route.query?.spaceId
})

/**
 * 上传成功
 * @param newPicture
 */
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
}

const pictureForm = reactive<API.PictureEditRequest>({})

const router = useRouter()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  const pictureId = picture.value?.id
  if (!pictureId) {
    message.error('请先上传图片')
    return
  }
  const res = await editPicture({
    id: pictureId,
    spaceId: spaceId.value,
    ...values,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建成功')
    // 跳转到图片详情页
    router.push({
      path: `/picture/${pictureId}`,
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
}

interface OptionType {
  value: string
  label: string
}

const categoryOptions = ref<OptionType[]>([])
const tagOptions = ref<OptionType[]>([])

// 获取标签和分类选项
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategory()
  if (res.data.code === 0 && res.data.data) {
    // 转换成下拉选项组件接受的格式
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
}

onMounted(() => {
  getTagCategoryOptions()
})

const route = useRoute()
// 获取老数据
const getOldPicture = async () => {
  // 获取数据
  const id = route.query?.id
  if (id) {
    //const pictureId = Number(id)
    const res = await getPictureVoById({
      id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
      pictureForm.name = data.name
      pictureForm.introduction = data.introduction
      pictureForm.category = data.category
      pictureForm.tags = data.tags
    }
  }
}

onMounted(() => {
  getOldPicture()
})

// 图片编辑弹窗引用
const imageCropperRef = ref()

// 编辑图片
const doEditPicture = () => {
  if (imageCropperRef.value) {
    imageCropperRef.value.openModal()
  }
}

// 编辑成功事件
const onCropSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  // 关闭弹窗
  imageCropperRef.value.closeModal()
}

// AI 扩图弹窗引用
const imageOutPaintingRef = ref()

// AI 扩图
const doImagePainting = () => {
  if (imageOutPaintingRef.value) {
    imageOutPaintingRef.value.openModal()
  }
}

// 编辑成功事件
const onImageOutPaintingSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}

// 公共空间不能编辑图片
const canEditPicture = computed(() => {
  if (!picture.value) {
    return false
  }
  // 公共空间不能编辑图片（spaceId为null、undefined或0表示公共空间）
  if (spaceId.value === null) {
    return false
  }
  return true
})

// 判断是否可以使用AI扩图
const canUseImageOutPainting = computed(() => {
  if (!picture.value) {
    return false
  }

  // 公共空间不能显示AI扩图按钮（spaceId为null表示公共空间）
  if (!spaceId.value) {
    return false
  }
  // 检查图像格式
  const supportedFormats = ['jpg', 'jpeg', 'png', 'heif', 'webp']
  const format = picture.value.picFormat?.toLowerCase()
  if (!format || !supportedFormats.includes(format)) {
    return false
  }

  // 检查图像大小（不超过10MB）
  if (picture.value.picSize && picture.value.picSize > 10 * 1024 * 1024) {
    return false
  }

  // 检查图像分辨率
  const width = picture.value.picWidth
  const height = picture.value.picHeight

  if (!width || !height) {
    return false
  }

  // 分辨率不低于512×512且不超过4096×4096
  if (width < 512 || height < 512 || width > 4096 || height > 4096) {
    return false
  }

  // 单边长度范围：[512, 4096]
  if (width < 512 || width > 4096 || height < 512 || height > 4096) {
    return false
  }

  return true
})

// 获取AI扩图不可用的原因
const imageOutPaintingDisabledReason = computed(() => {
  if (!picture.value) {
    return ''
  }

  // 公共空间
  if (!spaceId.value) {
    return '公共空间不支持AI扩图功能'
  }

  // 检查图像格式
  const supportedFormats = ['jpg', 'jpeg', 'png', 'heif', 'webp']
  const format = picture.value.picFormat?.toLowerCase()
  if (!format || !supportedFormats.includes(format)) {
    return `不支持的图片格式：${format || '未知'}，仅支持 JPG、JPEG、PNG、HEIF、WEBP`
  }

  // 检查图像大小（不超过10MB）
  if (picture.value.picSize && picture.value.picSize > 10 * 1024 * 1024) {
    const sizeMB = (picture.value.picSize / 1024 / 1024).toFixed(2)
    return `图片大小超限：${sizeMB}MB，不能超过10MB`
  }

  // 检查图像分辨率
  const width = picture.value.picWidth
  const height = picture.value.picHeight

  if (!width || !height) {
    return '无法获取图片尺寸信息'
  }

  // 分辨率不低于512×512且不超过4096×4096
  if (width < 512 || height < 512) {
    return `图片分辨率过低：${width}×${height}，不能低于512×512像素`
  }

  if (width > 4096 || height > 4096) {
    return `图片分辨率过高：${width}×${height}，不能超过4096×4096像素`
  }

  return ''
})

const space = ref<API.SpaceVO>()

// 获取空间信息
const fetchSpace = async () => {
  // 获取数据
  if (spaceId.value) {
    const res = await getSpaceVoById({
      id: spaceId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    }
  }
}

watchEffect(() => {
  fetchSpace()
})

</script>

<style scoped>
#addPicturePage .edit-bar {
  text-align: center;
  margin: 16px 0;
}

#addPicturePage {
  max-width: 820px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

#addPicturePage :deep(.ant-tabs-nav) {
  margin-bottom: 18px;
}

#addPicturePage :deep(.ant-form-item-label > label) {
  color: var(--text-secondary);
}
</style>
