<script setup lang="ts">
import { ref } from 'vue'
import { useMainStore } from '@/stores/main.js'

const store = useMainStore()
const { toggleDisplayOfSettings } = store

const timer = ref(0)
const counter = ref(100)
</script>

<template>
  <div class="board">
    <div class="bar">
      <p class="counter" title="Количество оставшихся флажков">
        <span class="counter__icon">🚩</span>
        <span class="counter__value">{{ counter }}</span>
      </p>
      <button class="restart" title="Перезапуск">
        <span class="restart__icon">🔄</span>
      </button>
      <button @click="toggleDisplayOfSettings" class="settings" title="Настройки">
        <span class="settings__icon">⚙️</span>
      </button>
      <p class="timer" title="Таймер">
        <span class="timer__icon">⏱️</span><span class="timer__value">{{ timer }}</span>
      </p>
    </div>
    <div class="cells">
      <!-- cell -->
    </div>
  </div>
</template>

<style scoped>
.bar {
  margin: 0 auto;
  max-width: 500px;
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.counter,
.timer {
  margin-block: 0;
  padding: 4px 12px;
  display: flex;
  gap: 4px;
  align-items: center;
  border: 2px solid transparent;
  border-radius: 4px;
  font-size: inherit;
}

.counter__value,
.timer__value {
  font-family: monospace;
  font-size: 1.2em;
}

.restart,
.settings {
  padding: 4px 12px;
  background: none;
  border: none;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 4px;
}

.counter__icon,
.timer__icon,
.restart__icon,
.settings__icon {
  font-size: 1.5em;
}

.counter:hover,
.timer:hover,
.restart:hover,
.settings:hover {
  border-color: #555;
}

.restart:active,
.settings:active {
  transform: scale(1.1);
}

.cells {
  max-width: max-content;
  margin: 0 auto;
  padding: 10px;
  border-radius: 4px;
  background-color: #555;
}
</style>
