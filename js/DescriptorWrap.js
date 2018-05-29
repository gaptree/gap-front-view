import {ElemPropBinder} from './binder/ElemPropBinder';

export class DescriptorWrap {
    constructor() {
        this.elemPropBinders = [];
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
                this.elemPropBinders.forEach(binder => binder.update(val));
            }
        };

        return this._descriptor;
    }

    bindElemProp(elem, prop) {
        this.elemPropBinders.push(new ElemPropBinder(elem, prop));
    }

    setVal(val) {
        this.val = val;
    }
}
