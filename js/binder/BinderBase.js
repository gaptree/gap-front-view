import {parseVal} from '../lib/parseVal';

export class BinderBase {
    onFilter(handle) {
        this.handleFilter = handle;
        return this;
    }

    parseVal(inVal) {
        const tmpVal = parseVal(inVal);
        if (this.handleFilter) {
            return this.handleFilter(tmpVal);
        }

        return tmpVal;
    }
}
