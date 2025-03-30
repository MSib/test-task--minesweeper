import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { GameOptions, RefCell } from '@/types.ts'
import { modes, type Mode } from '@/gameModes.ts'
import { createField, calculateSerialNumber, showOpenableCells, MINED_CELL } from '@/gameLogic.ts'

export const useMainStore = defineStore('main', () => {
  const settingsAreDisplayed = ref(true)
  const selectedMode: Ref<Mode> = ref(modes.find((mode) => mode.name === 'easy')!)
  const field = ref<number[][] | null>(null)
  const cellsRef = ref<RefCell[]>([])
  const flagsAvailable = ref(0)

  function toggleDisplayOfSettings() {
    settingsAreDisplayed.value = !settingsAreDisplayed.value
  }

  function selectMode(preset: Mode) {
    selectedMode.value = preset
  }

  function startGame(options: GameOptions) {
    const chosenMode = modes.find((mode) => mode.name === options.mode)
    if (!chosenMode) {
      return
    }
    if (chosenMode.name === 'custom') {
      chosenMode.rows = options.rows
      chosenMode.cols = options.cols
      chosenMode.mines = options.mines
    }
    selectedMode.value = chosenMode
    flagsAvailable.value = chosenMode.mines
    settingsAreDisplayed.value = false
  }

  function setCellsRef(refs: RefCell[]) {
    cellsRef.value = refs
    field.value = null
  }

  function cellClicked(row: number, col: number) {
    if (!field.value) {
      field.value = createField(selectedMode.value, row, col)
    }
    const openedCell = field.value[row - 1][col - 1]
    const isDetonation = openedCell === MINED_CELL
    const openableCells = showOpenableCells(field.value, row, col)
    openableCells.forEach(([fieldRow, fieldCol]) => {
      const sn = calculateSerialNumber(fieldRow + 1, fieldCol + 1, selectedMode.value.cols)
      cellsRef.value[sn - 1].open(field.value![fieldRow][fieldCol])
    })
    // check game over conditions
    if (isDetonation) {
      console.log('Boom 💣')
    }
  }

  function toggleFlag(row: number, col: number) {
    const sn = calculateSerialNumber(row, col, selectedMode.value.cols)
    cellsRef.value[sn - 1].marked()
  }

  function incrementFlag() {
    flagsAvailable.value++
  }

  function decrementFlag() {
    flagsAvailable.value--
  }
  return {
    settingsAreDisplayed,
    toggleDisplayOfSettings,
    modes,
    selectedMode,
    selectMode,
    startGame,
    cellsRef,
    setCellsRef,
    cellClicked,
    toggleFlag,
    flagsAvailable,
    incrementFlag,
    decrementFlag,
  }
})
