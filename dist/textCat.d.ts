export declare enum CaretPos {
    Start = "START",
    End = "END",
    Middle = "MIDDLE"
}
export declare enum TextAlign {
    Start = "start",
    End = "end",
    Left = "left",
    Right = "right",
    Center = "center",
    Justify = "justify",
    JustifyAll = "justify-all"
}
export type Breakpoints = number[];
export interface Attribute {
    name: string;
    value: string;
}
export interface Tag {
    type: string;
    attributes: Attribute[];
}
export interface Character {
    char: string;
    blockTags: Tag[];
    styleTags: Tag[];
}
export interface Select {
    start: number | null;
    end: number | null;
    caretPosition: CaretPos | null;
}
export interface TextCatObject {
    breakpoints: Breakpoints;
    chars: Character[];
    select: Select;
    target: Element;
}
export interface CountObj {
    count: number;
    startCount: number | null;
    endCount: number | null;
}
export interface ParseOutput {
    breakpoints: Breakpoints;
    chars: Character[];
}
export interface BlockTagPos {
    start: number | null;
    end: number | null;
}
export interface SelectionObject {
    count: number;
    anchorNode: Node | null;
    anchorOffset: number;
    focusNode: Node | null;
    focusOffset: number;
}
export declare class TextCat {
    private static _containerTags;
    static get containerTags(): string[];
    static set containerTags(tags: string[]);
    private static _blockTags;
    static get blockTags(): string[];
    static set blockTags(tags: string[]);
    private constructor();
    static create(element?: Element | null): TextCatObject | null;
    static html(tco: TextCatObject): string;
    static insertText(newText: string, tco: TextCatObject): TextCatObject;
    static changeBlockTag(newTag: Tag, tco: TextCatObject): TextCatObject;
    static nestIn(tco: TextCatObject): TextCatObject;
    static nestOut(tco: TextCatObject): TextCatObject;
    static createTag(tag: string, attributes?: Attribute[]): Tag;
    static addTextAlign(alignment: TextAlign, tco: TextCatObject): TextCatObject;
    static removeTextAlign(tco: TextCatObject): TextCatObject;
    static getTextAlign(tco: TextCatObject): TextAlign | null;
    static addStyleTag(tag: Tag, tco: TextCatObject): TextCatObject;
    static removeStyleTag(tag: Tag, tco: TextCatObject): TextCatObject;
    static getSelectedBlockTags(tco: TextCatObject): string;
    static getSelectedStyleTags(tco: TextCatObject): string[];
    static setSelection(tco: TextCatObject): void;
    private static _preClean;
    private static _getEditContainer;
    private static _parseSelection;
    private static _selectCount;
    private static _findSelectionProps;
    private static _markupParse;
    private static _childParse;
    private static _createAttributeArray;
    private static _rgbToHex;
    private static _closeTags;
    private static _openTags;
    private static _createOpeningtag;
    private static _compareStyleTags;
    private static _compareBlockTags;
    private static _parseBlockLevel;
    private static _replaceTopBlockTag;
    private static _insertStyleTag;
    private static _cutStyleTag;
    private static _processSpan;
}
