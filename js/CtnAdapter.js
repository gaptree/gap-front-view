import {createElem} from './elem/createElem.js';

export class CtnAdapter {
    static get tag() { return this._tag || null; }
    static set tag(tagName) { this._tag = tagName; }

    get ctn() {
        this._ctn = this._ctn || createElem(this.constructor.tag);
        return this._ctn;
    }

    appendTo(elem) {
        if (!(elem instanceof HTMLElement)) {
            throw new Error('Can only append to HTMLElement');
        }
        elem.appendChild(this.ctn);
    }
}
