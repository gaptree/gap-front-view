import {ObserverBase} from './ObserverBase';

export class PropObserver extends ObserverBase {
    constructor(elem, propName) {
        super(elem);
        this.propName = propName;
    }

    update(inVal) {
        this.elem[this.propName] = this.parseVal(inVal);
    }
}
