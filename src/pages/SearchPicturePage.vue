<template>
  <div id="searchPicturePage" class="page-container">
    <h2 class="page-title">以图搜图</h2>
    <h3 class="section-title">原图</h3>
    <a-card class="origin-card">
      <template #cover>
        <img class="result-image" :alt="picture.name" :src="picture.thumbnailUrl ?? picture.url" />
      </template>
    </a-card>
    <h3 class="section-title">识图结果</h3>
    <!-- 图片列表 -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      class="search-result-list"
    >
      <template #renderItem="{ item }">
        <a-list-item style="padding: 0">
          <!-- 单张图片 -->
          <a :href="item.fromUrl" target="_blank">
            <a-card>
              <template #cover>
                <img class="result-image" :src="item.thumbUrl" :loading="loading" />
              </template>
            </a-card>
          </a>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { getPictureVoById, searchPictureByPicture } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const queryPictureId = computed(() => route.query?.pictureId)

// 图片 id
const pictureId = computed(() => {
  return queryPictureId.value || undefined
})

const picture = ref<API.PictureVO>({})

// 获取老数据
const getOldPicture = async () => {
  // 获取数据
  if (queryPictureId.value) {
    const res = await getPictureVoById({
      id: queryPictureId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
    }
  }
}

onMounted(() => {
  getOldPicture()
})

// 以图搜图
const dataList = ref<API.ImageSearchResult[]>([])
const loading = ref<boolean>(true)
// 获取搜图结果
const fetchData = async () => {
  loading.value = true
  try {
    const res = await searchPictureByPicture({
      pictureId: pictureId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data ?? []
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取数据失败：' + e.message)
  }

  loading.value = false
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#searchPicturePage {
  padding: 20px;
}

.page-title {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 700;
}

.section-title {
  margin: 16px 0;
  color: var(--text-secondary);
  font-size: 16px;
}

.origin-card {
  width: 260px;
  border-radius: 12px;
  border-color: var(--border-color);
}

.search-result-list :deep(.ant-card) {
  border-radius: 12px;
  border-color: var(--border-color);
}

.result-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}
</style>
