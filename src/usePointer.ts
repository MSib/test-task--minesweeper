import { ref, type ShallowRef, onMounted } from 'vue'

/**
 * Numbering in accordance with the documentation
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
 */
export const buttons = {
  left: 0,
  middle: 1,
  right: 2,
} as const
const LONG_PRESS = 500 // ms
const TOUCH_DISTANCE_LIMIT = 20 // px

export const isTouchDevice = () => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches
  )
}

/* Example of use
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { usePointer, type PointerState } from './usePointer.ts'

const targetElement = useTemplateRef('target-button')
const pointer = usePointer({ target: targetElement })
const { state: pointerState } = pointer

function onPointerClick(event: CustomEvent<PointerState>) {
  const { button } = event.detail
  console.log('button', button)
}
</script>
<template>
  <button @pointerClick="onPointerClick" ref="target-button">OK</button>
</template>
*/

export function usePointer(options?: PointerOptions) {
  const initialState: PointerState = {
    isTouch: false,
    button: null,
  }

  const state = ref<PointerState>({ ...initialState })
  const events = ref<string[]>([])
  let pointer = false
  let touchX = 0
  let touchY = 0
  const touchTimer = ref<number | null>(null)
  const touchLeave = ref(false)

  const stateReset = () => {
    events.value = []
    state.value = { ...initialState }
    pointer = false
    touchX = 0
    touchY = 0
  }
  const onPointer = (event: PointerEvent) => {
    if (pointer || state.value.button) stateReset()
    if (!pointer) {
      pointer = true
    }
    events.value.push('pointerdown')
    if (event.button === buttons.middle) {
      onMiddleClick()
    }
  }
  const onTouchStart = (event: TouchEvent) => {
    if (!pointer) {
      pointer = true
    }
    state.value.isTouch = true
    touchX = event.touches[0].clientX
    touchY = event.touches[0].clientY
    touchLeave.value = false
    touchTimer.value = setTimeout(() => {
      onLongPress()
      events.value.push('longpress')
    }, options?.longPress ?? LONG_PRESS)
    events.value.push('touchstart')
  }
  const onTouchEnd = () => {
    if (touchTimer.value) clearTimeout(touchTimer.value)
    touchTimer.value = null
    events.value.push('touchend')
  }
  const onTouchMove = (event: TouchEvent) => {
    if (touchLeave.value) return
    if (touchTimer.value) clearTimeout(touchTimer.value)
    touchTimer.value = null
    const shiftX = Math.abs(touchX - event.touches[0].clientX)
    const shiftY = Math.abs(touchY - event.touches[0].clientY)
    const leaveDistance = options?.leaveDistance ?? TOUCH_DISTANCE_LIMIT
    touchLeave.value = shiftX > leaveDistance || shiftY > leaveDistance

    if (!touchLeave.value) return
    if (touchTimer.value) clearTimeout(touchTimer.value)
    touchTimer.value = null
    events.value.push('touchleave')
  }
  const onClick = () => {
    if ((pointer || state.value.isTouch) && state.value.button === null) {
      state.value.button = buttons.left
      sendButton()
    }
    events.value.push('click')
  }
  const onMiddleClick = () => {
    if (pointer && state.value.button === null) {
      state.value.button = buttons.middle
      sendButton()
    }
    events.value.push('click.middle')
  }
  const onContextmenu = (event: MouseEvent) => {
    event.preventDefault()
    if (state.value.button !== null && !state.value.isTouch) stateReset()
    if (state.value.button === null) {
      state.value.button = buttons.right
      sendButton()
    }
    events.value.push('contextmenu')
  }
  const onLongPress = () => {
    if (pointer && state.value.button === null) {
      state.value.button = buttons.right
      sendButton()
    }
  }
  const sendButton = () => {
    const withTouch = options?.touch !== false || !state.value.isTouch
    if (options?.target?.value && withTouch) {
      const pointerEvent = new CustomEvent<PointerState>('pointerClick', { detail: { ...state.value } })
      options.target.value.dispatchEvent(pointerEvent)
    }
  }
  onMounted(() => {
    if (options?.target?.value) {
      const target = options.target.value
      target.addEventListener('pointerdown', onPointer)
      target.addEventListener('touchstart', onTouchStart)
      target.addEventListener('touchend', onTouchEnd)
      target.addEventListener('touchmove', onTouchMove)
      target.addEventListener('click', onClick)
      target.addEventListener('contextmenu', onContextmenu)
    }
  })

  return { state, events, stateReset }
}

type PointerButtons = typeof buttons
type PointerButton = PointerButtons[keyof PointerButtons]
type PointerState = {
  isTouch: boolean
  button: PointerButton | null
}
type PointerOptions = {
  target?: ShallowRef<HTMLButtonElement | null>
  touch?: boolean // false for refusal
  longPress?: number // ms
  leaveDistance?: number // px
}
export type { PointerButtons, PointerButton, PointerOptions, PointerState }
