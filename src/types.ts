export interface GameOptions {
  mode: string
  rows: number
  cols: number
  mines: number
}

export interface RefCell {
  open: (value: number) => void
  marked: () => void
}
