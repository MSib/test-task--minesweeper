<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/stores/main.js'

const store = useMainStore()
const { modes, startGame } = store
const { selectedMode } = storeToRefs(store)
const modeModel: Ref<string> = ref(selectedMode.value.name)
const rows = ref(selectedMode.value.rows)
const cols = ref(selectedMode.value.cols)
const mines = ref(selectedMode.value.mines)
const CUSTOM_MODE = 'custom'
const MAXIMUM_MIN_PERCENTAGE_FOR_CUSTOM = 0.8

const modeDetails = [
  {
    name: 'rows',
    label: 'Высота',
    model: rows,
    min: 8,
    max: 16,
  },
  {
    name: 'cols',
    label: 'Ширина',
    model: cols,
    min: 8,
    max: 32,
  },
  {
    name: 'mines',
    label: 'Мины',
    model: mines,
    min: 10,
    max: 100,
  },
]

function changeMode() {
  const nextMode = modes.find((mode) => mode.name === modeModel.value)
  if (nextMode) {
    rows.value = nextMode.rows
    cols.value = nextMode.cols
    mines.value = nextMode.mines
  }
}

function filterNumbersForInput(evt: KeyboardEvent) {
  if (!/\d/.test(evt.key)) {
    evt.preventDefault()
  }
}

function preventPaste(evt: Event) {
  const inputEvent = evt as InputEvent
  if (inputEvent.inputType === 'insertFromPaste') {
    evt.preventDefault()
  }
}

function checkDetails() {
  if (modeModel.value === CUSTOM_MODE) {
    const mode = modes.find((mode) => mode.name === modeModel.value)
    const refRows = modeDetails.find((detail) => detail.name === 'rows')
    const refCols = modeDetails.find((detail) => detail.name === 'cols')
    const refMines = modeDetails.find((detail) => detail.name === 'mines')
    const safeMaxMinesValue = Math.round(
      rows.value * cols.value * MAXIMUM_MIN_PERCENTAGE_FOR_CUSTOM
    )
    if (mode && refRows && refCols && refMines) {
      if (rows.value < refRows.min) {
        rows.value = refRows.min
      } else if (rows.value > refRows.max) {
        rows.value = refRows.max
      }
      if (cols.value < refCols.min) {
        cols.value = refCols.min
      } else if (cols.value > refCols.max) {
        cols.value = refCols.max
      }
      if (mines.value < refMines.min) {
        mines.value = refMines.min
      } else if (mines.value > safeMaxMinesValue) {
        mines.value = safeMaxMinesValue
      }
    }
  }
}

function play() {
  checkDetails()
  startGame({ mode: modeModel.value, rows: rows.value, cols: cols.value, mines: mines.value })
}
</script>

<template>
  <div class="settings">
    <section class="modes">
      <h2 class="modes__title">Уровень сложности</h2>
      <ul class="modes__list">
        <li v-for="mode in modes" class="mode">
          <input
            v-model="modeModel"
            :id="mode.name"
            :checked="mode.name === selectedMode.name"
            :value="mode.name"
            @change="changeMode"
            name="mode"
            type="radio"
            class="mode__input"
          />
          <label :for="mode.name" class="mode__label">{{ mode.label }}</label>
        </li>
      </ul>
      <fieldset class="modes__details details" :disabled="modeModel !== CUSTOM_MODE">
        <label v-for="(detail, index) in modeDetails" :key="index" class="details__label"
          >{{ detail.label
          }}<input
            v-model.number="detail.model.value"
            @keypress="filterNumbersForInput"
            @beforeinput="preventPaste"
            @focusout="checkDetails"
            class="details__input"
            type="number"
            :min="detail.min"
            :max="detail.max"
        /></label>
      </fieldset>
    </section>
    <button @click="play" class="play"><span class="play__icon">🎮</span>Играть</button>
  </div>
</template>

<style scoped>
.settings {
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.modes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: center;
}
.modes__title {
  flex-basis: 100%;
  font-size: 1.2em;
  text-align: center;
}
.modes__list {
  margin-block: 0;
  margin-right: 36px;
  padding-left: 0;
  list-style: none;
}
.mode {
  display: flex;
  align-items: center;
  gap: 4px;
}
.mode__label {
  padding: 12px 0;
  flex-grow: 1;
  text-transform: capitalize;
}

.details {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  border: 2px solid #555;
  border-radius: 4px;
}
.details__label {
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.details__input {
  margin-left: 8px;
  padding: 4px 4px 4px 16px;
  width: 48px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
  text-align: center;
}
.details__input:disabled {
  background-color: #aaa;
}

.play {
  margin-block: 0;
  padding: 4px 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: inherit;
  color: #fff;
  background: none;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
}
.play:hover {
  border-color: #555;
}
.play:active {
  transform: scale(1.1);
}
.play__icon {
  font-size: 1.5em;
}
</style>
