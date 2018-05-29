import {parseVal} from '../lib/parseVal';

export class TextNodeBinder {
    constructor(elem) {
        this.elem = elem;
    }

    update(val) {
        const textNode = document.createTextNode(parseVal(val));
        this.elem.replace(textNode);
        this.elem = textNode;
    }
}
