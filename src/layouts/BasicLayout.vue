<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalSider from '@/components/GlobalSider.vue'
</script>

<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <!-- 头部 -->
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>

      <!-- 左侧菜单 -->
      <a-layout>
        <GlobalSider class="sider" />
        <!-- 中间内容 -->
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>

      <!-- 底部 -->
      <a-layout-footer class="footer">
        <a href="https://blog.ouyangjian.com" target="_blank"> MyBlog by 渔夫·星辰 </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<style lang="scss" scoped>
#basicLayout .header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 72px;
  line-height: 72px;
  padding-inline: 24px;
  color: unset;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
}

#basicLayout .footer {
  background: transparent;
  padding: 16px 0 20px;
  text-align: center;
  color: var(--text-secondary);
}

#basicLayout .content {
  min-height: calc(100vh - 140px);
  margin: 16px 16px 0;
  padding: 8px;
}

#basicLayout .sider {
  margin: 16px 0 0 16px;
  border-right: none;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
  padding-top: 12px;
  overflow: hidden;
}

#basicLayout :deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
}

@media (max-width: 992px) {
  #basicLayout .content {
    margin: 12px;
    padding: 0;
  }

  #basicLayout .sider {
    margin: 12px 0 0 12px;
  }
}
</style>
