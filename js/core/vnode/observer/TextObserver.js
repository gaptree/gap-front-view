import {ObserverBase} from './ObserverBase';

export class TextObserver extends ObserverBase {
    update(inVal) {
        const text = document.createTextNode(this.parseVal(inVal));
        this.elem.replace(text);
        this.elem = text;
    }
}
