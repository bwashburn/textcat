export default function createSelection(anchorNode:Node, anchorOffset:number, focusNode:Node, focusOffset:number, originalWindow:Window, direction:string = 'forward'): Selection | null {
  let selection = originalWindow.getSelection()
  selection?.removeAllRanges()
  Object.defineProperties(selection, {
    anchorNode: {
      value: anchorNode,
      writable: true
    },
    anchorOffset: {
      value: anchorOffset,
      writable: true
    },
    focusNode: {
      value: focusNode,
      writable: true
    },
    focusOffset: {
      value: focusOffset,
      writable: true
    },
    direction: {
      value: direction,
      writable: true
    },
  })
  return selection
}