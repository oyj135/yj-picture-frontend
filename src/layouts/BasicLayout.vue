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
  padding-inline: 20px;
  color: unset;
  background: white;
  margin-bottom: 1px;
}

#basicLayout .footer {
  background: #efefef;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}

#basicLayout .content {
  background: linear-gradient(to right, #fefefe, #fff);
  margin-bottom: 28px;
  padding: 28px;
}

#basicLayout .sider {
  background: #fff;
  border-right: 0.5px solid #eee;
  padding-top: 20px;
}

#basicLayout :deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
}
</style>
