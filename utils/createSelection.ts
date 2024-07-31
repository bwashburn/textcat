export default function createSelection(anchorNode:Node, anchorOffset:number, focusNode:Node, focusOffset:number, originalWindow:Window): Selection | null {
  let selection = originalWindow.getSelection()
  selection?.removeAllRanges()
  Object.defineProperties(selection, {
    anchorNode: {
      value: anchorNode,
      writable: false
    },
    anchorOffset: {
      value: anchorOffset,
      writable: false
    },
    focusNode: {
      value: focusNode,
      writable: false
    },
    focusOffset: {
      value: focusOffset,
      writable: false
    }
  })
  return selection
}