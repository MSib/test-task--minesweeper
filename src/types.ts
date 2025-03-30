export interface GameOptions {
  mode: string
  rows: number
  cols: number
  mines: number
}

export interface RefCell {
  open: (value: number) => boolean
  marked: () => void
  reset: () => void
}

export interface Winner {
  name: string
  time: number
  mode: string
}
