<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/stores/main.js'
import GameBoard from '@/components/GameBoard.vue'
import GameSettings from '@/components/GameSettings.vue'

const store = useMainStore()
const { settingsAreDisplayed } = storeToRefs(store)
</script>

<template>
  <GameBoard v-if="!settingsAreDisplayed" />
  <GameSettings v-else />
</template>

<style></style>
