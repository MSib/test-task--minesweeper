import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import type { GameOptions, RefCell, Winner } from '@/types.ts'
import { modes, type Mode } from '@/gameModes.ts'
import { createField, calculateSerialNumber, showOpenableCells, MINED_CELL } from '@/gameLogic.ts'
import {
  type PointerButton,
  buttons as emulateButtons,
  isTouchDevice as checkTouchSupport,
} from '@/usePointer.ts'

export const useMainStore = defineStore('main', () => {
  const settingsAreDisplayed = ref(true)
  const selectedMode: Ref<Mode> = ref(modes.find((mode) => mode.name === 'easy')!)
  const field = ref<number[][] | null>(null)
  const cellsRef = ref<RefCell[]>([])
  const dialogRef = ref<HTMLDialogElement | null>(null)
  const dialogInputRef = ref<HTMLInputElement | null>(null)
  const flagsAvailable = ref(0)
  const timer = ref(0)
  const timerId = ref<number | undefined>(undefined)
  const movesRemaining = ref<number>(0)
  const won = ref(false)
  const gameOver = ref(false)
  const winners = useLocalStorage('winners', [] as Winner[])
  const isTouchDevice = ref(checkTouchSupport())
  const selectedEmulationButton = ref<PointerButton>(emulateButtons.left)

  function changeEmulationButton(button: PointerButton) {
    selectedEmulationButton.value = button
  }

  function changeDevice(value: boolean) {
    isTouchDevice.value = value
  }
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
    flagsAvailable.value = selectedMode.value.mines
    movesRemaining.value =
      selectedMode.value.rows * selectedMode.value.cols - selectedMode.value.mines
    won.value = false
    gameOver.value = false
    settingsAreDisplayed.value = false
  }

  function restartGame() {
    if (!field.value) {
      return
    }
    clearTimer()
    field.value = null
    cellsRef.value.forEach((cell) => {
      cell.reset()
    })
    flagsAvailable.value = selectedMode.value.mines
    movesRemaining.value =
      selectedMode.value.rows * selectedMode.value.cols - selectedMode.value.mines
    won.value = false
    gameOver.value = false
  }

  function setCellsRef(refs: RefCell[]) {
    cellsRef.value = refs
    field.value = null
  }

  function setDialogRef(dialog: HTMLDialogElement, input: HTMLInputElement) {
    dialogRef.value = dialog ?? null
    dialogInputRef.value = input ?? null
  }

  function cellClicked(row: number, col: number) {
    if (gameOver.value) {
      return
    }
    if (!field.value) {
      field.value = createField(selectedMode.value, row, col)
      startTimer()
    }
    const openedCell = field.value[row - 1][col - 1]
    const isDetonation = openedCell === MINED_CELL
    const openableCells = showOpenableCells(field.value, row, col)
    openableCells.forEach(([fieldRow, fieldCol]) => {
      const sn = calculateSerialNumber(fieldRow + 1, fieldCol + 1, selectedMode.value.cols)
      const isOpen = cellsRef.value[sn - 1].open(field.value![fieldRow][fieldCol])
      if (isOpen && field.value![fieldRow][fieldCol] !== MINED_CELL) {
        movesRemaining.value--
      }
    })
    if (movesRemaining.value === 0 && !isDetonation) {
      stopGame(true)
    }
    if (isDetonation) {
      stopGame(false)
    }
  }

  function toggleFlag(row: number, col: number) {
    if (gameOver.value) {
      return
    }
    const sn = calculateSerialNumber(row, col, selectedMode.value.cols)
    cellsRef.value[sn - 1].marked()
  }

  function incrementFlag() {
    flagsAvailable.value++
  }

  function decrementFlag() {
    flagsAvailable.value--
  }

  function startTimer() {
    const timerStartTime = Date.now()
    timerId.value = setInterval(() => {
      timer.value = Math.floor((Date.now() - timerStartTime) / 1000)
    }, 1000)
  }

  function stopTimer() {
    clearInterval(timerId.value)
    timerId.value = undefined
  }

  function clearTimer() {
    if (timerId.value) {
      stopTimer()
    }
    timer.value = 0
  }

  function stopGame(isWon: boolean = false) {
    stopTimer()
    gameOver.value = true
    if (!isWon) {
      return
    }
    won.value = true
    dialogRef.value?.showModal()
  }

  function addWinner(name: string) {
    if (won.value) {
      const MAX_WINNERS = 10
      let preparedWinners = [...winners.value]
      preparedWinners.push({
        name: name || 'Аноним',
        time: timer.value,
        mode: selectedMode.value.label,
      })
      preparedWinners.sort((a, b) => a.time - b.time)
      preparedWinners = preparedWinners.filter((_, index) => index < MAX_WINNERS)
      winners.value = preparedWinners
    }
  }

  function clearWinners() {
    winners.value = []
  }

  return {
    settingsAreDisplayed,
    toggleDisplayOfSettings,
    modes,
    selectedMode,
    selectMode,
    startGame,
    restartGame,
    cellsRef,
    setCellsRef,
    setDialogRef,
    cellClicked,
    toggleFlag,
    flagsAvailable,
    incrementFlag,
    decrementFlag,
    timer,
    won,
    gameOver,
    winners,
    addWinner,
    clearWinners,
    isTouchDevice,
    changeDevice,
    selectedEmulationButton,
    changeEmulationButton,
  }
})
