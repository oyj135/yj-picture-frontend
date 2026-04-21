<script lang="ts" setup>
import { computed, h, ref } from 'vue'
import { PictureOutlined, UserOutlined } from '@ant-design/icons-vue'
import type { MenuProps } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

const loginUserStore = useLoginUserStore()
loginUserStore.fetchLoginUser()

// 菜单列表
const originItems = [
  {
    key: '/',
    icon: () => h(PictureOutlined),
    label: '公共图库',
  },
  {
    key: '/my_space',
    icon: () => h(UserOutlined),
    label: '我的空间',
  },
]

const router = useRouter()
// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

// 当前要高亮的菜单项
const current = ref<string[]>([])
// 监听路由变化，更新高亮的菜单项
router.afterEach((to, from, next) => {
  current.value = [to.path]
})


</script>

<template>
  <div id="globalSider">
    <a-layout-sider v-if="loginUserStore.loginUser.id" 
    class="sider" width="200" breakpoint="lg" collapsed-width="0">
      <a-menu
        mode="inline"
        v-model:selectedKeys="current"
        :items="originItems"
        @click="doMenuClick"
      />
    </a-layout-sider>
  </div>
</template>

<style scoped>
#globalSider .ant-layout-sider {
  background: none;
}

#globalSider :deep(.ant-layout-sider-children) {
  border-radius: 12px;
}

#globalSider :deep(.ant-menu) {
  background: transparent;
}

#globalSider :deep(.ant-menu-item) {
  margin: 6px 10px;
  border-radius: 8px;
}
</style>
