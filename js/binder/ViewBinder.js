import {BinderBase} from './BinderBase';
import {viewHolder} from '../holder/viewHolder';
import {funHolder} from '../holder/funHolder';

export class ViewBinder extends BinderBase {
    constructor(elem) {
        super(elem);

        this.view = viewHolder.get(elem.getAttribute('view'));

        for (const attr of elem.attributes) {
            const attrName = attr.name;
            const attrVal = attr.value;

            if (attrName === 'ref') {
                funHolder.get(attrVal)(this.view);
                continue;
            }

            const sepIndex = attrName.indexOf('-');
            if (sepIndex <= 0) {
                continue;
            }
            const pre = attrName.substr(0, sepIndex);
            const type = attrName.substr(sepIndex + 1);

            if (pre === 'on') {
                this.view.on(type, funHolder.get(attrVal));
            }
        }

        elem.replace(this.view.ctn);
    }

    update(inVal) {
        const val = this.parseVal(inVal);
        if (val) {
            this.view.update(val);
        }
    }

    updateProp(query, inVal) {
        const val = this.parseVal(inVal);
        if (!val) {
            return;
        }

        const lastDotPos = query.lastIndexOf('.');

        const propName = lastDotPos < 0 ? query : query.substr(lastDotPos + 1);
        const objQuery = lastDotPos < 0 ? '' : query.substr(0, lastDotPos);

        const obj = this._getObj(objQuery);
        obj[propName] = val;
    }

    _getObj(inQuery) {
        const query = inQuery + '';
        if (query === '') {
            return this.view.data;
        }

        const lastDotPos = query.lastIndexOf('.');

        const propName = lastDotPos < 0 ? query : query.substr(lastDotPos + 1);
        const objQuery = lastDotPos < 0 ? '' : query.substr(0, lastDotPos);

        const obj = this._getObj(objQuery);
        if (obj instanceof Object && obj[propName] instanceof Object) {
            return obj[propName];
        }

        throw new Error(`ViewBinder._getObj(${inQuery}) failed`);
    }
}
