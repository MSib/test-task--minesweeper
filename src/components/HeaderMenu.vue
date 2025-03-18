<script setup></script>

<template>
  <nav class="menu">
    <router-link to="/">Главная</router-link>
    <router-link to="/winners">Победители</router-link>
  </nav>
</template>

<style>
.menu {
  padding: 10px;
  display: flex;
  gap: 10px;
  background-color: #222;
  border-bottom: 1px solid #333;
}
.menu a {
  color: #aaa;
  text-decoration: none;
}
.menu a:hover {
  text-decoration: underline;
}
.menu .router-link-active,
.menu .router-link-exact-active {
  color: #fff;
}
</style>
