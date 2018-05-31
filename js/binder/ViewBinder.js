import {parseVal} from '../lib/parseVal';
import {getView, getFun} from '../lib/holder';

export class ViewBinder {
    constructor(elem) {
        this.view = getView(elem.getAttribute('view'));

        const toRemoves = [];
        for (const attr of elem.attributes) {
            const attrName = attr.name;
            const attrVal = attr.value;

            if (attrName === 'ref') {
                getFun(attrVal)(this.view);
                toRemoves.push(attrName);
                continue;
            }

            const sepIndex = attrName.indexOf('-');

            if (sepIndex <= 0) {
                continue;
            }

            const pre = attrName.substr(0, sepIndex);
            const type = attrName.substr(sepIndex + 1);

            if (pre === 'on') {
                this.view.on(type, () => getFun(attrVal)(this.view));
                toRemoves.push(attrName);
            }
        }

        toRemoves.forEach(attrName => elem.removeAttribute(attrName));
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
