import { type Mode } from '@/gameModes.ts'
/** The number that denotes a mine. Must be more than 8 (maximum number of warnings per cell) */
export const MINED_CELL = 9
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
  const protectedMinesCount = Math.min(minesTotal, grid.length * grid[0].length - 1)
  while (minesCount < protectedMinesCount) {
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

  for (const rowString in field) {
    for (const colString in field[rowString]) {
      const row = Number(rowString)
      const col = Number(colString)
      const currentCell = field[row][col]
      if (currentCell !== MINED_CELL) {
        continue
      }
      for (const shift of shifts) {
        const shiftRow = row + shift[0]
        const shiftCol = col + shift[1]
        const isRowValid = shiftRow >= 0 && shiftRow <= maxRow
        const isColValid = shiftCol >= 0 && shiftCol <= maxCol
        if (!isRowValid || !isColValid) {
          continue
        }
        if (preparedField[shiftRow][shiftCol] === MINED_CELL) {
          continue
        }
        preparedField[shiftRow][shiftCol]++
      }
    }
  }
  return preparedField
}

export function showOpenableCells(field: number[][], row: number, col: number) {
  row = row - 1
  col = col - 1
  const isEmptyCell = field[row][col] === 0
  if (!isEmptyCell) {
    return [[row, col]]
  }

  const maxRow = field.length - 1
  const maxCol = field[0].length - 1
  const emptyCells: number[][] = [[row, col]]
  const processedEmptyCells: number[][] = []
  const finishedCells: number[][] = []
  while (emptyCells.length) {
    const [curRow, curCol] = emptyCells[0]
    processedEmptyCells.push(emptyCells[0])
    finishedCells.push(emptyCells[0])
    emptyCells.splice(0, 1)
    for (const shift of shifts) {
      const shiftRow = curRow + shift[0]
      const shiftCol = curCol + shift[1]
      const isRowValid = shiftRow >= 0 && shiftRow <= maxRow
      const isColValid = shiftCol >= 0 && shiftCol <= maxCol
      if (!isRowValid || !isColValid) {
        continue
      }
      const cell = field[shiftRow][shiftCol]
      if (cell > 0) {
        const includedInFinished = includesArray(finishedCells, [shiftRow, shiftCol])
        if (includedInFinished) {
          continue
        }
        finishedCells.push([shiftRow, shiftCol])
      } else if (cell === 0) {
        const includedInProcessed = includesArray(processedEmptyCells, [shiftRow, shiftCol])
        const includedInEmpty = includesArray(emptyCells, [shiftRow, shiftCol])
        if (includedInProcessed || includedInEmpty) {
          continue
        }
        emptyCells.push([shiftRow, shiftCol])
      }
    }
  }
  return finishedCells
}

export function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function calculateSerialNumber(row: number, col: number, cols: number) {
  return (row - 1) * cols + col
}

function includesArray(array: number[][], [row, col]: number[]) {
  const stringsArray = array.reduce((acc: string[], cur: number[]) => {
    acc.push(cur.toString())
    return acc
  }, [])
  if (stringsArray.includes([row, col].toString())) {
    return true
  }
  return false
}
