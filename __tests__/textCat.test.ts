
import TextCat from "../src/textCat.ts"
import { Attribute, BlockTagPos, Breakpoints, CaretPos, Character, CountObj, ParseOutput, TextAlign, Select, SelectionObject, Tag, TextCatObject } from '../src/types.ts'
import { JSDOM } from "jsdom"
import { describe, test, expect, jest } from "@jest/globals"
import createSelection from "../src/utils/createSelection.ts"

/*describe('create method', () => {
  let originalWindow = window

  beforeAll((done) => {
    JSDOM.fromFile('__tests__/htmlSamples/sample1.html', { contentType: 'text/html' }).then((dom) => {
      Object.defineProperty(global, 'window', {
        value: dom.window,
        writable: false
      })  
    }).then(done, done);
  })

  afterAll(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow.window,
      writable: false
    })
  })

  test('captures correct character length', () =>{
    let sample: HTMLElement = window.document.getElementById('sample1')!

    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[1].childNodes[0] as Node, 2, sample.childNodes[7].childNodes[0] as Node, 8, originalWindow)
    })
    let tco:TextCatObject = TextCat.create(sample)!
    expect(tco.chars.length).toBe(40)
    getSelectionMock.mockRestore()
  })

  test('captures correct breakpoints', () =>{
    let sample: HTMLElement = window.document.getElementById('sample1')!

    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[1].childNodes[0] as Node, 2, sample.childNodes[7].childNodes[0] as Node, 8, originalWindow)
    })
    let tco:TextCatObject = TextCat.create(sample)!
    expect(tco.breakpoints.length).toBe(4)
    expect(tco.breakpoints[0]).toBe(0)
    expect(tco.breakpoints[1]).toBe(10)
    expect(tco.breakpoints[2]).toBe(20)
    expect(tco.breakpoints[3]).toBe(30)
    getSelectionMock.mockRestore()
  })
  
  test('captures correct multi line selection', () =>{
    let sample: HTMLElement = window.document.getElementById('sample1')!

    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[1].childNodes[0] as Node, 2, sample.childNodes[7].childNodes[0] as Node, 8, originalWindow)
    })
    let tco:TextCatObject = TextCat.create(sample)!
    expect(tco.select.start).toBe(2)
    expect(tco.select.end).toBe(38)
    expect(tco.select.caretPosition).toBe(null)
    getSelectionMock.mockRestore()
  })

  test('captures correct single line selection', () =>{
    let sample: HTMLElement = window.document.getElementById('sample1')!

    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[0] as Node, 2, sample.childNodes[5].childNodes[0] as Node, 8, originalWindow)
    })
    let tco:TextCatObject = TextCat.create(sample)!
    expect(tco.select.start).toBe(22)
    expect(tco.select.end).toBe(28)
    expect(tco.select.caretPosition).toBe(null)
    getSelectionMock.mockRestore()
  })

  test('captures correct carrot position at beginning of container', () =>{
    let sample: HTMLElement = window.document.getElementById('sample1')!

    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[1].childNodes[0] as Node, 0, sample.childNodes[1].childNodes[0] as Node, 0, originalWindow)
    })
    let tco:TextCatObject = TextCat.create(sample)!
    expect(tco.select.start).toBe(0)
    expect(tco.select.end).toBe(0)
    expect(tco.select.caretPosition).toBe(CaretPos.Start)
    getSelectionMock.mockRestore()
  })

  test('captures correct carrot position at beginning of line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample1')!

    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[0] as Node, 0, originalWindow)
    })
    let tco:TextCatObject = TextCat.create(sample)!
    expect(tco.select.start).toBe(20)
    expect(tco.select.end).toBe(20)
    expect(tco.select.caretPosition).toBe(CaretPos.Start)
    getSelectionMock.mockRestore()
  })

  test('captures correct carrot position at end of line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample1')!

    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[0] as Node, 10, sample.childNodes[5].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create(sample)!
    expect(tco.select.start).toBe(30)
    expect(tco.select.end).toBe(30)
    expect(tco.select.caretPosition).toBe(CaretPos.End)
    getSelectionMock.mockRestore()
  })

  test('captures correct carrot position at end of container', () =>{
    let sample: HTMLElement = window.document.getElementById('sample1')!

    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[0] as Node, 10, sample.childNodes[7].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create(sample)!
    expect(tco.select.start).toBe(40)
    expect(tco.select.end).toBe(40)
    expect(tco.select.caretPosition).toBe(CaretPos.End)
    getSelectionMock.mockRestore()
  })

  test('captures explicit target', () =>{
    let sample: HTMLElement = window.document.getElementById('sample1')!

    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[0] as Node, 10, sample.childNodes[7].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create(sample)!
    expect(tco.target).toBe(sample)
    getSelectionMock.mockRestore()
  })

  test('captures implicit target', () =>{
    let sample: HTMLElement = window.document.getElementById('sample1')!

    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[0] as Node, 10, sample.childNodes[7].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    expect(tco.target).toBe(sample)
    getSelectionMock.mockRestore()
  })

  test('handles mismatch between explicit target and selection target', () =>{
    let sample1: HTMLElement = window.document.getElementById('sample1')!
    let sample2: HTMLElement = window.document.getElementById('sample2')!

    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample1.childNodes[7].childNodes[0] as Node, 10, sample1.childNodes[7].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create(sample2)!
    expect(tco.target).toBe(sample2)
    getSelectionMock.mockRestore()
  })
})*/

describe('html method', () => {
  let originalWindow = window

  beforeAll((done) => {
    JSDOM.fromFile('__tests__/htmlSamples/sample1.html', { contentType: 'text/html' }).then((dom) => {
      Object.defineProperty(global, 'window', {
        value: dom.window,
        writable: false
      })  
    }).then(done, done);
  })

  afterAll(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow.window,
      writable: false
    })
  })

  test('handles mismatch between explicit target and selection target', () =>{
    let sample3: HTMLElement = window.document.getElementById('sample3')!

    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample3.childNodes[7].childNodes[0] as Node, 10, sample3.childNodes[7].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create(sample3)!
    console.log(TextCat.html(tco))
    expect(tco.target).toBe(sample3)
    getSelectionMock.mockRestore()
  })
})