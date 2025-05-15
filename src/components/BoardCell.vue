<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/stores/main.js'
import { MINED_CELL } from '@/gameLogic.ts'
import { type PointerStatus, usePointer, buttons } from '@/usePointer.ts'

const cell = useTemplateRef('cell')
usePointer({ target: cell })
const cellValue = ref('')
const isPressed = ref(false)
const isOpen = ref(false)
const isFlagged = ref(false)
const flagTypes = {
  none: '',
  flag: '🚩',
  maybe: '?',
}

const currentFlag = ref(flagTypes.none)

const computedValue = computed(() => {
  if (isFlagged.value || currentFlag.value === flagTypes.maybe) {
    return currentFlag
  }
  if (cellValue.value === '0') {
    return ''
  }
  if (cellValue.value === MINED_CELL.toString()) {
    return '💣'
  }
  return cellValue
})

defineExpose({
  open,
  marked: changeFlag,
  reset: resetCell,
})

const { row, col } = defineProps({
  row: { type: Number, required: true },
  col: { type: Number, required: true },
})

const store = useMainStore()
const { cellClicked, toggleFlag, incrementFlag, decrementFlag } = store
const { isTouchDevice, selectedEmulationButton, gameOver } = storeToRefs(store)

function open(value: number) {
  if (isFlagged.value) {
    return
  }
  if (isOpen.value) {
    return false
  }
  currentFlag.value = flagTypes.none
  cellValue.value = value.toString()
  isOpen.value = true
  return true
}
function changeFlag() {
  switch (currentFlag.value) {
    case flagTypes.flag:
      incrementFlag()
      currentFlag.value = flagTypes.maybe
      isFlagged.value = false
      break
    case flagTypes.maybe:
      currentFlag.value = flagTypes.none
      break
    default:
      decrementFlag()
      currentFlag.value = flagTypes.flag
      isFlagged.value = true
      break
  }
  return isFlagged.value
}
function resetCell() {
  cellValue.value = ''
  isOpen.value = false
  isFlagged.value = false
  currentFlag.value = flagTypes.none
}
function onPointerClick(event: CustomEvent<PointerStatus>) {
  if (gameOver.value) return
  const { start, end, cancel } = event.detail
  if (start) {
    onStart(event)
    return
  }
  if (end) {
    onEnd(event)
    return
  }
  if (cancel) {
    onEnd(event, true)
    return
  }
}
function onStart(event: CustomEvent<PointerStatus>) {
  const { button } = event.detail
  if (button === buttons.left && !isOpen.value && !isFlagged.value) {
    isPressed.value = true
  }
}
function onEnd(event: CustomEvent<PointerStatus>, cancel = false) {
  const { button, longPress } = event.detail
  if (button === buttons.left) {
    isPressed.value = false
  }
  if (cancel) return
  let pointerButton = button
  const isEmulateNotLeftButton = selectedEmulationButton.value !== buttons.left
  const pressedLeftButton = button === buttons.left
  if (isEmulateNotLeftButton && pressedLeftButton && isTouchDevice.value) {
    pointerButton = selectedEmulationButton.value
  }
  if (pressedLeftButton && longPress && isTouchDevice.value) {
    pointerButton = buttons.right
  }
  switch (pointerButton) {
    case buttons.left:
      onClick()
      break
    case buttons.right:
      onRightClick()
      break
    case buttons.middle:
      onMiddleClick()
      break
  }
}
function onClick() {
  if (isOpen.value || isFlagged.value) {
    return
  }
  cellClicked(row, col)
}
function onRightClick() {
  if (isOpen.value) {
    return
  }
  toggleFlag(row, col)
}
function onMiddleClick() {
  //
}
</script>

<template>
  <button
    @pointerClick="onPointerClick"
    :class="{
      open: isOpen,
      mined: cellValue === MINED_CELL.toString() && isOpen,
      pressed: isPressed,
    }"
    :style="`--cell-color: var(--cell-color-${cellValue});`"
    type="button"
    tabindex="-1"
    class="cell"
    ref="cell"
  >
    {{ computedValue }}
  </button>
</template>

<style scoped>
.cell {
  --side-size: 28px;
  --border-size: 1px;
  --cell-color-1: #00e;
  --cell-color-2: #070;
  --cell-color-3: #e00;
  --cell-color-4: #009;
  --cell-color-5: #900;
  --cell-color-6: #077;
  --cell-color-7: #000;
  --cell-color-8: #fff;
  --cell-color: var(--cell-color-7);
  padding: 0;
  width: var(--side-size);
  height: var(--side-size);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  cursor: pointer;
  border: var(--border-size) outset #fff;
  background: #efefef;
  color: #000;
  font-size: 20px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.cell:disabled {
  background: #efefef;
  color: #000;
}
.cell.open {
  border: var(--border-size) inset #e2e2e2;
  background: #e2e2e2;
  color: var(--cell-color, #000);
}
.cell.mined {
  background-color: #e00;
}
.cell.pressed {
  border: var(--border-size) inset #e2e2e2;
  background-color: #e2e2e2;
}
</style>
