<script setup lang="ts">
import { listPictureVoByPage } from '@/api/pictureController'
import PictureList from '@/components/PictureList.vue'
import PictureSearchForm from '@/components/PictrueSearchForm.vue'
import { getSpaceVoById } from '@/api/spaceController'
import { formatSize } from '@/utils'
import { message } from 'ant-design-vue'
import { computed, onMounted, ref } from 'vue'

interface Props {
  id: string | number
}

const props = defineProps<Props>()
const space = ref<API.SpaceVO>({})
const spaceId = props.id as number
const spaceUsagePercent = computed(() => {
  const totalSize = Number(space.value.totalSize ?? 0)
  const maxSize = Number(space.value.maxSize ?? 0)
  if (!maxSize || Number.isNaN(totalSize) || Number.isNaN(maxSize)) {
    return 0
  }
  const percent = (totalSize * 100) / maxSize
  if (percent > 0 && percent < 1) {
    return 1
  }
  return Number(Math.min(100, percent).toFixed(2))
})

// 获取空间详情
const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoById({
      id: spaceId,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    } else {
      message.error('获取空间详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取空间详情失败：' + e.message)
  }
}

onMounted(() => {
  fetchSpaceDetail()
})

// 数据
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)

// 搜索条件
const searchParams = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
    spaceId: spaceId,
    ...searchParams.value,
  }
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

// 分页参数
const onPageChange = (page: number, pageSize: number) => {
  searchParams.value.current = page
  searchParams.value.pageSize = pageSize
  fetchData()
}

// 搜索
const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1,
  }
  fetchData()
}

// 同步刷新图片列表和空间统计，确保占用空间实时变化
const reloadAll = async () => {
  await Promise.all([fetchData(), fetchSpaceDetail()])
}
</script>

<template>
  <div id="spaceDetailPage">
    <!-- 空间信息 -->
    <a-flex justify="space-between">
      <h2>{{ space.spaceName }}（私有空间）</h2>
      <a-space size="middle">
        <a-button type="primary" :href="`/add_picture?spaceId=${id}`" target="_blank">
          + 创建图片
        </a-button>
        <a-tooltip
          :title="`占用空间 ${formatSize(space.totalSize)} / ${formatSize(space.maxSize)}`"
        >
          <a-progress
            type="circle"
            :percent="spaceUsagePercent"
            :size="42"
          />
        </a-tooltip>
      </a-space>
    </a-flex>
    <!-- 搜索表单 -->
    <PictureSearchForm :onSearch="onSearch" />
    <div style="margin-bottom: 16px;"></div>
    <!-- 图片列表 -->
    <PictureList :dataList="dataList" :loading="loading" :show-op="true" :onReload="reloadAll" />
    <!-- 分页 -->
    <a-pagination
      style="text-align: right"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      :show-total="() => `图片总数 ${total} / ${space.maxCount}`"
      @change="onPageChange"
    />
  </div>
</template>

<style scoped></style>
