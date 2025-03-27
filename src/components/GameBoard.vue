<script setup lang="ts">
import { ref, useTemplateRef, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import type { RefCell } from '@/types.ts'
import { useMainStore } from '@/stores/main.js'
import BoardCell from '@/components/BoardCell.vue'
// @ts-ignore: calculateSerialNumber is used in the template
import { calculateSerialNumber } from '@/gameLogic.ts'

const store = useMainStore()
const { toggleDisplayOfSettings, setCellsRef } = store
const { selectedMode } = storeToRefs(store)
const refs = useTemplateRef('cellRef')
const timer = ref(0)
const counter = ref(100)

onMounted(() => {
  if (refs.value) {
    setCellsRef(refs.value as unknown as RefCell[])
  }
})
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
    <div class="cells" :style="`--columns: ${selectedMode.cols}`">
      <template v-for="row in selectedMode.rows" :key="row">
        <template
          v-for="col in selectedMode.cols"
          :key="calculateSerialNumber(row, col, selectedMode.cols)"
        >
          <BoardCell :row="row" :col="col" ref="cellRef" />
        </template>
      </template>
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
  user-select: none;
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
  user-select: none;
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
  display: grid;
  grid-template-columns: repeat(var(--columns), 1fr);
  justify-items: start;
  border-radius: 4px;
  background-color: #555;
  overflow-y: auto;
  user-select: none;
}
</style>
