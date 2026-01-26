export var CaretPos;
(function (CaretPos) {
    CaretPos["Start"] = "START";
    CaretPos["End"] = "END";
    CaretPos["Middle"] = "MIDDLE";
})(CaretPos || (CaretPos = {}));
export var TextAlign;
(function (TextAlign) {
    TextAlign["Start"] = "start";
    TextAlign["End"] = "end";
    TextAlign["Left"] = "left";
    TextAlign["Right"] = "right";
    TextAlign["Center"] = "center";
    TextAlign["Justify"] = "justify";
})(TextAlign || (TextAlign = {}));
export class TextCat {
    static _containerTags = ['article', 'aside', 'div', 'footer', 'header', 'main', 'section'];
    static get containerTags() { return TextCat._containerTags; }
    static set containerTags(tags) { TextCat._containerTags = tags; }
    static _blockTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'];
    static get blockTags() { return TextCat._blockTags; }
    static set blockTags(tags) { TextCat._blockTags = tags; }
    static _listTags = ['ul', 'ol'];
    static get listTags() { return TextCat._listTags; }
    static set listTags(tags) { TextCat._listTags = tags; }
    constructor() { }
    static create(element = null) {
        let selection = window.getSelection();
        let target = TextCat._getEditContainer(element, selection);
        if (target === null)
            return null;
        let elementContainsSelection = false;
        let select = { start: null, end: null, caretPosition: null };
        if (selection !== null && target != null) {
            elementContainsSelection = (target.contains(selection.anchorNode)) ? true : false;
        }
        let po = TextCat._markupParse(target);
        if (elementContainsSelection || element === null && selection != null) {
            select = TextCat._parseSelection(target, po.breakpoints, selection);
        }
        return {
            target: target,
            chars: po.chars,
            breakpoints: po.breakpoints,
            select: select
        };
    }
    static html(tco) {
        let chars = tco.chars;
        let breakpoints = tco.breakpoints;
        let markupString = '';
        let lastTags = null;
        for (let i = 0; i < chars.length; i++) {
            let allCharTags = chars[i].blockTags.concat(chars[i].styleTags);
            let lastChar = chars[i - 1];
            let currentChar = chars[i];
            if (i === 0) {
                markupString += TextCat._openTags(allCharTags);
                markupString += chars[i].char;
                lastTags = allCharTags;
            }
            else if (breakpoints.indexOf(i) > -1) {
                markupString += TextCat._closeTags(lastChar.styleTags);
                markupString += TextCat._compareBlockTags(lastChar.blockTags, currentChar.blockTags);
                markupString += TextCat._openTags(currentChar.styleTags);
                markupString += chars[i].char;
                if (i === chars.length - 1) {
                    markupString += TextCat._closeTags(allCharTags);
                }
                lastTags = allCharTags;
            }
            else if (i === chars.length - 1) {
                markupString += chars[i].char;
                markupString += TextCat._closeTags(allCharTags);
            }
            else {
                markupString += TextCat._compareStyleTags(lastChar.styleTags, currentChar.styleTags);
                markupString += chars[i].char;
                lastTags = allCharTags;
            }
        }
        return markupString;
    }
    static insertText(newText, tco) {
        let charRange = TextCat._parseBlockLevel(tco);
        let breakpointStart = tco.breakpoints.indexOf(charRange.start);
        let breakpointEnd = (tco.breakpoints.indexOf(charRange.end + 1) > -1) ? tco.breakpoints.indexOf(charRange.end + 1) : tco.breakpoints.length;
        let introTag = (tco.select.start === tco.chars.length) ? tco.chars[tco.select.start - 1] : tco.chars[tco.select.start];
        let outroTag = tco.chars[Math.max(tco.select.end - 1, 0)];
        let outroOffset = (tco.select.end >= tco.breakpoints[tco.breakpoints.length - 1]) ? tco.chars.length - tco.select.end : charRange.end - (tco.select.end - 1);
        let regex1 = /•\t/g;
        let regex2 = /\r\n|\r|\n/g;
        newText = newText.replace(regex1, '');
        let newTextLineArray = newText.split(regex2);
        newText = newText.replace(regex2, '');
        newTextLineArray = newTextLineArray.filter(item => item);
        let newTextArray = [];
        let endLineStartPos = newText.length - newTextLineArray[newTextLineArray.length - 1].length;
        for (let i = 0; i < newText.length; i++) {
            let character = newText.charAt(i);
            if (i >= endLineStartPos && newText.length > endLineStartPos) {
                let char = JSON.parse(JSON.stringify(outroTag));
                char.char = character;
                newTextArray.push(char);
            }
            else {
                let char = JSON.parse(JSON.stringify(introTag));
                char.char = character;
                newTextArray.push(char);
            }
        }
        let breakpointsInserts = [];
        let characterDelta = newText.length - (tco.select.end - tco.select.start);
        if (newTextLineArray.length > 1) {
            if (tco.select.start === tco.select.end) {
                if (tco.select.caretPosition === CaretPos.End) {
                    let count = tco.select.start;
                    for (let i = 0; i < newTextLineArray.length; i++) {
                        count += newTextLineArray[i].length;
                        breakpointsInserts.push(count);
                    }
                    if (tco.breakpoints.length === breakpointEnd) {
                        tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1).concat(breakpointsInserts.slice(0, -1));
                    }
                    else {
                        for (let i = breakpointEnd + 1; i < tco.breakpoints.length; i++) {
                            tco.breakpoints[i] += characterDelta;
                        }
                        tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1).concat(breakpointsInserts, tco.breakpoints.slice(breakpointEnd + 1));
                    }
                    tco.select.caretPosition = CaretPos.End;
                }
                else {
                    let count = tco.select.start;
                    for (let i = 0; i < newTextLineArray.length; i++) {
                        count += newTextLineArray[i].length;
                        if (i === newTextLineArray.length - 1) {
                            count += outroOffset;
                            breakpointsInserts.push(count);
                        }
                        else {
                            breakpointsInserts.push(count);
                        }
                    }
                    if (tco.breakpoints.length === breakpointEnd) {
                        tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1).concat(breakpointsInserts.slice(0, -1));
                    }
                    else {
                        for (let i = breakpointEnd; i < tco.breakpoints.length; i++) {
                            tco.breakpoints[i] += characterDelta;
                        }
                        tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1).concat(breakpointsInserts, tco.breakpoints.slice(breakpointEnd + 1));
                    }
                    tco.select.caretPosition = CaretPos.Middle;
                }
            }
            else {
                if (breakpointStart === breakpointEnd - 1) {
                    let count = tco.select.start;
                    for (let i = 0; i < newTextLineArray.length; i++) {
                        count += newTextLineArray[i].length;
                        if (i === newTextLineArray.length - 1) {
                            count += outroOffset;
                            breakpointsInserts.push(count);
                        }
                        else {
                            breakpointsInserts.push(count);
                        }
                    }
                    if (tco.breakpoints.length === breakpointEnd) {
                        tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1).concat(breakpointsInserts.slice(0, -1));
                    }
                    else {
                        for (let i = breakpointEnd; i < tco.breakpoints.length; i++) {
                            tco.breakpoints[i] += characterDelta;
                        }
                        tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1).concat(breakpointsInserts, tco.breakpoints.slice(breakpointEnd + 1));
                    }
                    tco.select.caretPosition = CaretPos.End;
                }
                else {
                    let count = tco.select.start;
                    for (let i = 0; i < newTextLineArray.length; i++) {
                        count += newTextLineArray[i].length;
                        breakpointsInserts.push(count);
                    }
                    if (breakpointEnd === tco.breakpoints.length) {
                        tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1).concat(breakpointsInserts.slice(0, -1));
                    }
                    else {
                        for (let i = breakpointEnd; i < tco.breakpoints.length; i++) {
                            tco.breakpoints[i] += characterDelta;
                        }
                        tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1).concat(breakpointsInserts, tco.breakpoints.slice(breakpointEnd + 1));
                    }
                    tco.select.caretPosition = CaretPos.End;
                }
            }
        }
        else {
            if (tco.select.start === tco.select.end) {
                if (tco.select.caretPosition === CaretPos.End) {
                    for (let i = breakpointStart + 1; i < tco.breakpoints.length; i++) {
                        tco.breakpoints[i] += characterDelta;
                    }
                    tco.select.caretPosition = CaretPos.End;
                }
                else {
                    if (breakpointStart + 1 < tco.breakpoints.length) {
                        for (let i = breakpointStart + 1; i < tco.breakpoints.length; i++) {
                            tco.breakpoints[i] += characterDelta;
                        }
                        tco.select.caretPosition = CaretPos.Middle;
                    }
                }
            }
            else {
                if (breakpointStart === breakpointEnd - 1) {
                    if (breakpointStart + 1 < tco.breakpoints.length) {
                        for (let i = breakpointStart + 1; i < tco.breakpoints.length; i++) {
                            tco.breakpoints[i] += characterDelta;
                        }
                        tco.select.caretPosition = CaretPos.End;
                    }
                }
                else {
                    for (let i = breakpointEnd; i < tco.breakpoints.length; i++) {
                        tco.breakpoints[i] += characterDelta;
                    }
                    if (breakpointEnd === tco.breakpoints.length) {
                        tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1);
                    }
                    else {
                        tco.breakpoints = tco.breakpoints.slice(0, breakpointStart + 1).concat(tco.breakpoints.slice(breakpointEnd));
                    }
                    tco.select.caretPosition = CaretPos.End;
                }
            }
        }
        tco.chars = tco.chars.slice(0, tco.select.start).concat(newTextArray, tco.chars.slice(tco.select.end));
        tco.select.start = tco.select.end + characterDelta;
        tco.select.end = tco.select.end + characterDelta;
        return tco;
    }
    static changeBlockTag(newTag, tco) {
        let charRange = TextCat._parseBlockLevel(tco);
        let chars = tco.chars;
        let newBlockTags = null;
        for (let k = charRange.start; k <= charRange.end; k++) {
            if (tco.breakpoints.indexOf(k) > -1 && k > charRange.start) {
                newBlockTags = TextCat._replaceTopBlockTag(newTag, chars[k].blockTags, chars[k - 1].blockTags);
            }
            else if (tco.breakpoints.indexOf(k) > -1) {
                newBlockTags = TextCat._replaceTopBlockTag(newTag, chars[k].blockTags, null);
            }
            chars[k].blockTags = newBlockTags;
        }
        if (charRange.extended !== null) {
            let extendedBlockTags = null;
            for (let l = charRange.end + 1; l < charRange.extended; l++) {
                if (tco.breakpoints.indexOf(l) > -1 || extendedBlockTags === null) {
                    let lastBlockTags = chars[l - 1].blockTags;
                    extendedBlockTags = TextCat._replaceExtendedBlockTags(lastBlockTags, tco.chars[l].blockTags);
                }
                tco.chars[l].blockTags = extendedBlockTags;
            }
        }
        tco.chars = chars;
        return tco;
    }
    static nestIn(tco) {
        let charRange = TextCat._parseBlockLevel(tco);
        let newBlockTags;
        for (let k = charRange.start; k <= charRange.end; k++) {
            let currentBlockTags = tco.chars[k].blockTags;
            if (currentBlockTags.length < 2) {
                newBlockTags = JSON.parse(JSON.stringify(currentBlockTags));
            }
            else if (tco.breakpoints.indexOf(k) > -1 && k > 0) {
                let oldBlockTags = tco.chars[k - 1].blockTags;
                let sameCount = 0;
                let tagL = Math.min(oldBlockTags.length, currentBlockTags.length);
                for (let i = 0; i < tagL; i++) {
                    if (oldBlockTags[i].type === currentBlockTags[i].type) {
                        sameCount++;
                    }
                    else {
                        break;
                    }
                }
                if (sameCount < 2) {
                    newBlockTags = JSON.parse(JSON.stringify(currentBlockTags));
                }
                else if (oldBlockTags.length >= currentBlockTags.length) {
                    newBlockTags = JSON.parse(JSON.stringify(currentBlockTags));
                    let listTag = JSON.parse(JSON.stringify(currentBlockTags.at(-2)));
                    let li = TextCat.createTag('li');
                    newBlockTags.push(listTag);
                    newBlockTags.push(li);
                }
                else {
                    newBlockTags = JSON.parse(JSON.stringify(currentBlockTags));
                }
            }
            else if (tco.breakpoints.indexOf(k) > -1 && k === 0) {
                newBlockTags = JSON.parse(JSON.stringify(currentBlockTags));
            }
            tco.chars[k].blockTags = newBlockTags;
        }
        return tco;
    }
    static nestOut(tco) {
        tco.chars = JSON.parse(JSON.stringify(tco.chars));
        let charRange = TextCat._parseBlockLevel(tco);
        let chars = tco.chars;
        for (let k = charRange.start; k <= charRange.end; k++) {
            let char = chars[k];
            if (char.blockTags.length > 3) {
                char.blockTags.splice(char.blockTags.length - 3, 2);
            }
        }
        tco.chars = chars;
        return tco;
    }
    static createTag(tag, attributes = []) {
        return {
            type: tag,
            attributes: attributes
        };
    }
    static addTextAlign(alignment, tco) {
        let charRange = this._parseBlockLevel(tco);
        let chars = tco.chars;
        let replaceChars = [];
        for (let k = charRange.start; k < charRange.end; k++) {
            let char = JSON.parse(JSON.stringify(chars[k]));
            let tag = null;
            if (char.blockTags.length > 1) {
                tag = char.blockTags[char.blockTags.length - 1];
            }
            else {
                tag = char.blockTags[0];
            }
            let pos = tag.attributes.findIndex((style) => style.value.indexOf('text-align-') > -1);
            if (pos > -1) {
                let classes = tag.attributes[pos].value.split(';');
                classes = classes.map((cl) => (cl.indexOf('text-align-') > -1) ? 'text-align-' + alignment : cl);
                tag.attributes[pos].value = classes.join('; ');
                replaceChars.push(char);
            }
            else {
                tag.attributes.push({ name: 'class', value: 'text-align-' + alignment });
                replaceChars.push(char);
            }
        }
        tco.chars = JSON.parse(JSON.stringify(chars.slice(0, charRange.start).concat(replaceChars, chars.slice(charRange.end))));
        return tco;
    }
    static removeTextAlign(tco) {
        let charRange = this._parseBlockLevel(tco);
        let chars = tco.chars;
        let replaceChars = [];
        for (let k = charRange.start; k < charRange.end; k++) {
            let char = JSON.parse(JSON.stringify(chars[k]));
            let tag = null;
            if (char.blockTags.length > 1) {
                tag = char.blockTags[char.blockTags.length - 1];
            }
            else {
                tag = char.blockTags[0];
            }
            let pos = tag.attributes.findIndex((style) => style.value.indexOf('text-align-') > -1);
            if (pos > -1) {
                let classes = tag.attributes[pos].value.split(';');
                classes.splice(classes.findIndex((cl) => (cl.indexOf('text-align-') > -1)), 1);
                if (classes.length > 0) {
                    tag.attributes[pos].value = classes.join('; ');
                    replaceChars.push(char);
                }
                else {
                    tag.attributes.splice(pos, 1);
                    replaceChars.push(char);
                }
            }
            else {
                replaceChars.push(char);
            }
        }
        tco.chars = JSON.parse(JSON.stringify(chars.slice(0, charRange.start).concat(replaceChars, chars.slice(charRange.end))));
        return tco;
    }
    static getTextAlign(tco) {
        let charRange = this._parseBlockLevel(tco);
        let chars = tco.chars;
        let alignment = '';
        for (let k = charRange.start; k < charRange.end; k++) {
            let char = JSON.parse(JSON.stringify(chars[k]));
            let tag = null;
            if (char.blockTags.length > 1) {
                tag = char.blockTags[char.blockTags.length - 1];
            }
            else {
                tag = char.blockTags[0];
            }
            let pos = tag.attributes.findIndex((style) => style.value.indexOf('text-align-') > -1);
            if (pos > -1) {
                let classes = tag.attributes[pos].value.split(';');
                if (k === charRange.start) {
                    alignment = classes.find((cl) => cl.indexOf('text-align-') > -1).substring(11);
                }
                else if (alignment === '') {
                    return null;
                }
                else {
                    if (classes.indexOf('text-align-' + alignment) === -1) {
                        return null;
                    }
                }
            }
        }
        return alignment;
    }
    static addStyleTag(tag, tco) {
        let blockRange = TextCat._parseBlockLevel(tco);
        let chars = tco.chars;
        let styleStart = tco.select.start;
        let styleEnd = tco.select.end;
        let blockStart = blockRange.start;
        let blockEnd = blockRange.end;
        for (let k = styleStart; k < styleEnd; k++) {
            chars[k].styleTags = TextCat._insertStyleTag(tag, chars[k].styleTags);
        }
        tco.chars = chars;
        return tco;
    }
    static removeStyleTag(tag, tco) {
        let chars = tco.chars;
        let styleStart = tco.select.start;
        let styleEnd = tco.select.end;
        for (let k = styleStart; k < styleEnd; k++) {
            chars[k].styleTags = TextCat._cutStyleTag(tag, chars[k].styleTags);
        }
        tco.chars = chars;
        return tco;
    }
    static getSelectedBlockTags(tco) {
        let charRange = TextCat._parseBlockLevel(tco);
        let chars = tco.chars;
        let blockTag = (chars[charRange.start].blockTags.length > 1) ? chars[charRange.start].blockTags[chars[charRange.start].blockTags.length - 2].type : chars[charRange.start].blockTags[0].type;
        if (tco.select.caretPosition === CaretPos.End && tco.select.start > 0) {
            blockTag = (chars[tco.select.start - 1].blockTags.length > 1) ? chars[tco.select.start - 1].blockTags[chars[tco.select.start - 1].blockTags.length - 2].type : chars[tco.select.start - 1].blockTags[0].type;
            return blockTag;
        }
        for (let i = tco.select.start + 1; i < tco.select.end; i++) {
            if (tco.breakpoints.indexOf(i) > -1 || i === charRange.end) {
                let breakpointTag = (chars[i].blockTags.length > 1) ? chars[i].blockTags[chars[i].blockTags.length - 2].type : chars[i].blockTags[0].type;
                if (blockTag !== breakpointTag) {
                    return 'multi';
                }
            }
        }
        return blockTag;
    }
    static getSelectedStyleTags(tco) {
        let chars = tco.chars;
        if (tco.select.start === tco.select.end) {
            return [];
        }
        else {
            let tagArray = [];
            for (let i = tco.select.start; i < tco.select.end; i++) {
                let char = chars[i];
                for (let j = 0; j < char.styleTags.length; j++) {
                    if (i === tco.select.start) {
                        if (char.styleTags[j].type === 'span') {
                            let types = TextCat._processSpan(char.styleTags[j]);
                            for (let k = 0; k < types.length; k++) {
                                tagArray.push({ tag: types[k], count: 1 });
                            }
                        }
                        else if (char.styleTags[j].type === 'a') {
                            let href = char.styleTags[j].attributes.filter((attr) => attr.name === 'href');
                            let target = char.styleTags[j].attributes.filter((attr) => attr.name === 'target');
                            let anchorName = 'a-' + href[0].value + ';' + target[0].value;
                            tagArray.push({ tag: anchorName, count: 1 });
                        }
                        else {
                            tagArray.push({ tag: char.styleTags[j].type, count: 1 });
                        }
                    }
                    else {
                        if (char.styleTags[j].type === 'span') {
                            let types = TextCat._processSpan(char.styleTags[j]);
                            for (let k = 0; k < types.length; k++) {
                                let pos = tagArray.map(e => e.tag).indexOf(types[k]);
                                if (pos > -1) {
                                    tagArray[pos].count++;
                                }
                                else {
                                    tagArray.push({ tag: types[k], count: 1 });
                                }
                            }
                        }
                        else if (char.styleTags[j].type === 'a') {
                            let href = char.styleTags[j].attributes.filter((attr) => attr.name === 'href');
                            let target = char.styleTags[j].attributes.filter((attr) => attr.name === 'target');
                            let anchorName = 'a-' + href[0].value + ';' + target[0].value;
                            let pos = tagArray.map(e => e.tag).indexOf(anchorName);
                            if (pos > -1) {
                                tagArray[pos].count++;
                            }
                            else {
                                tagArray.push({ tag: anchorName, count: 1 });
                            }
                        }
                        else {
                            let pos = tagArray.map(e => e.tag).indexOf(char.styleTags[j].type);
                            if (pos > -1) {
                                tagArray[pos].count++;
                            }
                            else {
                                tagArray.push({ tag: char.styleTags[j].type, count: 1 });
                            }
                        }
                    }
                }
            }
            let returnArray = [];
            for (let l = 0; l < tagArray.length; l++) {
                if (tagArray[l].count === tco.select.end - tco.select.start) {
                    returnArray.push(tagArray[l].tag);
                }
            }
            return returnArray;
        }
    }
    static setSelection(tco) {
        let so = {
            count: 0,
            anchorNode: null,
            anchorOffset: 0,
            focusNode: null,
            focusOffset: 0
        };
        let children = tco.target.childNodes;
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (child.nodeType === Node.ELEMENT_NODE) {
                so = TextCat._findSelectionProps(child, so, tco);
            }
        }
        let docRange = document.createRange();
        docRange.setStart(so.anchorNode, so.anchorOffset);
        docRange.setEnd(so.focusNode, so.focusOffset);
        let selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(docRange);
    }
    static _getEditContainer(element = null, selection) {
        if (selection === null && element === null) {
            return null;
        }
        else if (element !== null) {
            if (TextCat._containerTags.includes(element.localName)) {
                return element;
            }
            else {
                return null;
            }
        }
        else if (selection !== null && selection.anchorNode !== null) {
            let container = selection.anchorNode.parentNode;
            while (!TextCat._containerTags.includes(container.localName)) {
                container = container.parentNode;
                if (container === null) {
                    return null;
                }
            }
            return container;
        }
        else {
            return null;
        }
    }
    static _parseSelection(target, breakpoints, selection) {
        let count = 0;
        let start = null;
        let end = null;
        let caretPosition = null;
        let children = target.childNodes;
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (child.nodeType === Node.ELEMENT_NODE) {
                let countObj = TextCat._selectCount(child, count, start, end, selection);
                count = countObj.count;
                start = countObj.startCount;
                end = countObj.endCount;
            }
        }
        if (start === end) {
            if (breakpoints.indexOf(start) > -1) {
                if (selection.anchorOffset === 0) {
                    caretPosition = CaretPos.Start;
                }
                else {
                    caretPosition = CaretPos.End;
                }
            }
            else if (start === count) {
                caretPosition = CaretPos.End;
            }
            else {
                caretPosition = CaretPos.Middle;
            }
        }
        if (end < start) {
            let tempStart = start;
            start = end;
            end = tempStart;
        }
        return { start: start, end: end, caretPosition: caretPosition };
    }
    static _selectCount(node, count, startCount, endCount, selection) {
        let myCount = count;
        let myStartCount = startCount;
        let myEndCount = endCount;
        let myNode = node;
        let lastTextNode = null;
        for (let k = 0; k < node.childNodes.length; k++) {
            let child = node.childNodes[k];
            if (child.nodeType === Node.TEXT_NODE && TextCat._listTags.indexOf(myNode.localName) === -1) {
                if (child === selection.anchorNode) {
                    myStartCount = myCount + selection.anchorOffset;
                }
                if (child === selection.focusNode) {
                    if (selection.focusOffset > 0) {
                        myEndCount = myCount + selection.focusOffset;
                    }
                    else {
                        myEndCount = myCount;
                    }
                }
                let val = child.nodeValue;
                if (val.indexOf('\n') === -1) {
                    myCount += val.length;
                }
                else {
                    myCount += val.indexOf('\n');
                }
                lastTextNode = child;
            }
            else if (child.nodeType === Node.ELEMENT_NODE) {
                if (child === selection.focusNode) {
                    myEndCount = myCount;
                }
                else if (child === selection.anchorNode) {
                    myStartCount = myCount;
                }
                let countObj = TextCat._selectCount(child, myCount, myStartCount, myEndCount, selection);
                myCount = countObj.count;
                myStartCount = countObj.startCount;
                myEndCount = countObj.endCount;
            }
        }
        return { count: myCount, startCount: myStartCount, endCount: myEndCount };
    }
    static _findSelectionProps(node, so, tco) {
        let myNode = node;
        for (let k = 0; k < node.childNodes.length; k++) {
            let child = node.childNodes[k];
            if (child.nodeType === Node.TEXT_NODE && TextCat._listTags.indexOf(myNode.localName) === -1) {
                let addCount = (child.nodeValue.indexOf('\n') > -1) ? child.nodeValue.indexOf('\n') : child.nodeValue.length;
                if ((so.count + addCount) >= tco.select.start && so.anchorNode === null) {
                    so.anchorNode = child;
                    so.anchorOffset = Math.max(tco.select.start - so.count, 0);
                }
                if ((so.count + addCount) >= tco.select.end && so.focusNode === null) {
                    so.focusNode = child;
                    so.focusOffset = Math.max(tco.select.end - so.count, 0);
                }
                so.count += addCount;
            }
            else if (child.nodeType === Node.ELEMENT_NODE) {
                so = TextCat._findSelectionProps(child, so, tco);
            }
        }
        return so;
    }
    static _markupParse(target) {
        let characterArray = [];
        let breakpointArray = [];
        let children = target.childNodes;
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (child.nodeType === 1) {
                let tag = {
                    type: child.localName,
                    attributes: TextCat._createAttributeArray(child.attributes)
                };
                let childObj = TextCat._childParse(child, [tag], []);
                characterArray = characterArray.concat(childObj.chars);
                breakpointArray = breakpointArray.concat(childObj.breakpoints);
            }
        }
        breakpointArray = breakpointArray.filter(num => num !== 0);
        let returnArray = [0];
        let count = 0;
        for (let j = 0; j < breakpointArray.length; j++) {
            count += breakpointArray[j];
            let bp = count;
            returnArray.push(bp);
        }
        return { chars: characterArray, breakpoints: returnArray.slice(0, -1) };
    }
    static _childParse(target, blockTags, styleTags) {
        let charArray = [];
        let count = 0;
        let nested = [];
        for (let k = 0; k < target.childNodes.length; k++) {
            let child = target.childNodes[k];
            if (child.nodeType === Node.TEXT_NODE && TextCat._listTags.indexOf(blockTags[blockTags.length - 1].type) === -1) {
                let val = child.nodeValue;
                let chars = Array.from(val);
                let newTags = styleTags.slice();
                let iteratelength;
                if (blockTags[blockTags.length - 1].type === 'li') {
                    if (chars.indexOf('\n') > -1) {
                        count += chars.indexOf('\n');
                        iteratelength = chars.indexOf('\n');
                    }
                    else {
                        count += chars.length;
                        iteratelength = chars.length;
                    }
                }
                else {
                    count += chars.length;
                    iteratelength = chars.length;
                }
                if (chars.length > 0) {
                    for (let h = 0; h < iteratelength; h++) {
                        charArray.push({ char: chars[h], blockTags: blockTags, styleTags: newTags });
                    }
                }
            }
            else if (child.nodeType === Node.ELEMENT_NODE) {
                let tag = {
                    type: child.localName,
                    attributes: TextCat._createAttributeArray(child.attributes)
                };
                if (TextCat.blockTags.indexOf(child.localName) === -1) {
                    let newTags = styleTags.slice();
                    newTags.push(tag);
                    let childObj = TextCat._childParse(child, blockTags, newTags);
                    count += childObj.breakpoints[0];
                    nested = nested.concat(childObj.breakpoints.slice(1));
                    charArray = charArray.concat(childObj.chars);
                }
                else {
                    let newTags = blockTags.slice();
                    newTags.push(tag);
                    let childObj = TextCat._childParse(child, newTags, styleTags);
                    nested = nested.concat(childObj.breakpoints);
                    charArray = charArray.concat(childObj.chars);
                }
            }
        }
        let countArray = [];
        countArray.push(count);
        countArray = countArray.concat(nested);
        return { chars: JSON.parse(JSON.stringify(charArray)), breakpoints: countArray };
    }
    static _createAttributeArray(attributes) {
        let attributeArray = [];
        for (const attr of attributes) {
            let value = attr.value;
            if (attr.name.indexOf('data-v') === -1) {
                if (attr.name === 'style') {
                    let hex = this._rgbToHex(attr.value);
                    value = 'color: ' + hex;
                }
                attributeArray.push({ name: attr.name, value: value });
            }
        }
        return attributeArray;
    }
    static _rgbToHex(color) {
        if (color.indexOf('rgb(') === -1) {
            return color.slice(color.indexOf(': ') + 2);
        }
        let colors = color.slice(color.indexOf('(') + 1, color.indexOf(')'));
        let colorArray = colors.split(', ');
        let r = Number(colorArray[0]).toString(16);
        let g = Number(colorArray[1]).toString(16);
        let b = Number(colorArray[2]).toString(16);
        if (r.length == 1) {
            r = '0' + r;
        }
        if (g.length == 1) {
            g = '0' + g;
        }
        if (b.length == 1) {
            b = '0' + b;
        }
        return '#' + r + g + b;
    }
    static _closeTags(tags) {
        let markupString = '';
        for (let i = tags.length - 1; i > -1; i--) {
            markupString += '</' + tags[i].type + '>';
        }
        return markupString;
    }
    static _openTags(tags) {
        let markupString = '';
        for (let m = 0; m < tags.length; m++) {
            markupString += this._createOpeningtag(tags[m]);
        }
        return markupString;
    }
    static _createOpeningtag(tag) {
        let tagString = '<';
        tagString += tag.type;
        if (tag.attributes.length > 0) {
            let attributes = '';
            for (let i = 0; i < tag.attributes.length; i++) {
                let attrib = tag.attributes[i];
                if (attrib.name.includes('data-v-')) {
                    attributes += ' ' + attrib.name;
                }
                else {
                    attributes += ' ' + attrib.name + '="' + attrib.value + '"';
                }
            }
            tagString += ' ' + attributes;
        }
        tagString += '>';
        tagString = tagString.replace(/\s\s/g, ' ');
        return tagString;
    }
    static _compareStyleTags(oldTags, newTags) {
        let oLength = oldTags.length;
        let nLength = newTags.length;
        let lLength = Math.max(oLength, nLength);
        let returnObj = { removeTags: [], addTags: [] };
        let markupString = '';
        for (let i = 0; i < lLength; i++) {
            if (i < oLength && i < nLength) {
                if (oldTags[i].type != newTags[i].type) {
                    let removeTags = oldTags.slice(i);
                    let addTags = newTags.slice(i);
                    returnObj = { removeTags: removeTags, addTags: addTags };
                    break;
                }
            }
            else {
                let removeTags = oldTags.slice(i);
                let addTags = newTags.slice(i);
                returnObj = { removeTags: removeTags, addTags: addTags };
                break;
            }
        }
        for (let m = returnObj.removeTags.length - 1; m > -1; m--) {
            markupString += '</' + returnObj.removeTags[m].type + '>';
        }
        for (let n = 0; n < returnObj.addTags.length; n++) {
            markupString += TextCat._createOpeningtag(returnObj.addTags[n]);
        }
        return markupString;
    }
    static _compareBlockTags(oldTags, newTags) {
        let oLength = oldTags.length;
        let nLength = newTags.length;
        let lLength = Math.max(oLength, nLength);
        let diffObj = { removeTags: [], addTags: [] };
        let markupString = '';
        if (nLength > oLength && nLength > 2) {
            diffObj = { removeTags: [], addTags: newTags.slice(oLength) };
        }
        else {
            for (let i = 0; i < lLength; i++) {
                if (i < oLength && i < nLength) {
                    if (oldTags[i].type != newTags[i].type) {
                        let pos = Math.max(0, i - 1);
                        let removeTags = oldTags.slice(pos);
                        let addTags = newTags.slice(pos);
                        diffObj = { removeTags: removeTags, addTags: addTags };
                        break;
                    }
                }
                else {
                    let pos = Math.max(0, i - 1);
                    let removeTags = oldTags.slice(i);
                    let addTags = newTags.slice(i);
                    diffObj = { removeTags: removeTags, addTags: addTags };
                    break;
                }
            }
            if (diffObj.removeTags.length === 0) {
                diffObj.removeTags.push(oldTags[oldTags.length - 1]);
            }
            if (diffObj.addTags.length === 0) {
                diffObj.addTags.push(newTags[newTags.length - 1]);
            }
        }
        for (let m = diffObj.removeTags.length - 1; m > -1; m--) {
            markupString += '</' + diffObj.removeTags[m].type + '>';
        }
        for (let n = 0; n < diffObj.addTags.length; n++) {
            markupString += TextCat._createOpeningtag(diffObj.addTags[n]);
        }
        return markupString;
    }
    static _parseBlockLevel(tco) {
        let breakpoints = tco.breakpoints;
        let charsStart = null;
        let charsEnd = null;
        let extended = null;
        for (let i = 0; i <= breakpoints.length; i++) {
            if (i === breakpoints.length) {
                if (charsStart === null) {
                    if (tco.select.start < tco.chars.length - 1 && tco.select.caretPosition === CaretPos.End) {
                        charsStart = breakpoints[breakpoints.length - 2];
                    }
                    else {
                        charsStart = breakpoints[breakpoints.length - 1];
                    }
                }
                if (charsEnd === null) {
                    if (tco.select.end < tco.chars.length - 1 && tco.select.caretPosition === CaretPos.End) {
                        charsEnd = breakpoints[breakpoints.length - 1] - 1;
                    }
                    else {
                        charsEnd = tco.chars.length - 1;
                    }
                }
            }
            else {
                if (tco.select.start < breakpoints[i] && charsStart === null) {
                    if (tco.select.caretPosition === CaretPos.End) {
                        charsStart = breakpoints[i - 2];
                    }
                    else {
                        charsStart = breakpoints[i - 1];
                    }
                }
                if (tco.select.end - 1 < breakpoints[i] && charsStart !== null && charsEnd === null) {
                    if (tco.select.caretPosition === CaretPos.End) {
                        charsEnd = breakpoints[i - 1] - 1;
                    }
                    else {
                        charsEnd = breakpoints[i] - 1;
                    }
                }
            }
            if (charsStart !== null && charsEnd !== null && charsEnd < tco.chars.length - 1 && extended === null) {
                if (tco.chars[charsEnd].blockTags.length > 1 && breakpoints[i] > charsEnd) {
                    if (tco.chars[breakpoints[i]].blockTags.length > 1) {
                        if (tco.chars[breakpoints[i]].blockTags[tco.chars[breakpoints[i]].blockTags.length - 2].type === tco.chars[charsEnd].blockTags[tco.chars[charsEnd].blockTags.length - 2].type) {
                            if (i < breakpoints.length - 1) {
                                extended = breakpoints[i + 1];
                            }
                            else {
                                extended = tco.chars.length - 1;
                            }
                        }
                    }
                }
            }
        }
        return { start: charsStart, end: charsEnd, extended: extended };
    }
    static _replaceExtendedBlockTags(lastTags, currentTags) {
        if (lastTags.length < 2) {
            if (currentTags.length > 2) {
                return currentTags.slice(0, 2);
            }
            else {
                return currentTags;
            }
        }
        else {
            let sameCount = 0;
            let tagL = Math.min(lastTags.length, currentTags.length);
            for (let i = 0; i < tagL; i++) {
                if (lastTags[i].type === currentTags[i].type) {
                    sameCount++;
                }
                else {
                    break;
                }
            }
            if (currentTags.length > sameCount && sameCount > 1) {
                return currentTags.slice(0, sameCount);
            }
            else {
                return currentTags;
            }
        }
    }
    static _replaceTopBlockTag(newTag, tags, old) {
        let blocks = TextCat._blockTags.slice(0, TextCat._blockTags.indexOf('li'));
        let cloneTag = JSON.parse(JSON.stringify(newTag));
        if (old === null) {
            if (tags.length > 2) {
                if (TextCat._listTags.indexOf(newTag.type) > -1) {
                    tags.splice(-2, 1, cloneTag);
                }
                else {
                    tags = [cloneTag];
                }
            }
            else {
                if (TextCat._listTags.indexOf(newTag.type) > -1) {
                    let li = TextCat.createTag('li');
                    tags = [cloneTag, li];
                }
                else {
                    tags = [cloneTag];
                }
            }
        }
        else {
            if (TextCat._listTags.indexOf(newTag.type) > -1) {
                if (old.length > 1) {
                    let sameCount = 0;
                    let tagL = Math.min(old.length, tags.length);
                    for (let i = 0; i < tagL; i++) {
                        if (old[i].type === tags[i].type) {
                            sameCount++;
                        }
                        else {
                            break;
                        }
                    }
                    let newTags;
                    if (sameCount >= 2) {
                        newTags = tags.slice(0, tags.length - 2);
                    }
                    else {
                        newTags = [];
                    }
                    let li = TextCat.createTag('li');
                    newTags.push(cloneTag);
                    newTags.push(li);
                    tags = newTags;
                }
                else {
                    let li = TextCat.createTag('li');
                    tags = [cloneTag, li];
                }
            }
            else {
                tags = [cloneTag];
            }
        }
        return tags;
    }
    static _insertStyleTag(newTag, styleTags) {
        if (newTag.type === 'span') {
            if (styleTags.length > 0 && styleTags[0].type === 'span') {
                let index = styleTags[0].attributes.findIndex(item => item.name === newTag.attributes[0].name);
                if (index > -1) {
                    styleTags[0].attributes[index] = newTag.attributes[0];
                }
                else {
                    styleTags[0].attributes.push(newTag.attributes[0]);
                }
            }
            else {
                styleTags.splice(0, 0, newTag);
            }
        }
        else {
            let subIndex = styleTags.findIndex(item => item.type === 'sub');
            let supIndex = styleTags.findIndex(item => item.type === 'sup');
            let aIndex = styleTags.findIndex(item => item.type === 'a');
            let newTagIndex = styleTags.findIndex(item => item.type === newTag.type);
            if (newTagIndex === -1) {
                if (newTag.type === 'sup' && subIndex > -1) {
                    styleTags[subIndex].type = 'sup';
                }
                else if (newTag.type === 'sub' && supIndex > -1) {
                    styleTags[supIndex].type = 'sub';
                }
                else {
                    styleTags.splice(styleTags.length - 1, 0, newTag);
                }
            }
            else if (newTag.type === 'a' && aIndex > -1) {
                styleTags[aIndex].attributes = newTag.attributes;
            }
        }
        return styleTags;
    }
    static _cutStyleTag(newTag, styleTags) {
        let index = styleTags.findIndex(item => item.type === newTag.type);
        if (newTag.type === 'span') {
            if (styleTags[0].type === 'span') {
                if (index > -1) {
                    for (let i = 0; i < newTag.attributes.length; i++) {
                        let attr = newTag.attributes[i];
                        let removeIndex = styleTags[0].attributes.findIndex(item => item.name === attr.name);
                        if (removeIndex > -1) {
                            styleTags[0].attributes.splice(removeIndex, 1);
                        }
                    }
                    if (styleTags[0].attributes.length === 0) {
                        styleTags.splice(0, 1);
                    }
                }
            }
            else {
                styleTags.splice(index, 1);
            }
        }
        else {
            styleTags.splice(index, 1);
        }
        return styleTags;
    }
    static _processSpan(tag) {
        let type = [];
        for (let i = 0; i < tag.attributes.length; i++) {
            let attr = tag.attributes[i].name;
            if (attr === 'style') {
                if (tag.attributes[i].value.indexOf('color') > -1) {
                    const regex = /color:\s*(?<color>[^;]*)(;*)/;
                    let valArray = tag.attributes[i].value.match(regex);
                    type.push('color-' + valArray.groups.color);
                }
            }
            else if (attr === 'class') {
                if (tag.attributes[i].value.indexOf('font-') > -1)
                    type.push(tag.attributes[i].value);
            }
            else if (attr === 'inline') {
                type.push('inline');
            }
        }
        return type;
    }
}
