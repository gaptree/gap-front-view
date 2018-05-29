import {parseVal} from '../lib/parseVal';
import {getView} from '../lib/holder';

export class ViewBinder {
    constructor(elem) {
        this.view = getView(elem.getAttribute('view'));
        elem.replace(this.view.frag);
    }

    getProxy() {
        return this.view.data;
    }

    update(inVal) {
        const val = parseVal(inVal);
        this.view.update(val);
    }
}
