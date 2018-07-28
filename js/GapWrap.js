export class GapWrap {
    constructor(query) {
        this.query = query;
        this.binders = {};
        this.val;
    }

    getQuery() {
        return this.query;
    }

    isEqual(inVal) {
        if (inVal instanceof Object) {
            return false;
        }

        return (this.val === inVal);
    }

    /*
    setVal(inVal) {
        console.log('GapWrap.setVal', this.query, inVal);
        this.val = inVal;
    }
    */

    getVal() {
        return this.val;
    }

    addBinder(binder, scope = 'default') {
        if (!this.binders[scope]) {
            this.binders[scope] = [];
        }
        this.binders[scope].push(binder);
    }

    commitChanging(val) {
        this.val = val;
        Object.keys(this.binders).forEach(scope => {
            this.binders[scope].forEach(binder => binder.update(val));
        });
    }
}
