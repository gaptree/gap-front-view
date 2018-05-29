import {ElemPropBinder} from './binder/ElemPropBinder';
import {TextNodeBinder} from './binder/TextNodeBinder';

export class DescriptorWrap {
    constructor() {
        this.binders = [];
        this.val;
    }

    getDescriptor() {
        if (this._descriptor) {
            return this._descriptor;
        }

        this._descriptor = {
            get: () => {
                return this.val;
            },
            set: (val) => {
                this.val = val;
                this.binders.forEach(binder => binder.update(val));
            }
        };

        return this._descriptor;
    }

    bindElemProp(elem, prop) {
        this.binders.push(new ElemPropBinder(elem, prop));
    }

    bindElem(elem) {
        if (elem.tagName === 'GAP-TEXT') {
            this.binders.push(new TextNodeBinder(elem));
            return;
        }
    }

    setVal(val) {
        this.val = val;
    }
}
