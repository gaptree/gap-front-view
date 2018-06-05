export class GapWrap {
    constructor() {
        //this.binders = [];
        this.binders = {};
        this.val;
    }

    clearScope(scope) {
        this.binders[scope] = [];
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
        Object.keys(this.binders).forEach(scope => {
            this.changedByScope(scope);
        });
    }

    changedByScope(scope) {
        const subBinders = this.binders[scope];
        subBinders.forEach(binder => binder.update(this.getVal()));
    }

    addBinder(scope, binder) {
        this.binders[scope].push(binder);
    }
}
