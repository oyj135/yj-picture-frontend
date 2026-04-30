<script setup lang="ts">
import { getSpaceVoById } from '@/api/spaceController'
import SpaceCategoryAnalyze from '@/components/analyze/SpaceCategoryAnalyze.vue'
import SpaceRankAnalyze from '@/components/analyze/SpaceRankAnalyze.vue'
import SpaceSizeAnalyze from '@/components/analyze/SpaceSizeAnalyze.vue'
import SpaceTagAnalyze from '@/components/analyze/SpaceTagAnalyze.vue'
import SpaceUsageAnalyze from '@/components/analyze/SpaceUsageAnalyze.vue'
import SpaceUserActionAnalyze from '@/components/analyze/SpaceUserActionAnalyze.vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { message } from 'ant-design-vue'
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 空间 id
const spaceId = computed(() => {
  return route.query?.spaceId as string
})

// 是否查询所有空间
const queryAll = computed(() => {
  return !!route.query?.queryAll
})

// 是否查询公共空间
const queryPublic = computed(() => {
  return !!route.query?.queryPublic
})

const loginUserStore = useLoginUserStore()
const loginUser = loginUserStore.loginUser

const isAdmin = computed(() => {
  return loginUser.userRole === 'admin'
})

// 空间信息
const spaceInfo = ref<API.SpaceVO>()
const spaceLoading = ref(false)

/**
 * 加载空间信息
 */
const fetchSpaceInfo = async () => {
  if (!spaceId.value || queryAll.value || queryPublic.value) {
    return
  }

  spaceLoading.value = true
  try {
    const res = await getSpaceVoById({ id: spaceId.value })
    if (res.data.code === 0 && res.data.data) {
      spaceInfo.value = res.data.data
    } else {
      message.error('获取空间信息失败')
    }
  } catch (error) {
    message.error('获取空间信息失败')
  } finally {
    spaceLoading.value = false
  }
}

watchEffect(() => {
  fetchSpaceInfo()
})
</script>

<template>
  <div id="spaceAnalyzePage">
    <h2>
      空间图库分析 -
      <span v-if="queryAll"> 全部空间 </span>
      <span v-else-if="queryPublic"> 公共图库 </span>
      <span v-else>
        <a :href="`/space/${spaceId}`" target="_blank">
          {{ spaceLoading ? '加载中...' : spaceInfo?.spaceName || `ID: ${spaceId}` }}
        </a>
      </span>
    </h2>
    <div style="margin-bottom: 16px"></div>
    <a-row :gutter="[16, 16]">
      <!-- 空间使用分析 -->
      <a-col :xs="24" :md="12">
        <SpaceUsageAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      </a-col>
      <!-- 空间分类分析 -->
      <a-col :xs="24" :md="12">
        <SpaceCategoryAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      </a-col>
      <!-- 标签分析 -->
      <a-col :xs="24" :md="12">
        <SpaceTagAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      </a-col>
      <!-- 图片大小分段分析 -->
      <a-col :xs="24" :md="12">
        <SpaceSizeAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      </a-col>
      <!-- 用户上传行为分析 -->
      <a-col :xs="24" :md="12">
        <SpaceUserActionAnalyze
          :spaceId="spaceId"
          :queryAll="queryAll"
          :queryPublic="queryPublic"
        />
      </a-col>
      <!-- 空间使用排行分析 -->
      <a-col :xs="24" :md="12">
        <SpaceRankAnalyze
          v-if="isAdmin"
          :spaceId="spaceId"
          :queryAll="queryAll"
          :queryPublic="queryPublic"
        />
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
#spaceAnalyzePage {
  margin-bottom: 20px;
}
</style>
