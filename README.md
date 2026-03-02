<h1>TextCat</h1>
<img src="./img/textcat.svg" width="500" height="200"/>
<p>Textcat is a utility for working with content-editable text in the browser. Native functionality using <strong>window.getSelection()</strong> for getting and setting text styles gets complicated quickly as each addition changes the node tree. Textcat abstracts away the node tree, allowing easy text styling and querying. Textcat also has zero external dependencies!</p>

<h2>Table of Contents</h2>

- [Install](#install)
- [Overview](#overview)
- [Data Types](#data-types)
  - [Attribute](#attribute)
  - [CarotPos](#carot-pos)
  - [Character](#character)
  - [tag](#tag)
  - [TextAlign](#text-align)
  - [TextCatObject](#text-cat-object)
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
  - [containerTags](#container-tags)
  - [blockTags](#block-tags)
  - [listTags](#list-tags)
- [Examples](#examples)
- [License](#license)

<h2 id="install">Install</h2>

```bash
$ npm install textcat
```



<h2 id="overview">Overview</h2>
<p>TextCat is a static library, so it does not need to be instanciated. The library holds no state, but instead generates a <a href="#text-cat-object">TextCatObject</a> that describes the currently selected text along with the text contained in the same <a href="#container-tag">containerTag</a>. The <a href="#text-cat-object">TextCatObject</a> can then be manipulated with TextCat's <a href="#methods">Methods</a> and finally transformed back into valid html to be reinserted into the DOM or handled in some other way.<p>



<h2 id="data-types">Data Types</h2>

<h3 id="attribute">Attribute</h3>
<p>An attribute represents a property of a tag via an object with a name and value property.</p>

```javascript
let attribute = {
    name: 'attribute-name',
    value: 'attribute-value'
}
// attached to a tag this would look like: <p attribute-name="attribute-value"></p>
```
<h3 id="carot-pos">CarotPos</h3>
<p>An enum that represents the carot position within a line of text. Note that this only used when the carot has been positioned but no text has been selected.</p>

```javascript
import { CaretPos } from '../dist/TextCat.js'

CaretPos.Start // 'START',
CaretPos.End // 'END',
CaretPos.Middle // 'MIDDLE'
```

<h3 id="character">Character</h3>
<p>Character is an object that represents a single character within a block of text. It stores a character's value like 'A' along with two arrays of <a href="tag">tags</a>:</p>

- <strong>blockTag array:</strong> stores the block level tag(s) the character is associated with. Often the array is only one item deep like with 'p' or 'h1 - h6'; however, for a list item the array might look like this: ['ul', 'li'], and for a nested list: ['ul', 'li', 'ul', 'li'].

- <strong>styleTag array:</strong> stores all the styles applied to the character. All styles need to be tags, so for styles that do not have designated tags use 'span' with appropriate <a href="attribute">attributes</a>.

```javascript
let exampleChar = {
  char: 'a',
  blockTags: [{ type: 'p', attributes: [] }],
  styleTags: [{ type: 'strong', attributes: [] }, { type: 'em', attributes: [] }]
}
```

<h3 id="tag">Tag</h3>
<p>An object containing a type as string value (ex. 'p') and an array holding any <a href="attribute">attributes</a> the tag has.

```javascript
let exampleTag = {
    type: 'p',
    attributes: [
        { name: 'class', value: 'test-class' }
    ]
}
```

<h3 id="text-align">TextAlign</h3>
<p>An enum that represents the text alignment of a block level tag. Each value corrisponds to a class that is applied to a given block tag. The class name follows this pattern: 'text-align-[alignment]'. For example: 'center' becomes 'text-align-center'. In order for this to work the corrisponding classes need to be in the css of the project. </p>

```html
<link rel="stylesheet" type="text/css" href="textCat/dist/TextCat.css">

or

@import "textCat/dist/TextCat.css";
```

```javascript
import { TextAlign } from '../dist/TextCat.js'

TextAlign.Start // 'start',
TextAlign.End // 'end',
TextAlign.Left // 'left',
TextAlign.Right // 'right',
TextAlign.Center // 'center',
TextAlign.Justify // 'justify'
```
<h3 id="text-cat-object">TextCatObject</h3>
<p>A TextCatObject represents a block of text along with any selection made on the block of text. It is made up of 4 properties:</p>

- <strong>chars:</strong> is an array of all the <a href="#character">characters</a> with a block of text
- <strong>breakpoints:</strong> is an array of numbers storing at which <a href="#character">character</a> in the chars array one blockTag ends and the next begins.
- <strong>select:</strong> is an object with 3 properties:
  - <u>start:</u> stores the beginning of a selection as a number corrisponding to the array position of the <a href="#character">character</a> in the chars array. If the carot is active in a block of text but no characters are selected, both <strong>start</strong> and <strong>end</strong> will be the same number
  - <u>end:</u> stores the ending of a selection as a number corrisponding to the array position of the <a href="#character">character</a> in the chars array.
  - <u>carotPosition:</u> stores the <a href="#carot-pos">CarotPos</a>. This extra information is necessary because the position at the end of one line, and beginning of the next line are different, but if recorded only as a number representing a position within the chars array, these two positions would be the same number.
- <strong>target:</strong> a <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements" target="_blank">HTML element</a> matching the type of <a href="container-tag">containerTag</a>, usually also with the <strong>contenteditble</strong> property set to true.


<h2 id="methods">Methods</h2>

<h3 id="create">create(element: Element | null): TextCatObject | null</h3>
<p>The create method is used to generate a <a href="#text-cat-object">TextCatObject</a>. The <a href="#text-cat-object">TextCatObject</a> can then be used to style the selected text within the text block. This method takes a html element as an optional argument.</p>

<h4><u>Arguments</u></h4>
<strong>element</strong>

- <u>Required:</u> false

- <u>type:</u> <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements" target="_blank">HTML element</a>
&nbsp;&nbsp;<p>An html element matching one of the element types conatined in <a href="#container-tag">containerTag</a> which also contains text as children.</p>

<h4><u>Output</u></h4>
<p>This method outputs a <a href="#text-cat-object">TextCatObject</a> if a valid element is selected or passed in. Otherwise null is returned.</p>

<h4><u>Example</u></h4>
Standard use

```javascript
import { TextCat } from '../dist/TextCat.js'
let tco = TextCat.create()
```
Setting a specific element

```javascript
import { TextCat } from '../dist/TextCat.js'
let element = document.getElementById("elementId");
let tco = TextCat.create(element)
```

<br/>
<h3 id="html">html(tco: TextCatObject): string</h3>

<p>The html method is used to render out valid markup text after making style updates. This method takes a <a href="#text-cat-object">TextCatObject</a> and returns a string of HTML markup text.</p>

<h4><u>Arguments</u></h4>
<strong>tco</strong>

- <u>Required:</u> true

- <u>type:</u> <a href="#text-cat-object">TextCatObject</a>
&nbsp;&nbsp;<p>An object representing a textblock including its selection state.</p>

<h4><u>Output</u></h4>
<p>This method outputs a string of html markup representing the styled innerHTML of the target.</p>

<h4><u>Example</u></h4>

```javascript
import { TextCat } from '../dist/TextCat.js'
let tco = TextCat.create()
// Do styling stuff to tco
let output = TxtCat.html(tco)
tco.target.innerHTML = output
```

<br/>
<h3 id="insert-text">insertText(newText: string, tco: TextCatObject): TextCatObject</h3>

<p>The insertText method takes a string of new text to be added and a <a href="#text-cat-object">TextCatObject</a>. It returns a <a href="#text-cat-object">TextCatObject</a> with the text inserted at the text caret or replacing the selected text. If multiple lines are pasted in every line is given the <a href="#blockTags">blockTag</a> type of the line preceding the pasting text except the last line which is given the <a href="#blockTags">blockTag</a> of the subsequent line.</p>

<h4><u>Arguments</u></h4>
<strong>newText</strong>

- <u>Required:</u> true

- <u>type:</u> string
&nbsp;&nbsp;<p>a string representing text to be injected into the text block often coming from the clipboard.</p>

<strong>tco</strong>

- <u>Required:</u> true

- <u>type:</u> <a href="#text-cat-object">TextCatObject</a>
&nbsp;&nbsp;<p>An object representing a textblock including its selection state.</p>

<h4><u>Output</u></h4>
<p>This method outputs a <a href="#text-cat-object">TextCatObject</a> representing a text block with text injected.</p>

<h4><u>Example</u></h4>

```javascript
import { TextCat } from '../dist/TextCat.js'

//Get all containers with a property of contenteditable set to true. Note the contenteditable property can be placed on most any tag. This example assumes that contenteditable is only placed on container elements matching those of the containerTag property.
editableElements = document.querySelectorAll('[contenteditable="true"]')
//Add an event handler for each conatiner on the page
editableElements.forEach(element => {
    element.addEventListener('paste', pasteHandler)
}
//eventHandler where pasted text is injected into container.
function pasteHandler (event) {
    let pasteText = (event.clipboardData).getData('text')
    let tco = TextCat.create()
    tco = TextCat.insertText(pasteText, tco)
    let output = TextCat.html(tco)
    tco.target.innerHTML = output
}
```

<br/>
<h3 id="create-tag">createTag(tag: string, attributes: Attribute[]): Tag</h3>

<p>The createTag method takes a string representing a tag like 'p' or 'strong' and an optional array of tag attributes then returns a tag object to be used with <a href="#add-style-tag">addStyleTag</a>, <a href="#remove-style-tag">removeStyleTag</a>, and <a href="#change-block-tag">changeBlockTag</a> methods.</p>

<h4><u>Arguments</u><h4>
<strong>tag</strong>

- <u>Required:</u> true

- <u>type:</u> string
&nbsp;&nbsp;<p>A string representing text a string representing a tag like 'p' or 'strong'.</p>

<strong>attributes</strong>

- <u>Required:</u> false

- <u>type:</u> <a href="#attribute">Attribute</a>

<h4><u>Output</u></h4>
<p>This method outputs a <a href="#tag">tag</a> to be used to style text.</p>

<h4><u>Example</u></h4>

```javascript
import { TextCat } from '../dist/TextCat.js'

let tag = TextCat.createTag('strong')

//or

let attributes = [
    { name: 'style', value: 'color: #ff0000' },
    { name: 'class', value: 'custom-class' }
]
let tagWithAttributes = TextCat.createTag('strong', attributes)
```

<br/>
<h3 id="change-block-tag">changeBlockTag(tag: Tag, tco: TextCatObject): TextCatObject</h3>

<p>The changeBlockTag is used to change the blockTag type of the selected text. This method takes a <a href="#tag">tag</a> object and a <a href="#text-cat-object">TextCatObject</a> and returns a modified <a href="#text-cat-object">TextCatObject</a> where the block level tags are replaced for all lines containing selected text.</p>

<h4><u>Arguments</u><h4>
<strong>tag</strong>

- <u>Required:</u> true

- <u>type:</u> <a href="#tag">tag</a>
&nbsp;&nbsp;a tag object of type 'p', 'h1' - 'h6', 'ul', and 'ol'.

<strong>tco</strong>

- <u>Required:</u> true

- <u>type:</u> <a href="#text-cat-object">TextCatObject</a>

<h4><u>Output</u></h4>
<p>This method outputs a <a href="#text-cat-object">TextCatObject</a> with the block level tags of the lines containing selected text replaced.</p>

<h4><u>Example</u></h4>

```javascript
import { TextCat } from '../dist/TextCat.js'

let tco = TextCat.create()
let tag = TextCat.createTag('h1')
tco = TextCat.changeBlockTag(tag, tco)
let output = TextCat.html(tco)
tco.target.innerHTML = output
```

<br/>
<h3 id="get-selected-block-tags">getSelectedBlockTags(tco: TextCatObject): string</h3>

<p>The getSelectedBlockTags method is used to determine which blockTag is selected. This method can be used to create an interface that shows the details of the currently selected text. The method takes a <a href="#text-cat-object">TextCatObject</a> and returns a string identifying the selected block tag or 'multi' if multiple blocktag types are selected.</p>

<h4><u>Arguments</u><h4>

<strong>tco</strong>

- <u>Required:</u> true

- <u>type:</u> <a href="#text-cat-object">TextCatObject</a>

<h4><u>Output</u></h4>
<p>This method outputs a string identifying the selected block tag or 'multi' if multiple blocktag types are selected.</p>

<h4><u>Example</u></h4>

```javascript
import { TextCat } from '../dist/TextCat.js'

let tco = TextCat.create()
let selectedBlockTag = TextCat.getSelectedBlockTags(tco)
console.log(selectedBlockTag) //'p'
```

<br/>
<h3 id="nest-in">nestIn(tco: TextCatObject): TextCatObject</h3>

<p>The nestIn method is used to tab in list items turning the items into a nested list. The method takes a <a href="#text-cat-object">TextCatObject</a> and returns a <a href="#text-cat-object">TextCatObject</a> with the selected list items nested in one level.</p>

<h4><u>Arguments</u><h4>

<strong>tco</strong>

- <u>Required:</u> true

- <u>type:</u> <a href="#text-cat-object">TextCatObject</a>

<h4><u>Output</u></h4>
<p>This method outputs a <a href="#text-cat-object">TextCatObject</a> with the selected list items nested in one level.</p>

<h4><u>Example</u></h4>

```javascript
import { TextCat } from '../dist/TextCat.js'

let tco = TextCat.create()
tco = TextCat.nestIn(tco)
let output = TextCat.html(tco)
tco.target.innerHTML = output
```

<br/>
<h3 id="nest-out">nestOut(tco: TextCatObject): TextCatObject</h3>

<p>The nestOut method is used to remove the nesting of selected list items. The method takes a <a href="#text-cat-object">TextCatObject</a> and returns a <a href="#text-cat-object">TextCatObject</a> with the selected list items de-nested one level.</p>

<h4><u>Arguments</u><h4>

<strong>tco</strong>

- <u>Required:</u> true

- <u>type:</u> <a href="#text-cat-object">TextCatObject</a>

<h4><u>Output</u></h4>
<p>This method outputs a <a href="#text-cat-object">TextCatObject</a> with the selected list items de-nested one level.</p>

<h4><u>Example</u></h4>

```javascript
import { TextCat } from '../dist/TextCat.js'

let tco = TextCat.create()
tco = TextCat.nestOut(tco)
let output = TextCat.html(tco)
tco.target.innerHTML = output
```

<br/>
<h3 id="add-style-tag">addStyleTag(tag: Tag, tco: TextCatObject): TextCatObject</h3>

<p>The addStyleTag is used to add a style tag to the selected text. This method takes a <a href="#tag">tag</a> object and a <a href="#text-cat-object">TextCatObject</a> and returns a modified <a href="#text-cat-object">TextCatObject</a> where a style tag is added to the selected text.</p>

<h4><u>Arguments</u><h4>
<strong>tag</strong>

- <u>Required:</u> true

- <u>type:</u> <a href="#tag">tag</a>
&nbsp;&nbsp;An inline tag object like 'strong', 'em', 'u', 's', 'sup', 'sub', 'a' or 'span'.

<strong>tco</strong>

- <u>Required:</u> true

- <u>type:</u> <a href="#text-cat-object">TextCatObject</a>

<h4><u>Output</u></h4>
<p>This method outputs a <a href="#text-cat-object">TextCatObject</a> where a style tag is added to the selected text.</p>

<h4><u>Example</u></h4>

```javascript
import { TextCat } from '../dist/TextCat.js'

let tco = TextCat.create()
let tag = TextCat.createTag('span', [{ name: 'style', value: 'color: #ff0000'}])
tco = TextCat.addStyleTag(tag, tco)
let output = TextCat.html(tco)
tco.target.innerHTML = output
```

<br/>
<h3 id="remove-style-tag">removeStyleTag(tag: Tag, tco: TextCatObject): TextCatObject</h3>

<p>The removeStyleTag is used to remove a style tag from the selected text. This method takes a <a href="#tag">tag</a> object and a <a href="#text-cat-object">TextCatObject</a> and returns a modified <a href="#text-cat-object">TextCatObject</a> where a style tag is removed from the selected text.</p>

<h4><u>Arguments</u><h4>
<strong>tag</strong>

- <u>Required:</u> true

- <u>type:</u> <a href="#tag">tag</a>
An inline tag object like 'strong', 'em', 'u', 's', 'sup', 'sub', 'a' or 'span'.

<strong>tco</strong>

- <u>Required:</u> true

- <u>type:</u> <a href="#text-cat-object">TextCatObject</a>

<h4><u>Output</u></h4>
<p>This method outputs a <a href="#text-cat-object">TextCatObject</a> where a style tag is removed from the selected text.</p>

<h4><u>Example</u></h4>

```javascript
import { TextCat } from '../dist/TextCat.js'

let tco = TextCat.create()
let tag = TextCat.createTag('strong')
tco = TextCat.removeStyleTag(tag, tco)
let output = TextCat.html(tco)
tco.target.innerHTML = output
```

<br/>
<h3 id="get-selected-style-tags">getSelectedStyleTags(tco: TextCatObject): string[]</h3>

<p>The getSelectedStyleTags method is used to determine which styleTags are selected. This method can be used to create an interface that shows the details of the currently selected text. The method takes a <a href="#text-cat-object">TextCatObject</a> and returns an array of strings identifying the selected style tag types that are selected. If a tag has attributes, those attributes are included in the array with the format: name|value</p>

<h4><u>Arguments</u><h4>

<strong>tco</strong>

- <u>Required:</u> true

- <u>type:</u> <a href="#text-cat-object">TextCatObject</a>

<h4><u>Output</u></h4>
<p>This method outputs an array of strings identifying the selected style tag types that are selected along with any attributes of those tags.</p>

<h4><u>Example</u></h4>

```javascript
import { TextCat } from '../dist/TextCat.js'

let tco = TextCat.create()
let selectedStyleTag = TextCat.getSelectedStyleTags(tco)
console.log(selectedStyleTag) //['strong', 'a', 'target|_blank', 'href|textcat.com']
```

<br/>
<h3 id="add-text-align">addTextAlign(alignment: TextAlign, tco: TextCatObject): TextCatObject</h3>

<p>The addTextAlign method sets text alignment on selected blockTags. The method takes a TextAlign enum or an equivilent string, and a <a href="#text-cat-object">TextCatObject</a> and returns an updated <a href="#text-cat-object">TextCatObject</a> where an alignment class is added to the selected blockTags.</p>

<h4><u>Arguments</u><h4>

<strong>alignment</strong>

- <u>Required:</u> true

- <u>type:</u> <a href="#text-align">TextAlign</a>

<strong>tco</strong>

- <u>Required:</u> true

- <u>type:</u> <a href="#text-cat-object">TextCatObject</a>

<h4><u>Output</u></h4>
<p>This method outputs a <a href="#text-cat-object">TextCatObject</a> where an alignment class is added to the selected blockTags.</p>

<h4><u>Example</u></h4>

```javascript
import { TextCat, TextAlign } from '../dist/TextCat.js'

let tco = TextCat.create()
tco = TextCat.addTextAlign(TextAlign.Center, tco)
let output = TextCat.html(tco)
tco.target.innerHTML = output
```

<br/>
<h3 id="remove-text-align">removeTextAlign(tco: TextCatObject): TextCatObject</h3>

<p>The removeTextAlign method removes the text alignment on selected blockTags. The method takes a <a href="#text-cat-object">TextCatObject</a> and returns an updated <a href="#text-cat-object">TextCatObject</a> where an alignment class is removed from the selected blockTags.</p>

<h4><u>Arguments</u><h4>

<strong>tco</strong>

- <u>Required:</u> true

- <u>type:</u> <a href="#text-cat-object">TextCatObject</a>

<h4><u>Output</u></h4>
<p>This method outputs a <a href="#text-cat-object">TextCatObject</a> where an alignment class is removed from the selected blockTags.</p>

<h4><u>Example</u></h4>

```javascript
import { TextCat, TextAlign } from '../dist/TextCat.js'

let tco = TextCat.create()
tco = TextCat.removeTextAlign(tco)
let output = TextCat.html(tco)
tco.target.innerHTML = output
```

<br/>
<h3 id="get-text-align">getTextAlign(tco: TextCatObject): TextAlign | null</h3>

<p>The getTextAlign method is used to determine which if any alignment classes are  applied to the selected blockTags. This method can be used to create an interface that shows the details of the currently selected text. The method takes a <a href="#text-cat-object">TextCatObject</a> and returns a <a href="#text-align">TextAlign</a> enum or null if there is no alignment class applied.</p>

<h4><u>Arguments</u><h4>

<strong>tco</strong>

- <u>Required:</u> true

- <u>type:</u> <a href="#text-cat-object">TextCatObject</a>

<h4><u>Output</u></h4>
<p>This method outputs a <a href="#text-cat-object">TextCatObject</a> with any alignment class removed from selected blockTags.</p>

<h4><u>Example</u></h4>

```javascript
import { TextCat } from '../dist/TextCat.js'

let tco = TextCat.create()
let selectedStyleTag = TextCat.getTextAlign(tco)
console.log(selectedStyleTag) //'center'
```

<br/>
<h3 id="set-selection">setSelection(tco: TextCatObject): void</h3>

<p>The getTextAlign method is used to determine which if any alignment classes are  applied to the selected blockTags. This method can be used to create an interface that shows the details of the currently selected text. The method takes a <a href="#text-cat-object">TextCatObject</a> and returns a <a href="#text-align">TextAlign</a> enum or null if there is no alignment class applied.</p>

<h4><u>Arguments</u><h4>

<strong>tco</strong>

- <u>Required:</u> true

- <u>type:</u> <a href="#text-cat-object">TextCatObject</a>

<h4><u>Output</u></h4>
<p>None</p>

<h4><u>Example</u></h4>

```javascript
import { TextCat } from '../dist/TextCat.js'

let tco = TextCat.create()
//Do stuff to tco
let output = TextCat.html(tco)
tco.target.innerHTML = output
//Setting the innerHTML removes the selection
TextCat.setSelection(tco) //Selection is reapplied
```



<h2 id="properties">Properties</h2>

<h3 id="container-tags">containerTags</h3>
<p>containerTags is an array of strings representing all the container types TextCat will recognize when creating a <a href="#text-cat-object">TextCatObject</a>. By default the array is set as: ['article', 'aside', 'div', 'footer', 'header', 'main', 'section']</p>

```javascript
import { TextCat } from '../dist/TextCat.js'

let containerTags = TextCat.containerTags
containerTags.push('custom-tag')
TextCat.containerTags = containerTags
```

<h3 id="block-tags">blockTags</h3>
<p>blockTags is an array of strings representing all the block level tags TextCat will recognize when creating a <a href="#text-cat-object">TextCatObject</a>. Any tag not in this list is assumed to be a inline tag (styleTag). By default the array is set as: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li']</p>

```javascript
import { TextCat } from '../dist/TextCat.js'

let blockTags = TextCat.blockTags
// 'li' needs to be the last item in the array so in this example the new tag is added to the beginning of the array
blockTags.unshift('custom-tag')
TextCat.blockTags = blockTags
```

<h3 id="list-tags">listTags</h3>
<p>listTags is an array of strings representing all the list type tags TextCat will recognize when creating a <a href="#text-cat-object">TextCatObject</a>. By default the array is set as: ['ul', 'ol']</p>

```javascript
import { TextCat } from '../dist/TextCat.js'

let listTags = TextCat.listTags
listTags.push('custom-list')
TextCat.listTags = listTags
```


<h2 id="examples">Examples</h2>
<h3>Basic Usage</h3>
<p>This example shows the functionality for switching selected text blocks to paragraphs and headers, along with setting or removing bold from selected characters.</p>

```javascript
import { TextCat } from '../dist/TextCat.js'

let tco
let currentStyleTags

document.addEventListener('selectionchange', selectionChanged) //Listen for selection changes
function selectionChanged (event) {
  let myTCO = TextCat.create() //Create TextCat object from selected text
  if (myTCO === null) {
    tco = null
  } else {
    tco = myTCO //Set TextCat object to global variable
    currentStyleTags = TextCat.getSelectedStyleTags(tco) //Get style tags of current selection
  }
}

document.querySelector('.p-tag').addEventListener('click', setP) //Button event handler
function setP () {  //Set selected block of text to a parageaph.
    let tag = TextCat.createTag('p') //Create new tag
    tco = TextCat.changeBlockTag(tag, tco) //Convert selected block of text to new BlockTag
    let output = TextCat.html(tco) //Generate updated html
    tco.target.innerHTML = output //Replace old html with newly generated html
    TextCat.setSelection(tco) //Reselect previously selected characters
}

document.querySelector('.h1-tag').addEventListener('click', setH1) //Button event handler
function setH1 () { //Set selected block of text to h1.
    let tag = TextCat.createTag('h1') //Create new tag
    tco = TextCat.changeBlockTag(tag, tco) //Convert selected block of text to new BlockTag
    let output = TextCat.html(tco) //Generate updated html
    tco.target.innerHTML = output //Replace old html with newly generated html
    TextCat.setSelection(tco) //Reselect previously selected characters
}

document.querySelector('.bold-tag').addEventListener('click', setBOLD) //Button event handler
function setBOLD () { //Toggle Bold style of selected characters
    if (tco !== null) {
        let tag = TextCat.createTag('strong') //Create new tag
        if (currentStyleTags.indexOf('strong') > -1) { //Check if style is alreadsy applied
            tco = TextCat.removeStyleTag(tag, tco) //Remove if already applied
        } else {
            tco = TextCat.addStyleTag(tag, tco) //Add if not applied
        }
        let output = TextCat.html(tco) //Generate updated html
        tco.target.innerHTML = output //Replace old html with newly generated html
        TextCat.setSelection(tco) //Reselect previously selected characters
    }
}
```
<p>This project contains an example folder where a complete text edit panel has been built out. For further help review the example.</p>

<h2 id="license">License</h2>
<a href="https://opensource.org/license/mit" target="_blank">License</a>