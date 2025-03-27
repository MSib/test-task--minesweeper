import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { GameOptions, RefCell } from '@/types.ts'
import { modes, type Mode } from '@/gameModes.ts'
import { createField, calculateSerialNumber, MINED_CELL } from '@/gameLogic.ts'

export const useMainStore = defineStore('main', () => {
  const settingsAreDisplayed = ref(true)
  const selectedMode: Ref<Mode> = ref(modes.find((mode) => mode.name === 'easy')!)
  const field = ref<number[][] | null>(null)
  const cellsRef = ref<RefCell[]>([])

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
    settingsAreDisplayed.value = false
  }

  function setCellsRef(refs: RefCell[]) {
    cellsRef.value = refs
    field.value = null
  }
  function cellClicked(row: number, col: number) {
    const sn = calculateSerialNumber(row, col, selectedMode.value.cols)
    if (!field.value) {
      field.value = createField(selectedMode.value, row, col)
    }
    const openedCell = field.value[row - 1][col - 1]
    cellsRef.value[sn - 1].open(openedCell)

    // check game over conditions
    // const isDetonation = openedCell === MINED_CELL
  }

  function toggleFlag(row: number, col: number) {
    const sn = calculateSerialNumber(row, col, selectedMode.value.cols)
    cellsRef.value[sn - 1].marked()
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
  }
})
