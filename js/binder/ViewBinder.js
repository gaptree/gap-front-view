import {getView, getFun} from '../lib/holder';
import {BinderBase} from './BinderBase';

export class ViewBinder extends BinderBase {
    constructor(elem) {
        super();

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
                this.view.on(type, getFun(attrVal));
                toRemoves.push(attrName);
            }
        }

        toRemoves.forEach(attrName => elem.removeAttribute(attrName));
        elem.replace(this.view.frag);
    }

    update(inVal) {
        const val = this.parseVal(inVal);
        if (val) {
            this.view.update(val);
        }
    }

    updateProp(prop, inVal) {
        const val = this.parseVal(inVal);
        if (val) {
            this.view.data[prop] = val;
        }
    }
}
