export enum CaretPos {
  Start = 'START',
  End = 'END',
  Middle = 'MIDDLE'
}

export enum TextAlign {
  Start = 'start',
  End = 'end',
  Left = 'left',
  Right = 'right',
  Center = 'center',
  Justify = 'justify',
  JustifyAll = 'justify-all'
}

export type Breakpoints = number[]

export interface Attribute {
  name: string,
  value: string
}

export interface Tag {
  type: string,
  attributes: Attribute[]
}

export interface Character {
  char: string,
  blockTags: Tag[],
  styleTags: Tag[]
}

export interface Select {
  start: number | null,
  end: number | null,
  caretPosition: CaretPos | null
}

export interface TextCatObject {
  breakpoints: Breakpoints,
  chars: Character[],
  select: Select,
  target: Element
}

export interface CountObj {
  count: number,
  startCount: number | null,
  endCount: number | null
}

export interface ParseOutput {
  breakpoints: Breakpoints,
  chars: Character[],
}

export interface BlockTagPos {
  start: number | null,
  end: number | null
}

export interface SelectionObject {
  count: number,
  anchorNode: Node | null,
  anchorOffset: number,
  focusNode: Node | null,
  focusOffset: number
}