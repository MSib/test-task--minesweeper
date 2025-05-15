<script setup lang="ts">
import HeaderMenu from '@/components/HeaderMenu.vue'
</script>

<template>
  <div>
    <header class="header">
      <HeaderMenu />
    </header>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style>
.content {
  padding: 0 10px 10px 10px;
}
</style>
