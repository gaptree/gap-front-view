import {ObserverBase} from './ObserverBase';

export class ClassObserver extends ObserverBase {
    update(inVal) {
        this.elem.className = this.parseVal(inVal);
    }
}
