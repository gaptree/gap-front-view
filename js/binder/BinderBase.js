export class BinderBase {
    onFilter(handle) {
        this.handleFilter = handle;
        return this;
    }

    parseVal(inVal) {
        const val = this._toVal(inVal);
        if (this.handleFilter) {
            return this.handleFilter(val);
        }

        return val;
    }

    _toVal(inVal) {
        if (typeof inVal === 'function') {
            return inVal();
        }
        return inVal;
    }
}
