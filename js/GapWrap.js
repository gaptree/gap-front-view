//import {deepAssign} from './lib/deepAssign';

export class GapWrap {
    constructor() {
        this.binders = [];
        this.triggers = [];
        this.val;
    }

    isEqual(inVal) {
        if (inVal instanceof Object) {
            return false;
        }

        return (this.val === inVal);
    }

    setVal(inVal) {
        this.val = inVal;
    }

    getVal() {
        return this.val;
    }

    changed() {
        this.binders.forEach(binder => binder.update(this.getVal()));
        this.triggers.forEach(trigger => trigger(this.getVal()));
    }

    addBinder(binder) {
        this.binders.push(binder);
    }

    addTrigger(trigger) {
        this.triggers.push(trigger);
    }
}
