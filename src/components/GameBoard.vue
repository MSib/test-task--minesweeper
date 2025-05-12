<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import type { RefCell } from '@/types.ts'
import { useMainStore } from '@/stores/main.js'
import BoardCell from '@/components/BoardCell.vue'
// @ts-ignore: calculateSerialNumber is used in the template
import { calculateSerialNumber } from '@/gameLogic.ts'
import { buttons as pointerButton, isTouchDevice as checkTouchSupport } from '@/usePointer.ts'

const store = useMainStore()
const {
  toggleDisplayOfSettings,
  setCellsRef,
  setDialogRef,
  restartGame,
  addWinner,
  changeDevice,
  changeEmulationButton,
} = store
const {
  selectedMode,
  flagsAvailable,
  timer,
  won,
  gameOver,
  isTouchDevice,
  selectedEmulationButton,
} = storeToRefs(store)
const refs = useTemplateRef('cellRef')
const dialogRef = useTemplateRef('dialog')
const dialogInputRef = useTemplateRef('dialogInput')

function closeDialog() {
  if (dialogRef.value) {
    dialogRef.value.close()
    if (dialogInputRef.value) {
      addWinner(dialogInputRef.value.value)
    }
  }
}

onMounted(() => {
  restartGame()
  if (refs.value) {
    setCellsRef(refs.value as unknown as RefCell[])
  }
  setDialogRef(dialogRef.value!, dialogInputRef.value!)
  changeDevice(checkTouchSupport())
})
</script>

<template>
  <div class="board">
    <div class="bar">
      <p class="counter" title="Количество оставшихся флажков">
        <span class="counter__icon">🚩</span>
        <span class="counter__value">{{ flagsAvailable }}</span>
      </p>
      <button @click="restartGame" class="restart" title="Перезапуск">
        <span class="restart__icon">🔄</span>
      </button>
      <button @click="toggleDisplayOfSettings" class="settings" title="Настройки">
        <span class="settings__icon">⚙️</span>
      </button>
      <p class="timer" title="Таймер">
        <span class="timer__icon">⏱️</span><span class="timer__value">{{ timer }}</span>
      </p>
    </div>
    <div
      :class="{ defeat: gameOver && !won, win: won }"
      :style="`--columns: ${selectedMode.cols}`"
      class="cells"
    >
      <template v-for="row in selectedMode.rows" :key="row">
        <template
          v-for="col in selectedMode.cols"
          :key="calculateSerialNumber(row, col, selectedMode.cols)"
        >
          <BoardCell :row="row" :col="col" ref="cellRef" />
        </template>
      </template>
    </div>
    <div v-if="isTouchDevice" class="emulation-control">
      <button
        @click="changeEmulationButton(pointerButton.left)"
        :class="{ 'emulation-button--selected': selectedEmulationButton === pointerButton.left }"
        class="emulation-control__left emulation-button"
        type="button"
        title="Эмуляция левой кнопки мыши"
      ></button>
      <button
        @click="changeEmulationButton(pointerButton.middle)"
        :class="{ 'emulation-button--selected': selectedEmulationButton === pointerButton.middle }"
        class="emulation-control__middle emulation-button"
        type="button"
        title="Эмуляция средней кнопки мыши"
      ></button>
      <button
        @click="changeEmulationButton(pointerButton.right)"
        :class="{ 'emulation-button--selected': selectedEmulationButton === pointerButton.right }"
        class="emulation-control__right emulation-button"
        type="button"
        title="Эмуляция правой кнопки мыши"
      ></button>
    </div>
    <dialog id="winnerDialog" class="dialog" ref="dialog">
      <p class="dialog__text">Вы победили!</p>
      <div class="dialog__inner">
        <label for="name">Введите имя:</label>
        <input
          @keyup.enter="closeDialog"
          type="text"
          name="name"
          id="name"
          class="dialog__input"
          ref="dialogInput"
        />
        <button @click="closeDialog" type="button" class="dialog__button">OK</button>
      </div>
    </dialog>
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
.cells.win {
  background-color: #5d5;
}
.cells.defeat {
  background-color: #d55;
}
.emulation-control {
  margin: 20px auto 0;
  max-width: 500px;
  display: flex;
  gap: 10px;
  justify-content: center;
}
.emulation-button {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 50%;
  background-size: 75%;
  background-repeat: no-repeat;
  background-position: center;
}
.emulation-button--selected {
  box-shadow: 0 2px 0 1px #fff;
}
.emulation-button--selected.emulation-control__left:not(:focus-visible) {
  background-color: #444;
}
.emulation-button--selected.emulation-control__middle:not(:focus-visible),
.emulation-button--selected.emulation-control__right:not(:focus-visible) {
  background-color: #393;
}
.emulation-control__left {
  background-image: url('/img/left-click-white.png');
}
.emulation-control__middle {
  background-image: url('/img/middle-click-white.png');
}
.emulation-control__right {
  background-image: url('/img/right-click-white.png');
}
.emulation-button:active {
  transform: scale(1.1);
}
.dialog {
  border: 8px solid #000;
  border-style: groove ridge ridge groove;
  border-radius: 6px;
  box-shadow: 0 0 0px 4px #fff;
}
.dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}
.dialog__text {
  margin: 0 0 10px;
  text-align: center;
  font-size: 1.5em;
  font-weight: bold;
}
.dialog__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.dialog__input {
  padding: 8px;
  font: inherit;
  font-size: 1.2em;
  text-align: center;
  border-radius: 6px;
}
.dialog__button {
  padding: 8px 24px;
  font: inherit;
  font-size: 0.9rem;
  font-weight: bold;
  border-width: 4px;
  border-radius: 6px;
  cursor: pointer;
}
</style>
