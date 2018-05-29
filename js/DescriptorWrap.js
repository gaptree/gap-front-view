import {ElemPropBinder} from './binder/ElemPropBinder';
import {TextNodeBinder} from './binder/TextNodeBinder';
import {ViewBinder} from './binder/ViewBinder';
import {deepAssign} from './lib/deepAssign';
import {GapProxy} from './GapProxy';

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
                if (this.val && this.val instanceof GapProxy) {
                    // todo
                    // this.val: {a: 1, b: 2}
                    // val: {a: 11}
                    // this.val should be {a: 11, b: null} ?
                    deepAssign(this.val, val);
                } else {
                    this.val = val;
                }
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

        if (elem.tagName === 'GAP-VIEW') {
            const viewBinder = new ViewBinder(elem);
            this.binders.push(viewBinder);
            this.val = viewBinder.getProxy();
            return;
        }
    }

    setVal(val) {
        this.val = val;
    }
}
