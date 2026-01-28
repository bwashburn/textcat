# TextCat
Textcat is a utility for working with content-editable text in the browser.

## Table of Contents

- [Install](#install)
- [Overview](#overview)
- [Data Types](#data-types)
- [Methods](#methods)
  - [create](#create)
  - [html](#html)
  - [insertText](#insert-text)
  - [createTag](#create-tag)
  - [changeBlockTag](#change-block-tag)
  - [getSelectedBlockTags](#get-selected-block-tags)
  - [nestIn](#nest-in)
  - [nestOut](#nest-out)
  - [addStyleTag](#add-style-tag)
  - [removeStyleTag](#remove-style-tag)
  - [getSelectedStyleTags](#get-selected-style-tags)
  - [addTextAlign](#add-text-align)
  - [removeTextAlign](#remove-text-align)
  - [getTextAlign](#get-text-align)
  - [setSelection](#set-selection)
- [Properties](#properties)
- [Examples](#examples)

## Install
```bash
$ npm install textcat
```

## Overview
TextCat is a static library, so it does not need to be instanciated. The library holds no state, but instead generates an [TextCatObject](#text-cat-object) that describes the currently selected text along with the text around it contained in the same [container](#container). The [TextCatObject](#text-cat-object) can then be manipulated with TextCat's [Methods](#methods) and finally transformed back into valid html to be reinserted into the DOM or handled in some other way.

## Data Types

### TextCatObject

### Character

### Tag

### CarotPos

### TextAlign

## Methods

### create(element: Element | null): TextCatObject | null
The create method generates a TextCatObject based 
```javascript
$ npm install axios
```
### html ()

### insertText ()

### createTag ()

### changeBlockTag ()

### getSelectedBlockTags ()

### nestIn ()

### nestOut ()

### addStyleTag ()

### removeStyleTag ()

### getSelectedStyleTags ()

### addTextAlign ()

### removeTextAlign ()

### getTextAlign ()

### setSelection ()

## Properties

### containerTags

### blockTags

### listTags

## Examples