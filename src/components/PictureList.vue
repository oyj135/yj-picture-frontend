<template>
  <div class="picture-list">
    <!-- 图片列表 -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <!-- 单张图片 -->
          <a-card class="picture-card" hoverable @click="doClickPicture(picture)">
            <template #cover>
              <img
                class="picture-cover"
                :alt="picture.name"
                :src="picture.thumbnailUrl ?? picture.url"
                loading="lazy"
              />
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex wrap :gap="8" class="tag-wrap">
                  <a-tag color="green" class="category-tag">
                    {{ picture.category ?? '默认' }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag" class="normal-tag">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta> 
            <template v-if="showOp" #actions>
              <search-outlined @click="(e) => doSearch(picture, e)" />
              <share-alt-outlined @click="(e) => doShare(picture, e)" />
              <edit-outlined v-if="canEdit" @click="(e) => doEdit(picture, e)" />
              <delete-outlined v-if="canDelete" @click="(e) => doDelete(picture, e)" />
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
    <ShareModal ref="shareModalRef" title="分享图片" :link="shareLink" />
  </div>
</template>

<script setup lang="ts">
import { deletePicture } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import ShareModal from './ShareModal.vue'
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import { ref } from 'vue'

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOp?: boolean
  canEdit?: boolean
  canDelete?: boolean
  onReload?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false,
  canEdit: false,
  canDelete: false,

})

// 跳转至图片详情
const router = useRouter()
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 编辑
const doEdit = (picture: API.PictureVO, e: Event) => {
  // 阻止冒泡
  e.stopPropagation()
  router.push({
    path: '/add_picture',
    query: {
      id: picture.id,
      spaceId: picture.spaceId,
    },
  })
}

// 删除
const doDelete = async (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  const id = picture.id
  if (!id) {
    return
  }
  const res = await deletePicture({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 让外层刷新
    props.onReload?.()
  } else {
    message.error('删除失败')
  }
}

// 搜索
const doSearch = (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  window.open(`/search_picture?pictureId=${picture.id}`)
}

// 分享弹窗引用
const shareModalRef = ref()
// 分享链接
const shareLink = ref<string>('')

// 分享
const doShare = (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.id}`
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}

</script>

<style scoped>
.picture-list {
  width: 100%;
}

.picture-card {
  overflow: hidden;
  border: 1px solid #edf1f7;
  border-radius: 12px;
  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.picture-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

.picture-cover {
  width: 100%;
  height: 180px;
  object-fit: cover;
  background: #f3f4f6;
}

.tag-wrap {
  margin-top: 4px;
}

.category-tag {
  border-radius: 999px;
  font-weight: 500;
}

.normal-tag {
  border-radius: 999px;
  color: #4b5563;
  background: #f5f7fb;
  border-color: #e5eaf3;
}

.picture-list :deep(.ant-card-meta-title) {
  margin-bottom: 8px;
  font-weight: 600;
  color: #1f2937;
}

.picture-list :deep(.ant-card-body) {
  padding: 14px 14px 10px;
}

.picture-list :deep(.ant-card-actions) {
  background: #fafbfe;
  border-top: 1px solid #eef2f8;
}

.picture-list :deep(.ant-card-actions > li) {
  margin: 8px 0;
}

.picture-list :deep(.ant-card-actions .anticon) {
  color: #6b7280;
  transition: color 0.2s ease, transform 0.2s ease;
}

.picture-list :deep(.ant-card-actions .anticon:hover) {
  color: #1677ff;
  transform: scale(1.08);
}

@media (max-width: 768px) {
  .picture-card {
    border-radius: 10px;
  }

  .picture-cover {
    height: 170px;
  }
}
</style>
