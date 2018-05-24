import {ObserverBase} from './ObserverBase';

export class AttrObserver extends ObserverBase {
    constructor(elem, attrName) {
        super(elem);
        this.attrName = attrName;
    }

    update(inVal) {
        this.elem.setAttribute(
            this.attrName,
            this.parseVal(inVal)
        );
    }
}
