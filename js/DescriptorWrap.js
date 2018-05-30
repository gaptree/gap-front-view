//import {deepAssign} from './lib/deepAssign';
//import {GapProxy} from './GapProxy';
import {ElemPropBinder} from './binder/ElemPropBinder';
import {TextNodeBinder} from './binder/TextNodeBinder';
import {ViewBinder} from './binder/ViewBinder';
import {ElemBinder} from './binder/ElemBinder';

export class DescriptorWrap {
    constructor(proxy) {
        this.binders = [];
        this.triggers = [];
        this.val;
        this.proxy = proxy;
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
            this.linkProxy(viewBinder.getProxy());
            return;
        }

        const elemBinder = new ElemBinder(elem);
        this.binders.push(elemBinder);
        this.linkProxy(elemBinder.getProxy());
        //this.val = elemBinder.getProxy();
    }

    setVal(val) {
        this.val = val;
    }

    changed(val) {
        this.binders.forEach(binder => binder.update(val));
        this.triggers.forEach(trigger => trigger(val));
        this.proxy.changed();
    }

    linkProxy(proxy) {
        this.val = proxy;
        // todo
        //proxy.onChanged(() => this.changed(proxy));
    }
}
