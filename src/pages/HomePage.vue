<script setup lang="ts">
import { listPictureTagCategory, listPictureVoByPage } from '@/api/pictureController'
import PictureList from '@/components/PictureList.vue'
import { message } from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'

// 数据
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 分页参数
const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
    ...searchParams,
    tags: [] as string[],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })
  const res = await listPictureVoByPage(params)
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})

// 搜索
const doSearch = () => {
  // 重置搜索条件
  searchParams.current = 1
  fetchData()
}

const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const tagList = ref<string[]>([])
const selectedTagList = ref<string[]>([])

// 获取标签和分类选项
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategory()
  if (res.data.code === 0 && res.data.data) {
    // 转换成下拉选项组件接受的格式
    categoryList.value = res.data.data.categoryList ?? []
    tagList.value = res.data.data.tagList ?? []
  } else {
    message.error('加载分类标签失败，' + res.data.message)
  }
}

onMounted(() => {
  getTagCategoryOptions()
})
</script>

<template>
  <div id="homePage">
    <div class="hero-section">
      <h2 class="hero-title">探索精选图片</h2>
      <!-- 搜索框 -->
      <div class="search-bar">
        <a-input-search
          placeholder="从海量图片中搜索"
          v-model:value="searchParams.searchText"
          enter-button="搜索"
          size="large"
          @search="doSearch"
        />
      </div>
    </div>

    <div class="filter-card">
      <!-- 分类 + 标签 -->
      <a-tabs v-model:activeKey="selectedCategory" @change="doSearch">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane v-for="category in categoryList" :key="category" :tab="category" />
      </a-tabs>
      <div class="tag-bar">
        <span class="tag-label">标签：</span>
        <a-space :size="[0, 8]" wrap>
          <a-checkable-tag
            v-for="(tag, index) in tagList"
            :key="tag"
            v-model:checked="selectedTagList[index]"
            @change="doSearch"
          >
            {{ tag }}
          </a-checkable-tag>
        </a-space>
      </div>
    </div>

    <div class="content-card">
      <!-- 图片列表 -->
      <PictureList :dataList="dataList" :loading="loading" />
      <a-pagination
        style="text-align: right"
        v-model:current="searchParams.current"
        v-model:pageSize="searchParams.pageSize"
        :total="total"
        :show-total="() => `图片总数 ${total}`"
        @change="onPageChange"
      />
    </div>
  </div>
</template>

<style scoped>
#homePage {
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(180deg, #f8faff 0%, #f5f7fb 100%);
}

#homePage .search-bar {
  max-width: 640px;
  margin: 0 auto 16px;
}

#homePage .hero-section {
  margin-bottom: 16px;
  text-align: center;
}

#homePage .hero-title {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.4;
  color: #1f2937;
}

#homePage .hero-subtitle {
  margin: 8px 0 20px;
  font-size: 14px;
  color: #6b7280;
}

#homePage .filter-card,
#homePage .content-card {
  padding: 16px;
  border: 1px solid #eef1f6;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
}

#homePage .content-card {
  margin-top: 16px;
}

#homePage .tag-bar {
  margin-top: 8px;
}

#homePage .tag-label {
  margin-right: 8px;
  color: #4b5563;
  font-weight: 500;
}

#homePage :deep(.ant-tabs-nav) {
  margin-bottom: 8px;
}

#homePage :deep(.ant-tabs-tab) {
  padding: 8px 12px;
}

#homePage :deep(.ant-input-search-button) {
  font-weight: 500;
}

#homePage :deep(.ant-tag-checkable) {
  margin-bottom: 8px;
  border-radius: 999px;
  transition: all 0.2s ease;
}

#homePage :deep(.ant-tag-checkable-checked) {
  box-shadow: 0 6px 12px rgba(22, 119, 255, 0.2);
}

@media (max-width: 768px) {
  #homePage {
    padding: 12px;
  }

  #homePage .hero-title {
    font-size: 22px;
  }

  #homePage .filter-card,
  #homePage .content-card {
    padding: 12px;
    border-radius: 10px;
  }
}
</style>
