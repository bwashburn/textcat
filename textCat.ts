import { Attribute, BlockTagPos, Breakpoints, CaretPos, Character, CountObj, ParseOutput, TextAlign, Select, SelectionObject, Tag, TextCatObject } from './types.ts'

export default class TextCat {
  private static _containerTags: string[] = ['article', 'aside', 'div', 'footer', 'header', 'main', 'section']
  public static get containerTags(): string[] { return TextCat._containerTags }
  public static set containerTags(tags: string[]) { TextCat._containerTags = tags }

  private static _blockTags: string[] = ['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li']
  public static get blockTags(): string[] { return TextCat._blockTags }
  public static set blockTags(tags: string[]) { TextCat._blockTags = tags }

  private constructor () {}

  public static create(element: Element | null = null): TextCatObject | null {
    let selection = window.getSelection()
    let target: Element | null = TextCat._getEditContainer(element, selection)
    if (target === null) return null
    let po: ParseOutput = TextCat._markupParse(target)

    let elementContainsSelection: boolean = false
    let select: Select = { start: null, end: null, caretPosition: null }
    if (selection !== null && target != null) {
      elementContainsSelection = (element!.contains(selection.anchorNode))? true: false
    }
    if (elementContainsSelection || element === null && selection != null) {
     select = this._parseSelection(target, selection!, po.breakpoints)
    }

    return {
      target: target,
      chars: po.chars,
      breakpoints: po.breakpoints,
      select: select
    }
  }

  public static html(tco: TextCatObject): string {
    let chars = tco.chars
    let breakpoints = tco.breakpoints
    let markupString = ''
    let lastTags = null
    for (let i = 0; i < chars.length; i++) {
      let allCharTags = chars[i].blockTags.concat(chars[i].styleTags)
      let lastChar = chars[i - 1]
      let currentChar = chars[i]
      if (i === 0) { //First Character
        markupString += TextCat._openTags(allCharTags)
        markupString += chars[i].char
        lastTags = allCharTags
      } else if (i === chars.length - 1) { //Last Character
        markupString += chars[i].char
        markupString += TextCat._closeTags(allCharTags)
      } else if (breakpoints.indexOf(i) > -1) { //At breakpoint
        markupString += TextCat._closeTags(lastChar.styleTags)
        markupString += TextCat._compareBlockTags(lastChar.blockTags,  currentChar.blockTags)
        markupString += TextCat._openTags(currentChar.styleTags)
        markupString += chars[i].char
        lastTags = allCharTags
      } else { //All Other Characters
        markupString += TextCat._compareStyleTags(lastChar.styleTags, currentChar.styleTags)
        markupString += chars[i].char
        lastTags = allCharTags
      }
    }
    return markupString
  }

  public static insertText(newText: string, tco: TextCatObject): TextCatObject {
    // process selection
    let charRange = TextCat._parseBlockLevel(tco)
    let breakpointStart = tco.breakpoints.indexOf(charRange.start!)
    let breakpointEnd = (tco.breakpoints.indexOf(charRange.end! + 1) > -1)? tco.breakpoints.indexOf(charRange.end!+ 1): tco.breakpoints.length
    let introTag = (tco.select.start === tco.chars.length)? tco.chars[tco.select.start! - 1]:tco.chars[tco.select.start!]
    let outroTag = tco.chars[Math.max(tco.select.end! - 1, 0)]
    let outroOffset = (tco.select.end! >= tco.breakpoints[ tco.breakpoints.length - 1])? tco.chars.length - tco.select.end! : charRange.end! - (tco.select.end! - 1)    
    // process text
    let regex1 = /•\t/g // Word formatted bullet point
    let regex2 = /\r\n|\r|\n/g // Line breaks
    newText = newText.replace(regex1, '')
    let newTextLineArray = newText.split(regex2)
    newText = newText.replace(regex2, '')
    newTextLineArray = newTextLineArray.filter(item => item) // Remove empty array items
    // Create newTextArray
    let newTextArray = []
    let endLineStartPos = newText.length - newTextLineArray[newTextLineArray.length - 1].length
    for (let i = 0; i < newText.length; i++) {
      let character = newText.charAt(i)
      if (i >= endLineStartPos && newText.length > endLineStartPos) {
        let char = JSON.parse(JSON.stringify(outroTag))
        char.character = character
        newTextArray.push(char)
      } else {
        let char = JSON.parse(JSON.stringify(introTag))
        char.character = character
        newTextArray.push(char)
      }
    }

    //Update breakpoints
    let breakpointsInserts = []
    let characterDelta = newText.length - (tco.select.end! - tco.select.start!)
    if (newTextLineArray.length > 1) { // Multiple line insert
      if (tco.select.start! === tco.select.end!) { // No text to remove
        if (tco.select.caretPosition === CaretPos.End) { // If caret is at the end of a line
          // console.log('1. remove nothing from end of line add multiple lines')
          let count = tco.select.start!
          for (let i = 0; i < newTextLineArray.length; i++) {
            count += newTextLineArray[i].length
            breakpointsInserts.push(count)
          }
          if (tco.breakpoints.length === breakpointEnd) {
            tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1).concat(breakpointsInserts.slice(0, -1))
          } else {
            for (let i = breakpointEnd + 1; i < tco.breakpoints.length; i++) {
              tco.breakpoints[i] += characterDelta
            }
            tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1).concat(breakpointsInserts, tco.breakpoints.slice(breakpointEnd + 1))
          }
        } else {
          // console.log('2. remove nothing add multiple lines')
          let count = tco.select.start!
          for (let i = 0; i < newTextLineArray.length; i++) {
            count += newTextLineArray[i].length
            if (i === newTextLineArray.length - 1) {
              count += outroOffset
              breakpointsInserts.push(count)
            } else { 
              breakpointsInserts.push(count)
            }
          }
          if (tco.breakpoints.length === breakpointEnd) {
            tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1).concat(breakpointsInserts.slice(0, -1))
          } else {
            for (let i = breakpointEnd; i < tco.breakpoints.length; i++) {
              tco.breakpoints[i] += characterDelta
            }
            tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1).concat(breakpointsInserts, tco.breakpoints.slice(breakpointEnd + 1))
          }
        }
      } else {
        if (breakpointStart === breakpointEnd - 1) { //remove from single line
          // console.log('3. remove single line add multiple lines')
          let count = tco.select.start!
          for (let i = 0; i < newTextLineArray.length; i++) {
            count += newTextLineArray[i].length
            if (i === newTextLineArray.length - 1) {
              count += outroOffset
              breakpointsInserts.push(count)
            } else { 
              breakpointsInserts.push(count)
            }
          }
          if (tco.breakpoints.length === breakpointEnd) {
            tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1).concat(breakpointsInserts.slice(0, -1))
          } else {
            for (let i = breakpointEnd; i < tco.breakpoints.length; i++) {
              tco.breakpoints[i] += characterDelta
            }
            tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1).concat(breakpointsInserts, tco.breakpoints.slice(breakpointEnd + 1))
          }
        } else {
          // console.log('4. remove multiple lines add multiple lines')
          let count = tco.select.start!
          for (let i = 0; i < newTextLineArray.length; i++) {
            count += newTextLineArray[i].length
            if (i === newTextLineArray.length - 1) {
              count += outroOffset
              breakpointsInserts.push(count)
            } else { 
              breakpointsInserts.push(count)
            }
          }
          if (breakpointEnd === tco.breakpoints.length) {
            tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1).concat(breakpointsInserts.slice(0, -1))
          } else {
            for (let i = breakpointEnd; i < tco.breakpoints.length; i++) {
              tco.breakpoints[i] += characterDelta
            }
            tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1).concat(breakpointsInserts, tco.breakpoints.slice(breakpointEnd + 1))
          }
        }
      }
    } else { // Single line insert
      if (tco.select.start! === tco.select.end!) { // No text to remove
        if (tco.select.caretPosition === CaretPos.End) { // If caret is at the end of a line
          // console.log('5. remove nothing from end of line add single line')
          for (let i = breakpointStart + 1; i < tco.breakpoints.length; i++) {
            tco.breakpoints[i] += characterDelta
          }
        } else { // if caret is at the beginning or middle of line
          // console.log('6. remove nothing add single line')
          if (breakpointStart + 1 < tco.breakpoints.length) {
            for (let i = breakpointStart + 1; i < tco.breakpoints.length; i++) {
              tco.breakpoints[i] += characterDelta
            }
          }
        }
      } else { // Text to remove
        if (breakpointStart === breakpointEnd - 1) { //remove from single line
          // console.log('7. remove single line add single line')
          if (breakpointStart + 1 < tco.breakpoints.length) {
            for (let i = breakpointStart + 1; i < tco.breakpoints.length; i++) {
              tco.breakpoints[i] += characterDelta
            }
          }
        }
        else { //Remove from multiple lines
          // console.log('8. remove multiple lines add single line')
          for (let i = breakpointEnd; i < tco.breakpoints.length; i++) {
            tco.breakpoints[i] += characterDelta
          }
          if (breakpointEnd === tco.breakpoints.length) {
            tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1)
          } else {
            tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1).concat(tco.breakpoints.slice(breakpointEnd))
          }
          //textObj.breakpoints = textObj.breakpoints.splice(breakpointStart + 1, breakpointEnd - (breakpointStart))
        }
      }
    }
    // console.dir(textObj.breakpoints)

    // Update chars
    tco.chars = tco.chars.slice(0, tco.select.start!).concat(newTextArray, tco.chars.slice(tco.select.end!))
    // console.dir(textObj.chars)

    //Update selection
    tco.select.start = tco.select.start!
    tco.select.end = tco.select.end! + characterDelta
    return tco
  }

  public static changeBlockTag(newTag: Tag, tco: TextCatObject): TextCatObject {
    let charRange = TextCat._parseBlockLevel(tco)
    let chars = tco.chars
    for (let k = charRange.start!; k <= charRange.end!; k++) {
      chars[k].blockTags = TextCat._replaceTopBlockTag (newTag, chars[k].blockTags)
    }
    tco.chars = chars
    return tco
  }

  public static nestIn(tco: TextCatObject): TextCatObject {
    let charRange = TextCat._parseBlockLevel(tco)
    let chars = tco.chars
    let breakpoints = tco.breakpoints
    let replaceChars = []
    let newBlockTags = null
    for (let k = charRange.start!; k < charRange.end!; k++) {
      let char = JSON.parse(JSON.stringify(chars[k]))
      if (breakpoints.length > 1) {
        let bpIndex = breakpoints.indexOf(k)
        if (bpIndex > -1 && k >= breakpoints[1]) { //if breakpoint & At least second block
          let oldBlocks = chars[breakpoints[bpIndex - 1]].blockTags
          let currentBlocks = chars[breakpoints[bpIndex]].blockTags
          if (oldBlocks.length > 1 && oldBlocks.length === currentBlocks.length && oldBlocks[oldBlocks.length - 2].type === currentBlocks[currentBlocks.length - 2].type) {
            let listTag = this.createTag(char.blockTags[char.blockTags.length - 2].type)
            let liTag = this.createTag('li')
            char.blockTags.push(listTag)
            char.blockTags.push(liTag)
            replaceChars.push(JSON.parse(JSON.stringify(char)))
            newBlockTags = JSON.parse(JSON.stringify(char.blockTags))
          } else {
            newBlockTags = null
            replaceChars.push(JSON.parse(JSON.stringify(char)))
          }
        } else if (newBlockTags !== null) {
          char.blockTags = newBlockTags
          replaceChars.push(JSON.parse(JSON.stringify(char)))
        } else {
          replaceChars.push(JSON.parse(JSON.stringify(char)))
        }
      } else {
        tco.chars = chars
        return tco
      }
    }
    tco.chars = JSON.parse(JSON.stringify(chars.slice(0, charRange.start!).concat(replaceChars, chars.slice(charRange.end!))))
    return tco
  }

  public static nestOut(tco: TextCatObject): TextCatObject {
    let charRange = TextCat._parseBlockLevel(tco)
    let chars = tco.chars
    for (let k = charRange.start!; k < charRange.end!; k++) {
      let char = chars[k]
      if (char.blockTags.length > 3) {
          char.blockTags.splice(char.blockTags.length - 3, 2)
      }
    }
    tco.chars = chars
    return tco
  }

  public static createTag(tag: string, attributes: Attribute[] = []): Tag {
    return {
      type: tag,
      attributes: attributes
    }
  }

  public static addTextAlign(alignment: TextAlign, tco: TextCatObject): TextCatObject {
    let charRange = this._parseBlockLevel(tco)
    let chars = tco.chars
    let replaceChars = []
    for (let k = charRange.start!; k < charRange.end!; k++) {
      let char = JSON.parse(JSON.stringify(chars[k]))
      let tag = null
      if (char.blockTags.length > 1) {
        tag = char.blockTags[char.blockTags.length - 1]
      } else {
        tag = char.blockTags[0]
      }
      let pos = tag.attributes.findIndex((style: { value: string | string[] }) => style.value.indexOf('text-align-') > -1)
      if (pos > -1) {
        let classes = tag.attributes[pos].value.split(';')
        classes = classes.map((cl: string | string[]) => (cl.indexOf('text-align-') > -1)? 'text-align-' + alignment: cl)
        tag.attributes[pos].value = classes.join('; ')
        replaceChars.push(char)
      } else {
        tag.attributes.push({ name: 'class', value: 'text-align-' + alignment })
        replaceChars.push(char)
      }
    }
    tco.chars =  JSON.parse(JSON.stringify(chars.slice(0, charRange.start!).concat(replaceChars, chars.slice(charRange.end!))))
    return tco
  }

  public static removeTextAlign(tco: TextCatObject): TextCatObject {
    let charRange = this._parseBlockLevel(tco)
    let chars = tco.chars
    let replaceChars = []
    for (let k = charRange.start!; k < charRange.end!; k++) {
      let char = JSON.parse(JSON.stringify(chars[k]))
      let tag = null
      if (char.blockTags.length > 1) {
        tag = char.blockTags[char.blockTags.length - 1]
      } else {
        tag = char.blockTags[0]
      }
      let pos = tag.attributes.findIndex((style: { value: string | string[] }) => style.value.indexOf('text-align-') > -1)
      if (pos > -1) {
        let classes = tag.attributes[pos].value.split(';')
        classes.splice(classes.findIndex((cl: string | string[]) => (cl.indexOf('text-align-') > -1)), 1)
        if (classes.length > 0) {
          tag.attributes[pos].value = classes.join('; ')
          replaceChars.push(char)
        } else {
          tag.attributes.splice(pos, 1)
          replaceChars.push(char)
        }
      } else {
        replaceChars.push(char)
      }
    }
    tco.chars = JSON.parse(JSON.stringify(chars.slice(0, charRange.start!).concat(replaceChars, chars.slice(charRange.end!))))
    return tco
  }

  public static getTextAlign(tco: TextCatObject): TextAlign | null {
    let charRange = this._parseBlockLevel(tco)
    let chars = tco.chars
    let alignment = ''
    for (let k = charRange.start!; k < charRange.end!; k++) {
      let char = JSON.parse(JSON.stringify(chars[k]))
      let tag = null
      if (char.blockTags.length > 1) {
        tag = char.blockTags[char.blockTags.length - 1]
      } else {
        tag = char.blockTags[0]
      }
      let pos = tag.attributes.findIndex((style: { value: string | string[] }) => style.value.indexOf('text-align-') > -1)
      if (pos > -1) {
        let classes = tag.attributes[pos].value.split(';')
        if (k === charRange.start) {
          alignment = classes.find((cl: string | string[]) => cl.indexOf('text-align-') > -1).substring(11)
        } else if (alignment === '') {
          return null
        } else {
          if (classes.indexOf('text-align-' + alignment) === -1) {
            return null
          }
        }
      }
    }
    return alignment as TextAlign
  }

  public static addStyleTag(tag: Tag, tco: TextCatObject): TextCatObject {
    let blockRange = TextCat._parseBlockLevel(tco)
    let chars = tco.chars
    let styleStart = tco.select.start
    let styleEnd = tco.select.end
    let blockStart = blockRange.start
    let blockEnd = blockRange.end
    for (let k = styleStart!; k < styleEnd!; k++) {
      chars[k].styleTags = TextCat._insertStyleTag(tag, chars[k].styleTags)
    }
    tco.chars = chars
    return tco
  }

  public static removeStyleTag(tag: Tag, tco: TextCatObject): TextCatObject {
    let chars = tco.chars
    let styleStart = tco.select.start
    let styleEnd = tco.select.end
    for (let k = styleStart!; k < styleEnd!; k++) {
      chars[k].styleTags = TextCat._cutStyleTag(tag, chars[k].styleTags)
    }
    tco.chars = chars
    return tco
  }

  public static getSelectedBlockTags(tco: TextCatObject): string {
    let charRange = TextCat._parseBlockLevel(tco)
    let chars = tco.chars
    let breakpoints = tco.breakpoints
    let blockTag = (chars[charRange.start!].blockTags.length > 1)? chars[charRange.start!].blockTags[chars[charRange.start!].blockTags.length - 2].type: chars[charRange.start!].blockTags[0].type
    if (tco.select.caretPosition === CaretPos.End && tco.select.start! > 0) {
      blockTag = (chars[tco.select.start! - 1].blockTags.length > 1)? chars[tco.select.start! - 1].blockTags[chars[tco.select.start! - 1].blockTags.length - 2].type: chars[tco.select.start! - 1].blockTags[0].type
      return blockTag
    }
    for (let i = tco.select.start! + 1; i < tco.select.end!; i++) {
      if (breakpoints.indexOf(i) > -1 || i === charRange.end) {
        let breakpointTag = (chars[i].blockTags.length > 1)? chars[i].blockTags[chars[i].blockTags.length - 2].type: chars[i].blockTags[0].type
        if (blockTag !== breakpointTag) {
          return 'multi'
        }
      } 
    }
    return blockTag
  }
  
  public static getSelectedStyleTags(tco: TextCatObject): string[] {
    let chars = tco.chars
    if (tco.select.start === tco.select.end) {
      return []
    } else {
      let tagArray = []
      for (let i = tco.select.start!; i < tco.select.end!; i++) {
        let char = chars[i]
        for (let j = 0; j < char.styleTags.length; j++) {
          if (i === tco.select.start) {
            if (char.styleTags[j].type === 'span') {
              let types = TextCat._processSpan(char.styleTags[j])
              for (let k = 0; k < types.length; k++) {
                tagArray.push({ tag: types[k], count: 1 })
              }
            } else if (char.styleTags[j].type === 'a') {
              let href = char.styleTags[j].attributes.filter((attr) => attr.name === 'href')
              let target = char.styleTags[j].attributes.filter((attr) => attr.name === 'target')
              let anchorName = 'a-' + href[0].value + ';' + target[0].value
              tagArray.push({ tag: anchorName, count: 1 })
            } else {
              tagArray.push({ tag: char.styleTags[j].type, count: 1 })
            }
          } else {
            if (char.styleTags[j].type === 'span') {
              let types = TextCat._processSpan(char.styleTags[j])
              for (let k = 0; k < types.length; k++) {
                let pos = tagArray.map(e => e.tag).indexOf(types[k])
                if (pos > -1) {
                  tagArray[pos].count++
                } else {
                  tagArray.push({ tag: types[k], count: 1 })
                }
              }
            } else if (char.styleTags[j].type === 'a') {
              let href = char.styleTags[j].attributes.filter((attr) => attr.name === 'href')
              let target = char.styleTags[j].attributes.filter((attr) => attr.name === 'target')
              let anchorName = 'a-' + href[0].value + ';' + target[0].value
              let pos = tagArray.map(e => e.tag).indexOf(anchorName)
              if (pos > -1) {
                tagArray[pos].count++
              } else {
                tagArray.push({ tag: anchorName, count: 1 })
              }
            } else {
              let pos = tagArray.map(e => e.tag).indexOf(char.styleTags[j].type)
              if (pos > -1) {
                tagArray[pos].count++
              } else {
                tagArray.push({ tag: char.styleTags[j].type, count: 1 })
              }
            }
          }
        }
      }
      let returnArray = []
      for (let l = 0; l < tagArray.length; l++) {
        if (tagArray[l].count === tco.select.end! - tco.select.start!) {
          returnArray.push(tagArray[l].tag)
        }
      }
      return returnArray
    }
  }

  public static setSelection(tco: TextCatObject) {
    let so:SelectionObject = {
      count: 0,
      anchorNode: null,
      anchorOffset: 0,
      focusNode: null,
      focusOffset: 0
    }
    let children = tco.target.childNodes
    for (let i = 0; i < children.length; i++) {
      let child = children[i]
      if (child.nodeType === Node.ELEMENT_NODE) {
        so = TextCat._findSelectionProps(child, so, tco)
      }
    }
    //set selection
    let docRange: Range = document.createRange();
    docRange.setStart(so.anchorNode!, so.anchorOffset);
    docRange.setEnd(so.focusNode!, so.focusOffset);
    let selection = window.getSelection()!
    selection.addRange(docRange)
  }

  //Private Methods//

  private static _getEditContainer(element: Element | null = null, selection: Selection | null): Element | null {
    if (selection === null && element === null) {
      return null
    } else if (element !== null) {
      if (TextCat._containerTags.includes(element.localName)) {
        return element
      } else {
        return null
      }
    } else if (selection !== null && selection.anchorNode !== null) {
      let container: Element = selection.anchorNode.parentNode as Element
      while (!TextCat._containerTags.includes(container.localName)) {
        container = container.parentNode as Element
      }
      return container
    } else {
      return null
    }
  }

  private static _parseSelection(target: Element, selection:Selection, breakpoints:Breakpoints): Select {
    let count:number = 0
    let start: number | null = null
    let end: number | null = null
    let caretPosition: CaretPos | null = null
    let children = target.childNodes
    for (let i = 0; i < children.length; i++) {
      let child = children[i]
      if (child.nodeType === Node.ELEMENT_NODE) {
        let countObj = TextCat._selectCount(child, count, start, end, selection)
        count = countObj.count
        start = countObj.startCount
        end = countObj.endCount
      }
    }
    if (start === end) {
      if (breakpoints.indexOf(start!) > -1) {
        if (selection.anchorOffset === 0) {
          caretPosition = CaretPos.Start
        } else {
          caretPosition = CaretPos.End
        }
      } else if (start === count) {
        caretPosition = CaretPos.End
      } else {
        caretPosition = CaretPos.Middle
      }
    }
    return { start: start, end: end, caretPosition: null}
  }

  private static _selectCount(node:Node, count:number, startCount:number | null, endCount:number | null, selection:Selection): CountObj {
    let myCount = count
    let myStartCount = startCount
    let myEndCount = endCount
    for (let k = 0; k < node.childNodes.length; k++) {
      let child = node.childNodes[k]
      if (child.nodeType === Node.TEXT_NODE) {
        if (child === selection.anchorNode) {
          myStartCount = myCount + selection.anchorOffset
        }
        if (child === selection.focusNode) {
          myEndCount = myCount + selection.focusOffset
        }
        let val = child.nodeValue
        myCount += val!.length
        
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        let countObj = TextCat._selectCount(child, myCount, myStartCount, myEndCount, selection)
        myCount = countObj.count
        myStartCount = countObj.startCount
        myEndCount = countObj.endCount
      }
    }
    return { count: myCount, startCount: myStartCount, endCount: myEndCount }
  }

  private static _findSelectionProps (node:Node, so:SelectionObject, tco: TextCatObject): SelectionObject {
    for (let k = 0; k < node.childNodes.length; k++) {
      let child = node.childNodes[k]
      if (child.nodeType === Node.TEXT_NODE) {
        so.count += child.nodeValue!.length
        if (so.count >= tco.select.start!) {
          so.anchorNode = child
          so.anchorOffset = Math.max(so.count - tco.select.start!, 0)
        }
        if (so.count >= tco.select.end!) {
          so.focusNode = child
          so.focusOffset = Math.max(so.count - tco.select.end!, 0)
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        so = TextCat._findSelectionProps(child, so, tco)
      }
    }
    return so
  }

  private static _markupParse (target: Node): ParseOutput {
    let characterArray: Character[] = []
    let breakpointArray: number[] = []
    let children = target.childNodes
    for (let i = 0; i < children.length; i++) {
      let child = children[i] as Element
      if (child.nodeType === 1) {
        let tag = {
          tag: child.localName,
          attributes: TextCat._createAttributeArray(child.attributes)
        }
        let childObj = TextCat._childParse(child, [tag], [])
        characterArray = characterArray.concat(childObj.chars)
        breakpointArray = breakpointArray.concat(childObj.breakpoints)
      }
    }
    breakpointArray = breakpointArray.filter(num => num !== 0)
    let returnArray = [0]
    let count = 0
    for (let j = 0; j < breakpointArray.length; j++) {
      count += breakpointArray[j]
      let bp = count
      returnArray.push(bp)
    }
    return { chars: characterArray, breakpoints: returnArray.slice(0, -1) }
  }

  private static _childParse (target: Element, blockTags: Tag[], styleTags: Tag[]): ParseOutput {
    let charArray: Character[] = []
    let count = 0
    let nested: number[] = []
    for (let k = 0; k < target.childNodes.length; k++) {
      let child = target.childNodes[k] as Element
      if (child.nodeType === Node.TEXT_NODE) {
        let val: string = child.nodeValue!
        count += val.length
        if (val.length > 0) {
          let chars = Array.from(val)
          let newTags = styleTags.slice() //clone
          for (let h = 0; h < chars.length; h++) {
            charArray.push({ char: chars[h], blockTags: blockTags, styleTags: newTags })
          }
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        let tag: Tag = {
          type: child.localName,
          attributes: TextCat._createAttributeArray(child.attributes)
        }
        if (TextCat.blockTags.indexOf(child.localName) === -1) {
          let newTags = styleTags.slice()
          newTags.push(tag)
          let childObj = TextCat._childParse(child, blockTags, newTags)
          count += childObj.breakpoints[0]
          nested = nested.concat(childObj.breakpoints.slice(1))
          charArray = charArray.concat(childObj.chars)
        } else {
          let newTags = blockTags.slice()
          newTags.push(tag)
          let childObj = TextCat._childParse(child, newTags, styleTags)
          nested = nested.concat(childObj.breakpoints)
          charArray = charArray.concat(childObj.chars)
        }
      }
    }
    let countArray = []
    countArray.push(count)
    countArray = countArray.concat(nested)
    return { chars: JSON.parse(JSON.stringify(charArray)), breakpoints: countArray }
  }

  private static _createAttributeArray (attributes: NamedNodeMap) {
    let attributeArray = []
    for (const attr of attributes) {
      let value = attr.value
      if (attr.name.indexOf('data-v') === -1) {
        if (attr.name === 'style') {
          let hex = this._rgbToHex(attr.value)
          value = 'color: ' + hex
        }
        attributeArray.push({ name: attr.name, value: value })
      }
    }
    return attributeArray
  }

  private static _rgbToHex (color: string): string {
    if (color.indexOf('rgb(') === -1) {
      return color.slice(color.indexOf(': ') + 2)
    }
    let colors = color.slice(color.indexOf('(') + 1, color.indexOf(')'))
    let colorArray = colors.split(', ')
    let r = Number(colorArray[0]).toString(16);
    let g = Number(colorArray[1]).toString(16);
    let b = Number(colorArray[2]).toString(16);
    if (r.length == 1) {
      r = '0' + r
    }
    if (g.length == 1) {
      g = '0' + g
    }
    if (b.length == 1) {
      b = '0' + b
    }
    return '#' + r + g + b
  }

  private static _closeTags (tags: Tag[]) {
    let markupString = ''
    for (let i = tags.length - 1; i > -1; i--) { //Close tags
      markupString += '</' + tags[i].type + '>'
    }
    return markupString
  }

  private static _openTags (tags: Tag[]) {
    let markupString = ''
    for (let m = 0; m < tags.length; m++) {
      markupString += this._createOpeningtag(tags[m])
    }
    return markupString
  }

  private static _createOpeningtag (tag: Tag) {
    let tagString = '<'
    tagString += tag.type
    if (tag.attributes.length > 0) {
      let attributes = ''
      for (let i = 0; i < tag.attributes.length; i++) {
        let attrib = tag.attributes[i]
        if (attrib.name.includes('data-v-')) {
          attributes += ' ' + attrib.name
        } else {
          attributes += ' ' + attrib.name + '="' + attrib.value + '"'
        }
      }
      tagString += ' ' + attributes
    }
    tagString += '>'
    tagString = tagString.replace(/\s\s/g, ' ')
    return tagString
  }

  private static _compareStyleTags (oldTags: Tag[], newTags: Tag[]): string {
    let oLength = oldTags.length
    let nLength = newTags.length
    let lLength = Math.max(oLength, nLength)
    let returnObj = {removeTags:[] as Tag[], addTags:[] as Tag[]}
    let markupString = ''
    for (let i = 0; i < lLength; i++) {
      if (i < oLength && i < nLength) {
        if (oldTags[i].type != newTags[i].type) {
          let removeTags: Tag[] = oldTags.slice(i)
          let addTags: Tag[] =newTags.slice(i)
          returnObj = { removeTags:removeTags, addTags:addTags }
          break
        }
      } else {
        let removeTags = oldTags.slice(i)
        let addTags =newTags.slice(i)
        returnObj = { removeTags:removeTags, addTags:addTags }
        break
      }
    }
    for (let m = returnObj.removeTags.length - 1; m > -1; m--) { //Close tags
      markupString += '</' + returnObj.removeTags[m].type + '>'
    }
    for (let n = 0; n < returnObj.addTags.length; n++) {
      markupString += TextCat._createOpeningtag(returnObj.addTags[n])
    }
    return markupString
  }

  private static _compareBlockTags (oldTags: Tag[], newTags: Tag[]): string {
    let oLength = oldTags.length
    let nLength = newTags.length
    let lLength = Math.max(oLength, nLength)
    let returnObj = {removeTags:[] as Tag[], addTags:[] as Tag[]}
    let markupString = ''
    if (nLength > oLength && nLength > 2) { //nest in
      returnObj = { removeTags: [], addTags: newTags.slice(oLength) }
    } else {
      for (let i = 0; i < lLength; i++) {
        if (i < oLength && i < nLength) {
          if (oldTags[i].type != newTags[i].type) {
            let pos = Math.max(0, i - 1)
            let removeTags = oldTags.slice(pos)
            let addTags =newTags.slice(pos)
            returnObj = {removeTags:removeTags, addTags:addTags}
            break
          }
        } else {
          let pos = Math.max(0, i - 1)
          let removeTags = oldTags.slice(i)
          let addTags =newTags.slice(i)
          returnObj = {removeTags:removeTags, addTags:addTags}
          break
        }
      }
      if (returnObj.removeTags.length === 0) {
        returnObj.removeTags.push(oldTags[oldTags.length - 1])
      }
      if (returnObj.addTags.length === 0) {
        returnObj.addTags.push(newTags[newTags.length - 1])
      }
    }
    for (let m = returnObj.removeTags.length - 1; m > -1; m--) { //Close tags
      markupString += '</' + returnObj.removeTags[m].type + '>'
    }
    for (let n = 0; n < returnObj.addTags.length; n++) {
      markupString += TextCat._createOpeningtag(returnObj.addTags[n])
    }
    return markupString
  }

  private static _parseBlockLevel (tco:TextCatObject): BlockTagPos {
    let breakpoints = tco.breakpoints
    let charsStart = null
    let charsEnd = null

    for (let i = 0; i <= breakpoints.length; i++) {
      if (i === breakpoints.length) {
        if (charsStart === null) {
          if(tco.select.start! < tco.chars.length - 1 && tco.select.caretPosition === CaretPos.End) {
            charsStart = breakpoints[breakpoints.length - 2]
          } else {
            charsStart = breakpoints[breakpoints.length - 1]
          }
        }
        if (charsEnd === null) {
          if(tco.select.end! < tco.chars.length - 1 && tco.select.caretPosition === CaretPos.End) {
            charsEnd = breakpoints[breakpoints.length - 1] - 1
          } else {
            charsEnd = tco.chars.length - 1
          }
        }
      } else {
        if (tco.select.start! < breakpoints[i] && charsStart === null) {
          if (tco.select.caretPosition === CaretPos.End) {
            charsStart = breakpoints[i - 2]
          } else {
            charsStart = breakpoints[i - 1]
          }
        }
        if (tco.select.end! - 1 < breakpoints[i] && charsStart !== null && charsEnd === null) {
          if (tco.select.caretPosition === CaretPos.End) {
            charsEnd = breakpoints[i - 1] - 1
          } else {
            charsEnd = breakpoints[i] - 1
          }
        }
      }
      
    }
    return { start: charsStart, end: charsEnd }
  }

  private static  _replaceTopBlockTag (newTag: Tag, tags: Tag[]): Tag[] {
    let blocks = TextCat._blockTags.splice(TextCat._blockTags.indexOf('li'), 1)
    let cloneTag = JSON.parse(JSON.stringify(newTag))
    for (let i = tags.length -1; i >= 0; i--) {
      let tag = tags[i]
      if (blocks.indexOf(tag.type) != -1) {
        if (newTag.type === 'ul' || newTag.type === 'ol') {
          if (tag.type === 'ul' || tag.type === 'ol') {
            tags[i] = cloneTag
            return tags
          } else {
            let li = TextCat.createTag('li')
            tags = [cloneTag, li]
            return tags
          }
        } else {
          if (tag.type === 'ul' || tag.type === 'ol') {
            tags = [cloneTag]
            return tags
          } else {
            tags = [cloneTag]
            return tags
          }
        }
      }
    }
    return tags
  }

  private static _insertStyleTag (newTag: Tag, styleTags: Tag[]): Tag[] {
    if (newTag.type === 'span') {
      if (styleTags.length > 0 && styleTags[0].type === 'span') {
        let index = styleTags[0].attributes.findIndex(item => item.name === newTag.attributes[0].name)
        if (index > -1) {
          styleTags[0].attributes[index] = newTag.attributes[0]
        } else {
          styleTags[0].attributes.push(newTag.attributes[0])
        }
      } else {
        styleTags.splice(0, 0, newTag)
      }
    } else {
      let subIndex = styleTags.findIndex(item => item.type === 'sub')
      let supIndex = styleTags.findIndex(item => item.type === 'sup')
      let aIndex = styleTags.findIndex(item => item.type === 'a')
      let newTagIndex = styleTags.findIndex(item => item.type === newTag.type)
      if (newTagIndex === -1) {
        if (newTag.type === 'sup' && subIndex > -1) {
          styleTags[subIndex].type = 'sup'
        } else if (newTag.type === 'sub' && supIndex > -1) {
          styleTags[supIndex].type = 'sub'
        } else {
          styleTags.splice(styleTags.length - 1, 0, newTag)
        }
      } else if (newTag.type === 'a' && aIndex > -1) {
        styleTags[aIndex].attributes = newTag.attributes
      }
    }
    return styleTags
  }

  private static _cutStyleTag (newTag: Tag, styleTags: Tag[]): Tag[] {
    let index = styleTags.findIndex(item => item.type === newTag.type)
    if (newTag.type === 'span') {
      if (styleTags[0].type === 'span') {
        if (index > -1) {
          for (let i = 0; i < newTag.attributes.length; i++) {
            let attr = newTag.attributes[i]
            let removeIndex = styleTags[0].attributes.findIndex(item => item.name === attr.name)
            if (removeIndex > -1) {
              styleTags[0].attributes.splice(removeIndex, 1)
            }
          }
          if (styleTags[0].attributes.length === 0) {
            styleTags.splice(0, 1)
          }
        } 
      } else {
        styleTags.splice(index, 1)
      }
    } else {
      styleTags.splice(index, 1)
    }
    return styleTags
  }

  private static _processSpan (tag: Tag): string[] {
    let type: string[] = []
    for (let i = 0; i < tag.attributes.length; i++) {
      let attr = tag.attributes[i].name
      if (attr === 'style') {
        if (tag.attributes[i].value.indexOf('color') > -1) {
          const regex = /color:\s*(?<color>[^;]*)(;*)/
          let valArray = tag.attributes[i].value.match(regex)
          type.push('color-' + valArray!.groups!.color)
        }
      } else if (attr === 'class') {
        if (tag.attributes[i].value.indexOf('font-') > -1)
        type.push(tag.attributes[i].value)
      } else if (attr === 'inline') {
        type.push('inline')
      }
    }
    return type
  }
}