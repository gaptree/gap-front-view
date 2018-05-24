import {ObserverBase} from './ObserverBase';

export class ValObserver extends ObserverBase {
    update(inVal) {
        this.elem.setVal(this.parseVal(inVal));
    }
}
