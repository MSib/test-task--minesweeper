import { ref, type ShallowRef, onMounted } from 'vue'

/**
 * Numbering in accordance with the documentation
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
 */
const buttons = {
  left: 0,
  middle: 1,
  right: 2,
} as const
const pointerTypes = {
  mouse: 'mouse',
  pen: 'pen',
  touch: 'touch',
} as const
function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches
  )
}

/* Example of use
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { usePointer, type PointerStatus } from './usePointer.ts'

const targetElement = useTemplateRef('target-button')
usePointer({ target: targetElement })
function onPointerClick(event: CustomEvent<PointerStatus>) {
  const { button } = event.detail
  console.log('button', button)
}
</script>
<template>
  <button @pointerClick="onPointerClick" ref="target-button">OK</button>
</template>
*/

function usePointer(options?: PointerOptions) {
  const LONG_PRESS = 500 // ms
  const initialPointerStatus: PointerStatus = {
    pointerId: 0,
    button: null,
    type: null,
    isMouse: false,
    isTouch: false,
    isPen: false,
    start: false,
    end: false,
    cancel: false,
    pressTime: 0,
    longPress: false,
  }
  let startTime = 0
  let pointerStatus = ref<PointerStatus>({ ...initialPointerStatus })
  let active = false
  function onStart(event: PointerEvent) {
    if (!event.isPrimary) return
    reset()
    initialDefinition(event)
    sendButton()
  }
  function onCancel(event: PointerEvent) {
    onEnd(event, true)
  }
  function onEnd(event: PointerEvent, cancel = false) {
    if (!event.isPrimary) return
    if (pointerStatus.value.pointerId !== event.pointerId) return
    pointerStatus.value.start = false
    if (cancel) {
      pointerStatus.value.cancel = true
    } else {
      pointerStatus.value.end = true
    }
    checkTime()
    sendButton()
    clear()
  }
  function clear() {
    pointerStatus.value = { ...initialPointerStatus }
    startTime = 0
  }
  function reset() {
    clear()
  }
  function initialDefinition(event: PointerEvent) {
    const pointerType = identifyPointerType(event.pointerType)
    const newStatus = {
      pointerId: event.pointerId,
      button: identifyButton(event.button),
      type: pointerType,
      isMouse: pointerType === pointerTypes.mouse,
      isTouch: pointerType === pointerTypes.touch,
      isPen: pointerType === pointerTypes.pen,
      start: true,
    }
    startTime = Date.now(),
      pointerStatus.value = { ...pointerStatus.value, ...newStatus }

  }
  function identifyPointerType(type: string): PointerType | null {
    try {
      return pointerTypes[type as keyof typeof pointerTypes]
    } catch (_) {
      return null
    }
  }
  function identifyButton(button: number): PointerButton | null {
    switch (button) {
      case buttons.left: return buttons.left
      case buttons.middle: return buttons.middle
      case buttons.right: return buttons.right
      default: return null
    }
  }
  function checkTime() {
    const diff = Date.now() - startTime
    if (diff > 0) {
      pointerStatus.value.pressTime = diff
      pointerStatus.value.longPress = diff > LONG_PRESS
    }
  }
  function sendButton() {
    const withTouch = options?.touch !== false || !pointerStatus.value.isTouch
    if (options?.target?.value && withTouch) {
      const pointerEvent = new CustomEvent<PointerStatus>('pointerClick', { detail: { ...pointerStatus.value } })
      options.target.value.dispatchEvent(pointerEvent)
    }
  }
  function remove() {
    if (options?.target?.value) {
      active = false
      const target = options.target.value
      target.removeEventListener('pointerdown', onStart)
      target.removeEventListener('pointerup', onEnd)
      target.removeEventListener('pointerleave', onCancel)
      target.removeEventListener('pointercancel', onCancel)
    }
  }
  onMounted(() => {
    if (options?.target?.value) {
      active = true
      const target = options.target.value
      target.addEventListener('pointerdown', onStart)
      target.addEventListener('pointerup', onEnd)
      target.addEventListener('pointerleave', onCancel)
      target.addEventListener('pointercancel', onCancel)
      target.addEventListener('contextmenu', (event) => event.preventDefault())
    }
  })

  return { active, pointerStatus, remove }
}

type PointerButtons = typeof buttons
type PointerButton = PointerButtons[keyof PointerButtons]
type PointerTypes = typeof pointerTypes
type PointerType = PointerTypes[keyof PointerTypes]
type PointerStatus = {
  pointerId: number,
  button: PointerButton | null
  type: PointerType | null,
  isMouse: boolean,
  isTouch: boolean
  isPen: boolean,
  start: boolean,
  end: boolean,
  cancel: boolean,
  pressTime: number,
  longPress: boolean,
}
type PointerOptions = {
  target?: ShallowRef<HTMLButtonElement | null>
  touch?: boolean // false for refusal
  longPress?: number // ms
}
export type { PointerButtons, PointerButton, PointerOptions, PointerStatus }

export { buttons, isTouchDevice, pointerTypes, usePointer, }
