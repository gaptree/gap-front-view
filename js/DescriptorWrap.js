//import {deepAssign} from './lib/deepAssign';
//import {GapProxy} from './GapProxy';
import {ElemPropBinder} from './binder/ElemPropBinder';
import {TextNodeBinder} from './binder/TextNodeBinder';
import {ViewBinder} from './binder/ViewBinder';
import {ArrBinder} from './binder/ArrBinder';

export class DescriptorWrap {
    constructor(parentProxy) {
        this.binders = [];
        this.triggers = [];
        this.val;
        this.parentProxy = parentProxy;
    }

    getDescriptor() {
        if (this._descriptor) {
            return this._descriptor;
        }

        this._descriptor = {
            get: () => {
                return this.val;
            },
            set: (inVal) => {
                if (this.val && this.val.update) {
                    // todo
                    // this.val: {a: 1, b: 2}
                    // val: {a: 11}
                    // this.val should be {a: 11, b: null} ?
                    this.val.update(inVal);
                } else {
                    this.val = inVal;
                }

                this.changed(inVal);
            }
        };

        return this._descriptor;
    }

    addTrigger(trigger) {
        this.triggers.push(trigger);
    }

    bindElemProp(elem, prop, filter) {
        this.binders.push((new ElemPropBinder(elem, prop).onFilter(filter)));
    }

    bindGapView(elem, filter) {
        const viewBinder = new ViewBinder(elem);
        viewBinder.onFilter(filter);
        this.binders.push(viewBinder);
        this.linkProxy(viewBinder.getProxy());
    }

    bindGapText(elem, filter) {
        this.binders.push((new TextNodeBinder(elem)).onFilter(filter));
    }

    bindArr(elem, filter) {
        const arrBinder = new ArrBinder(elem);
        arrBinder.onFilter(filter);
        this.binders.push(arrBinder);
        this.linkProxy(arrBinder.getProxy());
    }

    setVal(val) {
        this.val = val;
    }

    changed(val) {
        this.binders.forEach(binder => binder.update(val));
        this.triggers.forEach(trigger => trigger(val));
        this.parentProxy.changed();
    }

    linkProxy(proxy) {
        this.val = proxy;
        // todo
        proxy.onChanged(() => this.changed(proxy));
    }
}
