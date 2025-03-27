import { type Mode } from '@/gameModes.ts'
/** The number that denotes a mine. Must be more than 8 (maximum number of warnings per cell) */
export const MINED_CELL: number = 9

export function createField(mode: Mode, excludedRow: number, excludedCol: number) {
  const { rows, cols } = mode
  const emptyGrid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0))
  const minedField = miningField(emptyGrid, mode.mines, excludedRow - 1, excludedCol - 1)
  const fieldWithMinesAndWarnings = placeWarningsOnField(minedField)
  return fieldWithMinesAndWarnings
}

function miningField(
  grid: number[][],
  minesTotal: number,
  excludedGridRow: number,
  excludedGridCol: number
) {
  let minesCount = 0
  while (minesCount < minesTotal) {
    const row = random(0, grid.length - 1)
    const col = random(0, grid[0].length - 1)
    const isExcluded = row === excludedGridRow && col === excludedGridCol
    if (!isExcluded && grid[row][col] < MINED_CELL) {
      grid[row][col] = MINED_CELL
      minesCount++
    }
  }
  return grid
}

function placeWarningsOnField(field: number[][]) {
  const maxRow = field.length - 1
  const maxCol = field[0].length - 1
  const preparedField = field
  const shifts = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ]
  for (const rowString in field) {
    for (const colString in field[rowString]) {
      const row = Number(rowString)
      const col = Number(colString)
      const currentCell = field[row][col]
      if (currentCell === MINED_CELL) {
        for (const shift of shifts) {
          const shiftRow = row + shift[0]
          const shiftCol = col + shift[1]
          const isRowValid = shiftRow >= 0 && shiftRow <= maxRow
          const isColValid = shiftCol >= 0 && shiftCol <= maxCol
          if (isRowValid && isColValid) {
            const cell = preparedField[shiftRow][shiftCol]
            if (cell !== MINED_CELL) {
              preparedField[shiftRow][shiftCol]++
            }
          }
        }
      }
    }
  }
  return preparedField
}

export function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function calculateSerialNumber(row: number, col: number, cols: number) {
  return (row - 1) * cols + col
}
