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
})

const { row, col } = defineProps({
  row: { type: Number, required: true },
  col: { type: Number, required: true },
})

const store = useMainStore()
const { cellClicked, toggleFlag } = store

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
  currentFlag.value = flagTypes.none
  cellValue.value = value.toString()
  isOpen.value = true
}

function changeFlag() {
  switch (currentFlag.value) {
    case flagTypes.flag:
      currentFlag.value = flagTypes.maybe
      isFlagged.value = false
      break
    case flagTypes.maybe:
      currentFlag.value = flagTypes.none
      break

    default:
      currentFlag.value = flagTypes.flag
      isFlagged.value = true
      break
  }
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
  --cell-color-1: #00e; /* 1 - синяя */
  --cell-color-2: #070; /* 2 - зелёная */
  --cell-color-3: #e00; /* 3 - красная */
  --cell-color-4: #009; /* 4 — тёмно-синяя */
  --cell-color-5: #900; /* 5 — коричневая */
  --cell-color-6: #077; /* 6 — бирюзовая */
  --cell-color-7: #000; /* 7 - чёрная */
  --cell-color-8: #fff; /* 8 - белая */
  --cell-color: var(--cell-color-7);
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
