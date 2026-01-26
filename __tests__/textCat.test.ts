
import {TextCat} from "../src/textCat.ts"
import { Attribute, BlockTagPos, Breakpoints, CaretPos, Character, CountObj, ParseOutput, TextAlign, Select, SelectionObject, Tag, TextCatObject } from '../src/types.ts'
import { JSDOM } from "jsdom"
import { describe, test, expect, jest } from "@jest/globals"
import createSelection from "../src/utils/createSelection.ts"

describe('create method', () => {
  let originalWindow = window

  beforeEach((done) => {
    JSDOM.fromFile('__tests__/htmlSamples/sample1.html', { contentType: 'text/html' }).then((dom) => {
      Object.defineProperty(global, 'window', {
        value: dom.window,
        writable: true
      })
      Object.defineProperty(global, 'document', {
        value: dom.window.document,
        writable: true
      }) 
    }).then(done, done);
  })

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow.window,
      writable: true
    })
    Object.defineProperty(global, 'document', {
      value: originalWindow.window.document,
      writable: true
    })
  })

  test('captures correct character length', () =>{
    let sample: HTMLElement = window.document.getElementById('sample2')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[1].childNodes[0] as Node, 2, sample.childNodes[7].childNodes[0] as Node, 8, originalWindow)
    })
    let tco:TextCatObject = TextCat.create(sample)!
    expect(tco.chars.length).toBe(40)
    getSelectionMock.mockRestore()
  })

  test('captures correct breakpoints', () =>{
    let sample: HTMLElement = window.document.getElementById('sample2')!
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
    let sample: HTMLElement = window.document.getElementById('sample2')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[1].childNodes[0] as Node, 2, sample.childNodes[7].childNodes[0] as Node, 8, originalWindow)
    })
    let selection = window.getSelection()
    let tco:TextCatObject = TextCat.create(sample)!
    expect(tco.select.start).toBe(2)
    expect(tco.select.end).toBe(38)
    expect(tco.select.caretPosition).toBe(null)
    getSelectionMock.mockRestore()
  })

  test('captures correct single line selection', () =>{
    let sample: HTMLElement = window.document.getElementById('sample2')!
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
    let sample: HTMLElement = window.document.getElementById('sample2')!
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
    let sample: HTMLElement = window.document.getElementById('sample2')!
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
    let sample: HTMLElement = window.document.getElementById('sample2')!
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
    let sample: HTMLElement = window.document.getElementById('sample2')!
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
    let sample: HTMLElement = window.document.getElementById('sample2')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[0] as Node, 10, sample.childNodes[7].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create(sample)!
    expect(tco.target).toBe(sample)
    getSelectionMock.mockRestore()
  })

  test('captures implicit target', () =>{
    let sample: HTMLElement = window.document.getElementById('sample2')!
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
      return createSelection(sample1.childNodes[0].childNodes[2] as Node, 4, sample1.childNodes[0].childNodes[2] as Node, 4, originalWindow)
    })
    let tco:TextCatObject = TextCat.create(sample2)!
    expect(tco.target).toBe(sample2)
    getSelectionMock.mockRestore()
  })

  test('captures correct selection when selecting zero characters of the next line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[3].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1] as Node, 0, originalWindow) 
    })
    let tco:TextCatObject = TextCat.create(sample)!
    expect(tco.select.start).toBe(23)
    expect(tco.select.end).toBe(26)
    expect(tco.select.caretPosition).toBe(null)
    getSelectionMock.mockRestore()
  })

  test('captures selection when selecting zero characters of the next line when selecting in reverse', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[0] as Node, 0, originalWindow) 
    })
    let tco:TextCatObject = TextCat.create(sample)!
    expect(tco.select.start).toBe(23)
    expect(tco.select.end).toBe(26)
    expect(tco.select.caretPosition).toBe(null)
    getSelectionMock.mockRestore()
  })
})

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

  test('returns correct html of easy example', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 3, sample.childNodes[3].childNodes[0] as Node, 6, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p>1234567890</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('returns correct html of medium example', () =>{
    let sample: HTMLElement = window.document.getElementById('sample2')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 3, sample.childNodes[3].childNodes[0] as Node, 6, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    expect(TextCat.html(tco)).toBe('<p>ABC<strong>DEF</strong>GHIJ</p><p>1234567890</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('returns correct html of complex example', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[2] as Node, 0, sample.childNodes[3].childNodes[2] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('returns correct html of condensed example', () =>{
    let sample: HTMLElement = window.document.getElementById('sample1')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[1].childNodes[0] as Node, 6, sample.childNodes[1].childNodes[0] as Node, 9, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    expect(TextCat.html(tco)).toBe('<p>ABC<strong>DEF</strong>GHIJ</p><p>1234567890</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('returns correct html when last line is one character', () =>{
    let sample: HTMLElement = window.document.getElementById('sample5')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[15].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><p>ABCDEFGHIJ</p><ul><li>abc</li><li>def</li><li>ghi</li><li>j</li><li>123</li><li>456</li><li>789</li><li>0</li></ul>')
    getSelectionMock.mockRestore()
  })
})

describe('insertText method', () => {
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

  test('remove nothing from end of last line add multiple lines', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[0] as Node, 10, sample.childNodes[7].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.insertText('abc\ndef', tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p>1234567890</p><p>ABCDEFGHIJ</p><p>1234567890abc</p><p>def</p>')
    expect(tco.breakpoints.length).toBe(5)
    expect(tco.breakpoints[0]).toBe(0)
    expect(tco.breakpoints[1]).toBe(10)
    expect(tco.breakpoints[2]).toBe(20)
    expect(tco.breakpoints[3]).toBe(30)
    expect(tco.breakpoints[4]).toBe(43)
    expect(tco.select.start).toBe(46)
    expect(tco.select.end).toBe(46)
    expect(tco.select.caretPosition).toBe(CaretPos.End)
    getSelectionMock.mockRestore()
  })

  test('remove nothing from end of line add multiple lines', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[1].childNodes[0] as Node, 10, sample.childNodes[1].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.insertText('abc\ndef', tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJabc</p><p>def</p><p>1234567890</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    expect(tco.breakpoints.length).toBe(5)
    expect(tco.breakpoints[0]).toBe(0)
    expect(tco.breakpoints[1]).toBe(13)
    expect(tco.breakpoints[2]).toBe(16)
    expect(tco.breakpoints[3]).toBe(26)
    expect(tco.breakpoints[4]).toBe(36)
    expect(tco.select.start).toBe(16)
    expect(tco.select.end).toBe(16)
    expect(tco.select.caretPosition).toBe(CaretPos.End)
    getSelectionMock.mockRestore()
  })

  test('remove nothing add multiple last lines', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[0] as Node, 7, sample.childNodes[7].childNodes[0] as Node, 7, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.insertText('abc\ndef', tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p>1234567890</p><p>ABCDEFGHIJ</p><p>1234567abc</p><p>def890</p>')
    expect(tco.breakpoints.length).toBe(5)
    expect(tco.breakpoints[0]).toBe(0)
    expect(tco.breakpoints[1]).toBe(10)
    expect(tco.breakpoints[2]).toBe(20)
    expect(tco.breakpoints[3]).toBe(30)
    expect(tco.breakpoints[4]).toBe(40)
    expect(tco.select.start).toBe(43)
    expect(tco.select.end).toBe(43)
    expect(tco.select.caretPosition).toBe(CaretPos.Middle)
    getSelectionMock.mockRestore()
  })

  test('remove nothing add multiple lines', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[1].childNodes[0] as Node, 7, sample.childNodes[1].childNodes[0] as Node, 7, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.insertText('abc\ndef', tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGabc</p><p>defHIJ</p><p>1234567890</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    expect(tco.breakpoints.length).toBe(5)
    expect(tco.breakpoints[0]).toBe(0)
    expect(tco.breakpoints[1]).toBe(10)
    expect(tco.breakpoints[2]).toBe(16)
    expect(tco.breakpoints[3]).toBe(26)
    expect(tco.breakpoints[4]).toBe(36)
    expect(tco.select.start).toBe(13)
    expect(tco.select.end).toBe(13)
    expect(tco.select.caretPosition).toBe(CaretPos.Middle)
    getSelectionMock.mockRestore()
  })

  test('remove last line add multiple lines', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.insertText('abc\ndef', tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p>1234567890</p><p>ABCDEFGHIJ</p><p>abc</p><p>def</p>')
    expect(tco.breakpoints.length).toBe(5)
    expect(tco.breakpoints[0]).toBe(0)
    expect(tco.breakpoints[1]).toBe(10)
    expect(tco.breakpoints[2]).toBe(20)
    expect(tco.breakpoints[3]).toBe(30)
    expect(tco.breakpoints[4]).toBe(33)
    expect(tco.select.start).toBe(36)
    expect(tco.select.end).toBe(36)
    expect(tco.select.caretPosition).toBe(CaretPos.End)
    getSelectionMock.mockRestore()
  })

  test('remove single line add multiple lines', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 0, sample.childNodes[3].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.insertText('abc\ndef', tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p>abc</p><p>def</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    expect(tco.breakpoints.length).toBe(5)
    expect(tco.breakpoints[0]).toBe(0)
    expect(tco.breakpoints[1]).toBe(10)
    expect(tco.breakpoints[2]).toBe(13)
    expect(tco.breakpoints[3]).toBe(16)
    expect(tco.breakpoints[4]).toBe(26)
    expect(tco.select.start).toBe(16)
    expect(tco.select.end).toBe(16)
    expect(tco.select.caretPosition).toBe(CaretPos.End)
    getSelectionMock.mockRestore()
  })

  test('remove multiple lines including the last line add multiple lines', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.insertText('abc\ndef', tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p>1234567890</p><p>abc</p><p>def</p>')
    expect(tco.breakpoints.length).toBe(4)
    expect(tco.breakpoints[0]).toBe(0)
    expect(tco.breakpoints[1]).toBe(10)
    expect(tco.breakpoints[2]).toBe(20)
    expect(tco.breakpoints[3]).toBe(23)
    expect(tco.select.start).toBe(26)
    expect(tco.select.end).toBe(26)
    expect(tco.select.caretPosition).toBe(CaretPos.End)
    getSelectionMock.mockRestore()
  })

  test('remove multiple lines add multiple lines', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.insertText('abc\ndef', tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p>abc</p><p>def</p><p>1234567890</p>')
    expect(tco.breakpoints.length).toBe(4)
    expect(tco.breakpoints[0]).toBe(0)
    expect(tco.breakpoints[1]).toBe(10)
    expect(tco.breakpoints[2]).toBe(13)
    expect(tco.breakpoints[3]).toBe(16)
    expect(tco.select.start).toBe(16)
    expect(tco.select.end).toBe(16)
    expect(tco.select.caretPosition).toBe(CaretPos.End)
    getSelectionMock.mockRestore()
  })

  test('remove nothing from end of line add single line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 10, sample.childNodes[3].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.insertText('abc', tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p>1234567890abc</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    expect(tco.breakpoints.length).toBe(4)
    expect(tco.breakpoints[0]).toBe(0)
    expect(tco.breakpoints[1]).toBe(10)
    expect(tco.breakpoints[2]).toBe(23)
    expect(tco.breakpoints[3]).toBe(33)
    expect(tco.select.start).toBe(23)
    expect(tco.select.end).toBe(23)
    expect(tco.select.caretPosition).toBe(CaretPos.End)
    getSelectionMock.mockRestore() 
  })

  test('remove nothing add single line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 7, sample.childNodes[3].childNodes[0] as Node, 7, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.insertText('abc', tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p>1234567abc890</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    expect(tco.breakpoints.length).toBe(4)
    expect(tco.breakpoints[0]).toBe(0)
    expect(tco.breakpoints[1]).toBe(10)
    expect(tco.breakpoints[2]).toBe(23)
    expect(tco.breakpoints[3]).toBe(33)
    expect(tco.select.start).toBe(20)
    expect(tco.select.end).toBe(20)
    expect(tco.select.caretPosition).toBe(CaretPos.Middle)
    getSelectionMock.mockRestore() 
  })

  test('remove single line add single line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 0, sample.childNodes[3].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.insertText('abc', tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p>abc</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    expect(tco.breakpoints.length).toBe(4)
    expect(tco.breakpoints[0]).toBe(0)
    expect(tco.breakpoints[1]).toBe(10)
    expect(tco.breakpoints[2]).toBe(13)
    expect(tco.breakpoints[3]).toBe(23)
    expect(tco.select.start).toBe(13)
    expect(tco.select.end).toBe(13)
    expect(tco.select.caretPosition).toBe(CaretPos.End)
    getSelectionMock.mockRestore() 
  })

  test('remove multiple lines add single line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.insertText('abc', tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p>abc</p><p>1234567890</p>')
    expect(tco.breakpoints.length).toBe(3)
    expect(tco.breakpoints[0]).toBe(0)
    expect(tco.breakpoints[1]).toBe(10)
    expect(tco.breakpoints[2]).toBe(13)
    expect(tco.select.start).toBe(13)
    expect(tco.select.end).toBe(13)
    expect(tco.select.caretPosition).toBe(CaretPos.End)
    getSelectionMock.mockRestore() 
  })
})

describe('createTag method', () => {
  test('Create block tag with no attributes', () =>{
    let tag = TextCat.createTag('h2')
    expect(tag.type).toBe('h2')
    expect(tag.attributes.length).toBe(0)
  })

  test('Create block tag with two attributes', () =>{
    let attributes = [{ name: 'class', value: 'class1 class2'}, { name: 'id', value: 'h2-id'}]
    let tag = TextCat.createTag('h2', attributes)
    expect(tag.type).toBe('h2')
    expect(tag.attributes.length).toBe(2)
    expect(tag.attributes[0].name).toBe('class')
    expect(tag.attributes[0].value).toBe('class1 class2')
    expect(tag.attributes[1].name).toBe('id')
    expect(tag.attributes[1].value).toBe('h2-id')
  })

  test('Create style tag with no attributes', () =>{
    let tag = TextCat.createTag('strong')
    expect(tag.type).toBe('strong')
    expect(tag.attributes.length).toBe(0)
  })

  test('Create style tag with two attributes', () =>{
    let attributes = [{ name: 'class', value: 'class1 class2'}, { name: 'id', value: 'strong-id'}]
    let tag = TextCat.createTag('strong', attributes)
    expect(tag.type).toBe('strong')
    expect(tag.attributes.length).toBe(2)
    expect(tag.attributes[0].name).toBe('class')
    expect(tag.attributes[0].value).toBe('class1 class2')
    expect(tag.attributes[1].name).toBe('id')
    expect(tag.attributes[1].value).toBe('strong-id')
  })
})

describe('changeBlockTag method', () => {
  let originalWindow = window

  beforeEach((done) => {
    JSDOM.fromFile('__tests__/htmlSamples/sample1.html', { contentType: 'text/html' }).then((dom) => {
      Object.defineProperty(global, 'window', {
        value: dom.window,
        writable: true
      })
      Object.defineProperty(global, 'document', {
        value: dom.window.document,
        writable: true
      }) 
    }).then(done, done);
  })

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow.window,
      writable: true
    })
    Object.defineProperty(global, 'document', {
      value: originalWindow.window.document,
      writable: true
    })
  })

  test('cursor in middle of line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 5, sample.childNodes[3].childNodes[0] as Node, 5, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('h2')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><h2>1234567890</h2><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('cursor at start of line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 0, sample.childNodes[3].childNodes[0] as Node, 0, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('h2')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><h2>1234567890</h2><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('cursor at end of line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 10, sample.childNodes[3].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('h2')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><h2>1234567890</h2><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('select internal chars on middle line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 2, sample.childNodes[3].childNodes[0] as Node, 8, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('h2')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><h2>1234567890</h2><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('select first 3 characters of first line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[1].childNodes[0] as Node, 0, sample.childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('h2')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>1234567890</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('select last 3 characters of last line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[0] as Node, 7, sample.childNodes[7].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('h2')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p>1234567890</p><p>ABCDEFGHIJ</p><h2>1234567890</h2>')
    getSelectionMock.mockRestore()
  })

  test('selection made of parts of two lines', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 3, sample.childNodes[5].childNodes[0] as Node, 8, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('h2')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><h2>1234567890</h2><h2>ABCDEFGHIJ</h2><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made of two lines', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('h2')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><h2>1234567890</h2><h2>ABCDEFGHIJ</h2><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made of two lines of li', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('h2')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><h2>abc</h2><h2>def</h2><ul><li>ghi<ul><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made of one line of li', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('h2')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><h2>abc</h2><ul><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made of one line of li and one nested line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[3].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('h2')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li></ul><h2>def</h2><h2>ghi</h2><ul><li>j</li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made of list containing nested list. Converting from ul to ol', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[3].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('ol')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ol><li>abc</li><li>def</li><li>ghi</li><li>j</li></ol><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made of ul containing nested ul. Converting from ul to p', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[3].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('p')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><p>abc</p><p>def</p><p>ghi</p><p>j</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made starting with p then ul. Convert to p', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[3].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('p')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><p>abc</p><p>def</p><p>ghi</p><p>j</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made starting with p then ul. Convert to ul', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[3].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('ul')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><ul><li>123<strong>456</strong>7890</li><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made from nested ul. Convert from ul to ol', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[3].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('ol')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ol><li>ghi</li><li>j</li></ol></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made from ul containing nested ul. Convert from ul to ol', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[3].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('ol')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ol><li>abc</li><li>def</li><li>ghi</li><li>j</li></ol><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made from second ul item and containing nested ul. Convert from ul to ol', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[3].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[3].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('ol')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li></ul><ol><li>def</li><li>ghi</li><li>j</li></ol><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made from ul containing nested ul and first p after. Convert to ul', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('ul')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul><li>ABCDEFGHIJ</li></ul><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made from ul containing nested ul and first p after. Convert to p', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('p')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><p>abc</p><p>def</p><p>ghi</p><p>j</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made from fist ul item of nest ul. Convert to ol', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('ol')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ol><li>ghi</li></ol><li>j</li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made from fist ul item of nest ul. Convert to p', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('p')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def</li></ul><p>ghi</p><ul><li>j</li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made from last ul item before nest ul. Convert to ol', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('ol')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ol><li>ghi</li></ol><li>j</li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made from last ul item before nest ul. Convert to p', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[3].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('p')
    tco = TextCat.changeBlockTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li></ul><p>def</p><ul><li>ghi<ul><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })
})

describe('nestIn method', () => {
  let originalWindow = window

  beforeEach((done) => {
    JSDOM.fromFile('__tests__/htmlSamples/sample1.html', { contentType: 'text/html' }).then((dom) => {
      Object.defineProperty(global, 'window', {
        value: dom.window,
        writable: true
      })
      Object.defineProperty(global, 'document', {
        value: dom.window.document,
        writable: true
      }) 
    }).then(done, done);
  })

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow.window,
      writable: true
    })
    Object.defineProperty(global, 'document', {
      value: originalWindow.window.document,
      writable: true
    })
  })

  test('selection made of entire ul', () =>{
    let sample: HTMLElement = window.document.getElementById('sample5')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[15].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><p>ABCDEFGHIJ</p><ul><li>abc<ul><li>def</li><li>ghi</li><li>j</li><li>123</li><li>456</li><li>789</li><li>0</li></ul></li></ul>')
    getSelectionMock.mockRestore()
  })

  test('selection made on first line of ul', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made on line before nested ul', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[3].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc<ul><li>def</li><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made on nested ul', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[3].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi<ul><li>j</li></ul></li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made from p and ul', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[3].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc<ul><li>def<ul><li>ghi</li><li>j</li></ul></li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made from ul and p', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc<ul><li>def<ul><li>ghi</li><li>j</li></ul></li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made from line before nested ul and first line of ul', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[3].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc<ul><li>def<ul><li>ghi</li></ul><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made from ul at end of target', () =>{
    let sample: HTMLElement = window.document.getElementById('sample5')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[15].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[15].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><p>ABCDEFGHIJ</p><ul><li>abc</li><li>def</li><li>ghi</li><li>j</li><li>123</li><li>456</li><li>789<ul><li>0</li></ul></li></ul>')
    getSelectionMock.mockRestore()
  })

  test('selection 8 item ul. Nest in 7 times', () =>{
    let sample: HTMLElement = window.document.getElementById('sample5')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[15].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><p>ABCDEFGHIJ</p><ul><li>abc<ul><li>def<ul><li>ghi<ul><li>j<ul><li>123<ul><li>456<ul><li>789<ul><li>0</li></ul></li></ul></li></ul></li></ul></li></ul></li></ul></li></ul></li></ul>')
    getSelectionMock.mockRestore()
  })

  test('selection 8 item ul. Nest in 4 times', () =>{
    let sample: HTMLElement = window.document.getElementById('sample5')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[15].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><p>ABCDEFGHIJ</p><ul><li>abc<ul><li>def<ul><li>ghi<ul><li>j<ul><li>123</li><li>456</li><li>789</li><li>0</li></ul></li></ul></li></ul></li></ul></li></ul>')
    getSelectionMock.mockRestore()
  })
})

describe('nestOut method', () => {
  let originalWindow = window

  beforeEach((done) => {
    JSDOM.fromFile('__tests__/htmlSamples/sample1.html', { contentType: 'text/html' }).then((dom) => {
      Object.defineProperty(global, 'window', {
        value: dom.window,
        writable: true
      })
      Object.defineProperty(global, 'document', {
        value: dom.window.document,
        writable: true
      }) 
    }).then(done, done);
  })

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow.window,
      writable: true
    })
    Object.defineProperty(global, 'document', {
      value: originalWindow.window.document,
      writable: true
    })
  })

  test('selection made of entire ul nest in then nest out', () =>{
    let sample: HTMLElement = window.document.getElementById('sample5')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[15].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestOut(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><p>ABCDEFGHIJ</p><ul><li>abc</li><li>def</li><li>ghi</li><li>j</li><li>123</li><li>456</li><li>789</li><li>0</li></ul>')
    getSelectionMock.mockRestore()
  })

  test('selection made on first line of ul nest in then nest out', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestOut(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made on line before nested ul nest in then nest out', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[3].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestOut(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made on nested ul nest in then nest out', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[3].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestOut(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def</li><li>ghi<ul><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made from p and ul nest in then nest out', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[3].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestOut(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made from ul and p nest in then nest out', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestOut(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made from line before nested ul and first line of ul nest in then nest out', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[3].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestOut(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('selection made from ul at end of target nest in then nest out', () =>{
    let sample: HTMLElement = window.document.getElementById('sample5')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[15].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[15].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestOut(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><p>ABCDEFGHIJ</p><ul><li>abc</li><li>def</li><li>ghi</li><li>j</li><li>123</li><li>456</li><li>789</li><li>0</li></ul>')
    getSelectionMock.mockRestore()
  })

  test('selection 8 item ul. Nest in 7 times then nest out 7 times', () =>{
    let sample: HTMLElement = window.document.getElementById('sample5')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[15].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestOut(tco)
    tco = TextCat.nestOut(tco)
    tco = TextCat.nestOut(tco)
    tco = TextCat.nestOut(tco)
    tco = TextCat.nestOut(tco)
    tco = TextCat.nestOut(tco)
    tco = TextCat.nestOut(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><p>ABCDEFGHIJ</p><ul><li>abc</li><li>def</li><li>ghi</li><li>j</li><li>123</li><li>456</li><li>789</li><li>0</li></ul>')
    getSelectionMock.mockRestore()
  })

  test('selection 8 item ul. Nest in 7 times then nest out 2 times', () =>{
    let sample: HTMLElement = window.document.getElementById('sample5')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[15].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestOut(tco)
    tco = TextCat.nestOut(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><p>ABCDEFGHIJ</p><ul><li>abc</li><li>def</li><li>ghi<ul><li>j<ul><li>123<ul><li>456<ul><li>789<ul><li>0</li></ul></li></ul></li></ul></li></ul></li></ul></li></ul>')
    getSelectionMock.mockRestore()
  })

  test('selection 8 item ul. Nest in 4 times then nest out 4 times', () =>{
    let sample: HTMLElement = window.document.getElementById('sample5')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[15].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestOut(tco)
    tco = TextCat.nestOut(tco)
    tco = TextCat.nestOut(tco)
    tco = TextCat.nestOut(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><p>ABCDEFGHIJ</p><ul><li>abc</li><li>def</li><li>ghi</li><li>j</li><li>123</li><li>456</li><li>789</li><li>0</li></ul>')
    getSelectionMock.mockRestore()
  })

  test('selection 8 item ul. Nest in 4 times then nest out 2 times', () =>{
    let sample: HTMLElement = window.document.getElementById('sample5')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[15].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestIn(tco)
    tco = TextCat.nestOut(tco)
    tco = TextCat.nestOut(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><p>ABCDEFGHIJ</p><ul><li>abc</li><li>def</li><li>ghi<ul><li>j<ul><li>123</li><li>456</li><li>789</li><li>0</li></ul></li></ul></li></ul>')
    getSelectionMock.mockRestore()
  })

  test('selection nest ul. Nest out then Nest in', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[3].childNodes[0] as Node, 1, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.nestOut(tco)
    tco = TextCat.nestIn(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })
})

describe('addTextAlign method', () => {
  let originalWindow = window

  beforeEach((done) => {
    JSDOM.fromFile('__tests__/htmlSamples/sample1.html', { contentType: 'text/html' }).then((dom) => {
      Object.defineProperty(global, 'window', {
        value: dom.window,
        writable: true
      })
      Object.defineProperty(global, 'document', {
        value: dom.window.document,
        writable: true
      }) 
    }).then(done, done);
  })

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow.window,
      writable: true
    })
    Object.defineProperty(global, 'document', {
      value: originalWindow.window.document,
      writable: true
    })
  })

  test('Align first line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[1].childNodes[0] as Node, 0, sample.childNodes[1].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.addTextAlign(TextAlign.Center, tco)
    expect(TextCat.html(tco)).toBe('<p class="text-align-center">ABCDEFGHIJ</p><p>1234567890</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Align middle line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 0, sample.childNodes[3].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.addTextAlign(TextAlign.Center, tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p class="text-align-center">1234567890</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Align last line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.addTextAlign(TextAlign.Center, tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p>1234567890</p><p>ABCDEFGHIJ</p><p class="text-align-center">1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Align multiple lines', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.addTextAlign(TextAlign.Center, tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p class="text-align-center">1234567890</p><p class="text-align-center">ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Align li', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.addTextAlign(TextAlign.Center, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li class="text-align-center">abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Align nested li', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.addTextAlign(TextAlign.Center, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li class="text-align-center">ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })
})

describe('removeTextAlign method', () => {
  let originalWindow = window

  beforeEach((done) => {
    JSDOM.fromFile('__tests__/htmlSamples/sample1.html', { contentType: 'text/html' }).then((dom) => {
      Object.defineProperty(global, 'window', {
        value: dom.window,
        writable: true
      })
      Object.defineProperty(global, 'document', {
        value: dom.window.document,
        writable: true
      }) 
    }).then(done, done);
  })

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow.window,
      writable: true
    })
    Object.defineProperty(global, 'document', {
      value: originalWindow.window.document,
      writable: true
    })
  })

  test('Align first line then remove align', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[1].childNodes[0] as Node, 0, sample.childNodes[1].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.addTextAlign(TextAlign.Center, tco)
    TextCat.removeTextAlign(tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p>1234567890</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Align middle line then remove align', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 0, sample.childNodes[3].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.addTextAlign(TextAlign.Center, tco)
    TextCat.removeTextAlign(tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p>1234567890</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Align last line then remove align', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.addTextAlign(TextAlign.Center, tco)
    TextCat.removeTextAlign(tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p>1234567890</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Align multiple lines then remove align', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.addTextAlign(TextAlign.Center, tco)
    TextCat.removeTextAlign(tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p>1234567890</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Align li then remove align', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.addTextAlign(TextAlign.Center, tco)
    TextCat.removeTextAlign(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Align nested li then remove align', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.addTextAlign(TextAlign.Center, tco)
    TextCat.removeTextAlign(tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })
})

describe('getTextAlign method', () => {
  let originalWindow = window

  beforeEach((done) => {
    JSDOM.fromFile('__tests__/htmlSamples/sample1.html', { contentType: 'text/html' }).then((dom) => {
      Object.defineProperty(global, 'window', {
        value: dom.window,
        writable: true
      })
      Object.defineProperty(global, 'document', {
        value: dom.window.document,
        writable: true
      }) 
    }).then(done, done);
  })

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow.window,
      writable: true
    })
    Object.defineProperty(global, 'document', {
      value: originalWindow.window.document,
      writable: true
    })
  })

  test('Align first line then get align', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[1].childNodes[0] as Node, 0, sample.childNodes[1].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.addTextAlign(TextAlign.Center, tco)
    expect(TextCat.getTextAlign(tco)).toBe(TextAlign.Center)
    getSelectionMock.mockRestore()
  })

  test('Align middle line then get align', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 0, sample.childNodes[3].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.addTextAlign(TextAlign.Center, tco)
    expect(TextCat.getTextAlign(tco)).toBe(TextAlign.Center)
    getSelectionMock.mockRestore()
  })

  test('Align last line then get align', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[0] as Node, 0, sample.childNodes[7].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.addTextAlign(TextAlign.Center, tco)
    expect(TextCat.getTextAlign(tco)).toBe(TextAlign.Center)
    getSelectionMock.mockRestore()
  })

  test('Align multiple lines then get align', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.addTextAlign(TextAlign.Center, tco)
    expect(TextCat.getTextAlign(tco)).toBe(TextAlign.Center)
    getSelectionMock.mockRestore()
  })

  test('Align li then get align', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.addTextAlign(TextAlign.Center, tco)
    expect(TextCat.getTextAlign(tco)).toBe(TextAlign.Center)
    getSelectionMock.mockRestore()
  })

  test('Align nested li then get align', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[5].childNodes[3].childNodes[1].childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    tco = TextCat.addTextAlign(TextAlign.Center, tco)
    expect(TextCat.getTextAlign(tco)).toBe(TextAlign.Center)
    getSelectionMock.mockRestore()
  })
})

describe('addStyleTag method', () => {
  let originalWindow = window

  beforeEach((done) => {
    JSDOM.fromFile('__tests__/htmlSamples/sample1.html', { contentType: 'text/html' }).then((dom) => {
      Object.defineProperty(global, 'window', {
        value: dom.window,
        writable: true
      })
      Object.defineProperty(global, 'document', {
        value: dom.window.document,
        writable: true
      }) 
    }).then(done, done);
  })

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow.window,
      writable: true
    })
    Object.defineProperty(global, 'document', {
      value: originalWindow.window.document,
      writable: true
    })
  })

  test('Add style at beginning of first line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 0, sample.childNodes[3].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('em')
    tco = TextCat.addStyleTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p><em>123</em><strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Add style to end of last line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[9].childNodes[0] as Node, 7, sample.childNodes[9].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('em')
    tco = TextCat.addStyleTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567<em>890</em></p>')
    getSelectionMock.mockRestore()
  })

  test('Add style to middle of line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[0] as Node, 3, sample.childNodes[7].childNodes[0] as Node, 6, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('em')
    tco = TextCat.addStyleTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABC<em>DEF</em>GHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Add style over selection already conataining a style', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[3].childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('em')
    tco = TextCat.addStyleTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<em><strong>456</strong></em>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Add style overlapping beginning of existing style', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 2, sample.childNodes[3].childNodes[1].childNodes[0] as Node, 2, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('em')
    tco = TextCat.addStyleTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>12<em>3<strong>45</strong></em><strong>6</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Add style overlapping end of existing style', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[1].childNodes[0] as Node, 2, sample.childNodes[3].childNodes[2] as Node, 2, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('em')
    tco = TextCat.addStyleTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>45</strong><em><strong>6</strong>78</em>90</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Add style over two lines', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[1].childNodes[0] as Node, 3, sample.childNodes[3].childNodes[0] as Node, 7, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('em')
    tco = TextCat.addStyleTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<p>ABC<em>DEFGHIJ</em></p><p><em>1234567</em>890</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })
})

describe('removeStyleTag method', () => {
  let originalWindow = window

  beforeEach((done) => {
    JSDOM.fromFile('__tests__/htmlSamples/sample1.html', { contentType: 'text/html' }).then((dom) => {
      Object.defineProperty(global, 'window', {
        value: dom.window,
        writable: true
      })
      Object.defineProperty(global, 'document', {
        value: dom.window.document,
        writable: true
      }) 
    }).then(done, done);
  })

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow.window,
      writable: true
    })
    Object.defineProperty(global, 'document', {
      value: originalWindow.window.document,
      writable: true
    })
  })

  test('Add style at beginning of first line then remove style', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 0, sample.childNodes[3].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('em')
    tco = TextCat.addStyleTag(tag, tco)
    tco = TextCat.removeStyleTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Add style to end of last line then remove style', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[9].childNodes[0] as Node, 7, sample.childNodes[9].childNodes[0] as Node, 10, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('em')
    tco = TextCat.addStyleTag(tag, tco)
    tco = TextCat.removeStyleTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Add style to middle of line then remove style', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[0] as Node, 3, sample.childNodes[7].childNodes[0] as Node, 6, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('em')
    tco = TextCat.addStyleTag(tag, tco)
    tco = TextCat.removeStyleTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Add style over selection already conataining a style then remove style', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[3].childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('em')
    tco = TextCat.addStyleTag(tag, tco)
    tco = TextCat.removeStyleTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Add style overlapping beginning of existing style then remove style', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 2, sample.childNodes[3].childNodes[1].childNodes[0] as Node, 2, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('em')
    tco = TextCat.addStyleTag(tag, tco)
    tco = TextCat.removeStyleTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Add style overlapping end of existing style then remove style', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[1].childNodes[0] as Node, 2, sample.childNodes[3].childNodes[2] as Node, 2, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('em')
    tco = TextCat.addStyleTag(tag, tco)
    tco = TextCat.removeStyleTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<h2>ABCDEFGHIJ</h2><p>123<strong>456</strong>7890</p><ul><li>abc</li><li>def<ul><li>ghi</li><li>j</li></ul></li></ul><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })

  test('Add style over two lines then remove style', () =>{
    let sample: HTMLElement = window.document.getElementById('sample3')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[1].childNodes[0] as Node, 3, sample.childNodes[3].childNodes[0] as Node, 7, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('em')
    tco = TextCat.addStyleTag(tag, tco)
    tco = TextCat.removeStyleTag(tag, tco)
    expect(TextCat.html(tco)).toBe('<p>ABCDEFGHIJ</p><p>1234567890</p><p>ABCDEFGHIJ</p><p>1234567890</p>')
    getSelectionMock.mockRestore()
  })
})

describe('getSelectedBlockTags method', () => {
  let originalWindow = window

  beforeEach((done) => {
    JSDOM.fromFile('__tests__/htmlSamples/sample1.html', { contentType: 'text/html' }).then((dom) => {
      Object.defineProperty(global, 'window', {
        value: dom.window,
        writable: true
      })
      Object.defineProperty(global, 'document', {
        value: dom.window.document,
        writable: true
      }) 
    }).then(done, done);
  })

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow.window,
      writable: true
    })
    Object.defineProperty(global, 'document', {
      value: originalWindow.window.document,
      writable: true
    })
  })

  test('Select single line', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[0] as Node, 3, sample.childNodes[7].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    expect(TextCat.getSelectedBlockTags(tco)).toBe('p')
    getSelectionMock.mockRestore()
  })

  test('Select multiple lines of same block type', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[7].childNodes[0] as Node, 3, sample.childNodes[9].childNodes[0] as Node, 4, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    expect(TextCat.getSelectedBlockTags(tco)).toBe('p')
    getSelectionMock.mockRestore()
  })

  test('Select multiple lines of different block types', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[1].childNodes[0] as Node, 3, sample.childNodes[3].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    expect(TextCat.getSelectedBlockTags(tco)).toBe('multi')
    getSelectionMock.mockRestore()
  })
})

describe('getSelectedStyleTags method', () => {
  let originalWindow = window

  beforeEach((done) => {
    JSDOM.fromFile('__tests__/htmlSamples/sample1.html', { contentType: 'text/html' }).then((dom) => {
      Object.defineProperty(global, 'window', {
        value: dom.window,
        writable: true
      })
      Object.defineProperty(global, 'document', {
        value: dom.window.document,
        writable: true
      }) 
    }).then(done, done);
  })

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow.window,
      writable: true
    })
    Object.defineProperty(global, 'document', {
      value: originalWindow.window.document,
      writable: true
    })
  })

  test('Select characters holding a style', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[3].childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    expect(TextCat.getSelectedStyleTags(tco)).toContain('strong')
    getSelectionMock.mockRestore()
  })

  test('Select characters not holding a style', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[0] as Node, 0, sample.childNodes[3].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    expect(TextCat.getSelectedStyleTags(tco)).toHaveLength(0)
    getSelectionMock.mockRestore()
  })

  test('Add style to characters holding an existing style', () =>{
    let sample: HTMLElement = window.document.getElementById('sample4')!
    const getSelectionMock = jest.spyOn(window, 'getSelection').mockImplementation(() => {
      return createSelection(sample.childNodes[3].childNodes[1].childNodes[0] as Node, 0, sample.childNodes[3].childNodes[1].childNodes[0] as Node, 3, originalWindow)
    })
    let tco:TextCatObject = TextCat.create()!
    let tag = TextCat.createTag('em')
    tco = TextCat.addStyleTag(tag, tco)
    expect(TextCat.getSelectedStyleTags(tco)).toContain('strong')
    expect(TextCat.getSelectedStyleTags(tco)).toContain('em')
    getSelectionMock.mockRestore()
  })
})

//setSelection
//No tests for this method as most of the method uses built in DOM methods that would need to be mocked. Given this the value of tests for this method is minimal while the level of effort is maximal 