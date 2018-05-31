import {BinderBase} from './BinderBase';

export class TextNodeBinder extends BinderBase {
    constructor(elem) {
        super();
        this.elem = elem;
    }

    update(val) {
        const textNode = document.createTextNode(this.parseVal(val));
        this.elem.replace(textNode);
        this.elem = textNode;
    }
}
