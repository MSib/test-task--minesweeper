<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMainStore } from '@/stores/main.js'
import { MINED_CELL } from '@/gameLogic.ts'

const cell = ref(null)
const cellValue = ref('')

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

function handleClick() {
  if (isOpen.value || isFlagged.value) {
    return
  }
  cellClicked(row, col)
}

function handleRightClick(evt: MouseEvent) {
  evt.preventDefault()
  if (isOpen.value) {
    return
  }
  toggleFlag(row, col)
}

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
  cell.value = null
  cellValue.value = ''
  isOpen.value = false
  isFlagged.value = false
  currentFlag.value = flagTypes.none
}

onMounted(() => {})
</script>

<template>
  <button
    @click="handleClick"
    @contextmenu="handleRightClick"
    :class="{ open: isOpen, mined: cellValue === MINED_CELL.toString() && isOpen }"
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
</style>
