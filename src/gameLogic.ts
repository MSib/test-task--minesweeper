export const modesNames = ['easy', 'medium', 'hard', 'custom'] as const
export type Mode = {
  name: (typeof modesNames)[number]
  label: string
  cols: number
  rows: number
  mines: number
}

export const modes: Mode[] = [
  {
    name: 'easy',
    label: 'легкий',
    cols: 8,
    rows: 8,
    mines: 10,
  },
  {
    name: 'medium',
    label: 'средний',
    cols: 16,
    rows: 16,
    mines: 40,
  },
  {
    name: 'hard',
    label: 'сложный',
    cols: 32,
    rows: 16,
    mines: 100,
  },
  {
    name: 'custom',
    label: 'пользовательский',
    cols: 32,
    rows: 16,
    mines: 100,
  },
]
