import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { modes, type Mode } from '@/gameLogic.ts'

export const useMainStore = defineStore('main', () => {
  const settingsAreDisplayed = ref(true)
  function toggleDisplayOfSettings() {
    settingsAreDisplayed.value = !settingsAreDisplayed.value
  }

  const selectedMode: Ref<Mode> = ref(modes.find((mode) => mode.name === 'easy')!)
  function selectMode(preset: Mode) {
    selectedMode.value = preset
  }

  function startGame(options: GameOptions) {
    const chosenMode = modes.find((mode) => mode.name === options.mode)
    if (chosenMode) {
      if (chosenMode.name === 'custom') {
        chosenMode.rows = options.rows
        chosenMode.cols = options.cols
        chosenMode.mines = options.mines
      }
      selectedMode.value = chosenMode
    }
    settingsAreDisplayed.value = false
  }

  return {
    settingsAreDisplayed,
    toggleDisplayOfSettings,
    modes,
    selectedMode,
    selectMode,
    startGame,
  }
})

interface GameOptions {
  mode: string
  rows: number
  cols: number
  mines: number
}
