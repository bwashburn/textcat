import { TextCat } from '../dist/TextCat.js'

let tco
let textAlignment
let currentBlockTag
let currentStyleTags
// Try to create TextCatObject when selection changes
document.addEventListener('selectionchange', selectionChanged)
function selectionChanged () {
    //console.log('selectionChanged')
    let myTCO = TextCat.create()
    if (myTCO === null) {
        tco = null
        textAlignment = null
        currentBlockTag = null
        currentStyleTags = null
    } else if (myTCO.target.isContentEditable) {
        tco = myTCO
        //console.log(tco)
        textAlignment = TextCat.getTextAlign(tco)
        currentBlockTag = TextCat.getSelectedBlockTags(tco)
        currentStyleTags = TextCat.getSelectedStyleTags(tco)
    } else {
        tco = null
        textAlignment = null
        currentBlockTag = null
        currentStyleTags = null
    }
    setActiveButtonStates()
}
function setActiveButtonStates () {
    let blockTagButtons = document.querySelectorAll('.block-tag')
    let styleTagButtons = document.querySelectorAll('.style-tag')
    let alignmentButtons = document.querySelectorAll('.alignment')

    // Remove all active classes
    blockTagButtons.forEach((bt) => {
        bt.classList.remove('active')
    })
    styleTagButtons.forEach((st) => {
        st.classList.remove('active')
    })
    alignmentButtons.forEach((a) => {
        a.classList.remove('active')
    })
    if (tco === null) {
        return
    }
    // Add Block-Tag Active
    switch (currentBlockTag) {
        case 'p':
            document.querySelector('.p-tag').classList.add('active')
            break
        case 'h1':
            document.querySelector('.h1-tag').classList.add('active')
            break
        case 'h2':
            document.querySelector('.h2-tag').classList.add('active')
            break
        case 'h3':
            document.querySelector('.h3-tag').classList.add('active')
            break
        case 'h4':
            document.querySelector('.h4-tag').classList.add('active')
            break
        case 'h5':
            document.querySelector('.h5-tag').classList.add('active')
            break
        case 'h6':
            document.querySelector('.h6-tag').classList.add('active')
            break
        case 'ul':
            document.querySelector('.ul-tag').classList.add('active')
            break
        case 'ol':
            document.querySelector('.ol-tag').classList.add('active')
            break
    }

    // Add Style-Tag Active
    currentStyleTags.forEach((st) => {
        switch (st) {
            case 'strong':
                document.querySelector('.bold-tag').classList.add('active')
                break
            case 'em':
                document.querySelector('.italic-tag').classList.add('active')
                break
            case 'u':
                document.querySelector('.underline-tag').classList.add('active')
                break
            case 's':
                document.querySelector('.strikethrough-tag').classList.add('active')
                break
            case 'sup':
                document.querySelector('.superscript-tag').classList.add('active')
                break
            case 'sub':
                document.querySelector('.subscript-tag').classList.add('active')
                break
        }
    })

    // Add Alignment Active
    switch (textAlignment) {
        case 'start':
            document.querySelector('.start-align').classList.add('active')
            break
        case 'end':
            document.querySelector('.end-align').classList.add('active')
            break
        case 'left':
            document.querySelector('.left-align').classList.add('active')
            break
        case 'right':
            document.querySelector('.right-align').classList.add('active')
            break
        case 'center':
            document.querySelector('.center-align').classList.add('active')
            break
        case 'justify':
            document.querySelector('.justify-align').classList.add('active')
            break
    }
}

// Block-Tag Button Event Handlers
document.querySelector('.p-tag').addEventListener('click', setP)
function setP () {
    let tag = TextCat.createTag('p')
    tco = TextCat.changeBlockTag(tag, tco)
    let output = TextCat.html(tco)
    console.log(tco)
    console.log(output)
    tco.target.innerHTML = output
    TextCat.setSelection(tco)
}

document.querySelector('.h1-tag').addEventListener('click', setH1)
function setH1 () {
    let tag = TextCat.createTag('h1')
    tco = TextCat.changeBlockTag(tag, tco)
    let output = TextCat.html(tco)
    console.log(tco)
    console.log(output)
    tco.target.innerHTML = output
    TextCat.setSelection(tco)
}

document.querySelector('.h2-tag').addEventListener('click', setH2)
function setH2 () {
    let tag = TextCat.createTag('h2')
    tco = TextCat.changeBlockTag(tag, tco)
    let output = TextCat.html(tco)
    console.log(tco)
    console.log(output)
    tco.target.innerHTML = output
    TextCat.setSelection(tco)
}

document.querySelector('.h3-tag').addEventListener('click', setH3)
function setH3 () {
    let tag = TextCat.createTag('h3')
    tco = TextCat.changeBlockTag(tag, tco)
    let output = TextCat.html(tco)
    console.log(tco)
    console.log(output)
    tco.target.innerHTML = output
    TextCat.setSelection(tco)
}

document.querySelector('.h4-tag').addEventListener('click', setH4)
function setH4 () {
    let tag = TextCat.createTag('h4')
    tco = TextCat.changeBlockTag(tag, tco)
    let output = TextCat.html(tco)
    console.log(tco)
    console.log(output)
    tco.target.innerHTML = output
    TextCat.setSelection(tco)
}

document.querySelector('.h5-tag').addEventListener('click', setH5)
function setH5 () {
    let tag = TextCat.createTag('h5')
    tco = TextCat.changeBlockTag(tag, tco)
    let output = TextCat.html(tco)
    console.log(tco)
    console.log(output)
    tco.target.innerHTML = output
    TextCat.setSelection(tco)
}

document.querySelector('.h6-tag').addEventListener('click', setH6)
function setH6 () {
    let tag = TextCat.createTag('h6')
    tco = TextCat.changeBlockTag(tag, tco)
    let output = TextCat.html(tco)
    console.log(tco)
    console.log(output)
    tco.target.innerHTML = output
    TextCat.setSelection(tco)
}

document.querySelector('.ul-tag').addEventListener('click', setUL)
function setUL () {
    let tag = TextCat.createTag('ul')
    tco = TextCat.changeBlockTag(tag, tco)
    let output = TextCat.html(tco)
    console.log(tco)
    console.log(output)
    tco.target.innerHTML = output
    TextCat.setSelection(tco)
}

document.querySelector('.ol-tag').addEventListener('click', setOL)
function setOL () {
    let tag = TextCat.createTag('ol')
    tco = TextCat.changeBlockTag(tag, tco)
    console.log(tco)
    let output = TextCat.html(tco)
    console.log(output)
    tco.target.innerHTML = output
    TextCat.setSelection(tco)
}

// Nesting Button Event Handlers
document.querySelector('.in-nest').addEventListener('click', setIN)
function setIN () {
    tco = TextCat.nestIn(tco)
    let output = TextCat.html(tco)
    console.log(tco)
    console.log(output)
    tco.target.innerHTML = output
    TextCat.setSelection(tco)
}

document.querySelector('.out-nest').addEventListener('click', setOUT)
function setOUT () {
    tco = TextCat.nestOut(tco)
    let output = TextCat.html(tco)
    console.log(tco)
    console.log(output)
    tco.target.innerHTML = output
    TextCat.setSelection(tco)
}

// Style-Tag Button Event Handlers
document.querySelector('.bold-tag').addEventListener('click', setBOLD)
function setBOLD () {
    if (tco !== null) {
        let tag = TextCat.createTag('strong')
        if (currentStyleTags.indexOf('strong') > -1) {
            tco = TextCat.removeStyleTag(tag, tco)
        } else {
            tco = TextCat.addStyleTag(tag, tco)
        }
        let output = TextCat.html(tco)
        console.log(tco)
        console.log(output)
        tco.target.innerHTML = output
        TextCat.setSelection(tco)
    }
}

document.querySelector('.italic-tag').addEventListener('click', setITALIC)
function setITALIC () {
    if (tco !== null) {
        let tag = TextCat.createTag('em')
        if (currentStyleTags.indexOf('em') > -1) {
            tco = TextCat.removeStyleTag(tag, tco)
        } else {
            tco = TextCat.addStyleTag(tag, tco)
        }
        let output = TextCat.html(tco)
        console.log(tco)
        console.log(output)
        tco.target.innerHTML = output
        TextCat.setSelection(tco)
    }
}

document.querySelector('.underline-tag').addEventListener('click', setUNDERLINE)
function setUNDERLINE () {
    if (tco !== null) {
        let tag = TextCat.createTag('u')
        if (currentStyleTags.indexOf('u') > -1) {
            tco = TextCat.removeStyleTag(tag, tco)
        } else {
            tco = TextCat.addStyleTag(tag, tco)
        }
        let output = TextCat.html(tco)
        console.log(tco)
        console.log(output)
        tco.target.innerHTML = output
        TextCat.setSelection(tco)
    }
}

document.querySelector('.strikethrough-tag').addEventListener('click', setSTRIKETHROUGH)
function setSTRIKETHROUGH () {
    if (tco !== null) {
        let tag = TextCat.createTag('s')
        if (currentStyleTags.indexOf('s') > -1) {
            tco = TextCat.removeStyleTag(tag, tco)
        } else {
            tco = TextCat.addStyleTag(tag, tco)
        }
        let output = TextCat.html(tco)
        console.log(tco)
        console.log(output)
        tco.target.innerHTML = output
        TextCat.setSelection(tco)
    }
}

document.querySelector('.superscript-tag').addEventListener('click', setSUPERSCRIPT)
function setSUPERSCRIPT () {
    if (tco !== null) {
        let tag = TextCat.createTag('sup')
        if (currentStyleTags.indexOf('sup') > -1) {
            tco = TextCat.removeStyleTag(tag, tco)
        } else {
            tco = TextCat.addStyleTag(tag, tco)
        }
        let output = TextCat.html(tco)
        console.log(tco)
        console.log(output)
        tco.target.innerHTML = output
        TextCat.setSelection(tco)
    }
}

document.querySelector('.subscript-tag').addEventListener('click', setSUBSCRIPT)
function setSUBSCRIPT () {
    if (tco !== null) {
        let tag = TextCat.createTag('sub')
        if (currentStyleTags.indexOf('sub') > -1) {
            tco = TextCat.removeStyleTag(tag, tco)
        } else {
            tco = TextCat.addStyleTag(tag, tco)
        }
        let output = TextCat.html(tco)
        console.log(tco)
        console.log(output)
        tco.target.innerHTML = output
        TextCat.setSelection(tco)
    }
}

// Alignment Button Event Handlers
document.querySelector('.start-align').addEventListener('click', setSTART)
function setSTART () {
    if (tco !== null) {
        if (textAlignment === 'start') {
            this.textObj = TextCat.removeTextAlign(tco)
        } else {
            this.textObj = TextCat.addTextAlign('start', tco)
        }
        let output = TextCat.html(tco)
        console.log(tco)
        console.log(output)
        tco.target.innerHTML = output
        TextCat.setSelection(tco)
    }
}

document.querySelector('.end-align').addEventListener('click', setEND)
function setEND () {
    if (tco !== null) {
        if (textAlignment === 'end') {
            this.textObj = TextCat.removeTextAlign(tco)
        } else {
            this.textObj = TextCat.addTextAlign('end', tco)
        }
        let output = TextCat.html(tco)
        console.log(tco)
        console.log(output)
        tco.target.innerHTML = output
        TextCat.setSelection(tco)
    }
}

document.querySelector('.left-align').addEventListener('click', setLEFT)
function setLEFT () {
    if (tco !== null) {
        if (textAlignment === 'left') {
            this.textObj = TextCat.removeTextAlign(tco)
        } else {
            this.textObj = TextCat.addTextAlign('left', tco)
        }
        let output = TextCat.html(tco)
        console.log(tco)
        console.log(output)
        tco.target.innerHTML = output
        TextCat.setSelection(tco)
    }
}

document.querySelector('.right-align').addEventListener('click', setRIGHT)
function setRIGHT () {
    if (tco !== null) {
        if (textAlignment === 'right') {
            this.textObj = TextCat.removeTextAlign(tco)
        } else {
            this.textObj = TextCat.addTextAlign('right', tco)
        }
        let output = TextCat.html(tco)
        console.log(tco)
        console.log(output)
        tco.target.innerHTML = output
        TextCat.setSelection(tco)
    }
}

document.querySelector('.center-align').addEventListener('click', setCENTER)
function setCENTER () {
    if (tco !== null) {
        if (textAlignment === 'center') {
            this.textObj = TextCat.removeTextAlign(tco)
        } else {
            this.textObj = TextCat.addTextAlign('center', tco)
        }
        let output = TextCat.html(tco)
        console.log(tco)
        console.log(output)
        tco.target.innerHTML = output
        TextCat.setSelection(tco)
    }
}

document.querySelector('.justify-align').addEventListener('click', setJUSTIFY)
function setJUSTIFY () {
    if (tco !== null) {
        if (textAlignment === 'justify') {
            this.textObj = TextCat.removeTextAlign(tco)
        } else {
            this.textObj = TextCat.addTextAlign('justify', tco)
        }
        let output = TextCat.html(tco)
        console.log(tco)
        console.log(output)
        tco.target.innerHTML = output
        TextCat.setSelection(tco)
    }
}