<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue';
</script>

<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <!-- 头部 -->
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>

      <!-- 中间内容 -->
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>

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
  margin-bottom: 16px;
  color: unset;
  background: white;
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
  padding: 20px;
}
</style>
