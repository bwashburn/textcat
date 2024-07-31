
import TextCat from "../textCat.ts"
// import { Attribute, Breakpoints, CaretPos, Character, TextAlign, Selection, Tag, TextCatObject } from "./types.ts"
import { JSDOM } from "jsdom"
import { describe, test, expect, jest } from "@jest/globals"
import createSelection from "../utils/createSelection.ts"

describe('create function', () => {
  let originalWindow = window
  beforeEach((done) => {
    JSDOM.fromFile('__tests__/htmlSamples/sample1.html', { contentType: 'text/html' }).then((dom) => {
      Object.defineProperty(global, 'window', {
        value: dom.window,
        writable: false
      })  
    }).then(done, done);
   })
  afterEach(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow.window,
      writable: false
    })
  })
  
  test('Returns correct value', () =>{
    let sample: HTMLElement = window.document.getElementById('sample1')!

    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[1].childNodes[0] as Node, 2, sample.childNodes[7].childNodes[0] as Node, 8, originalWindow)
    })

    expect(TextCat.create(sample)!.end).toBe(38)
    getSelectionMock.mockRestore()
  })
})