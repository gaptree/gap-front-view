import {getFun} from '../lib/holder';
//import {compile} from '../lib/compile';
import {GapProxy} from '../GapProxy';
import {BinderBase} from './BinderBase';

export class ArrBinder extends BinderBase {
    constructor(elem) {
        super();
        this.elem = elem;
        this.bind = this.elem.getAttribute('arr') || this.elem.getAttribute('array');
        this.type = this.elem.getAttribute('type');
        this.itemAs = this.elem.getAttribute('item-as');

        this.tplBuilderHandle = getFun(this.elem.innerHTML.trim());
        this.itemFilterHandle = getFun(this.elem.getAttribute('item-filter'));
        this.itemKeyHandle = getFun(this.elem.getAttribute('item-key'));

        ['arr', 'array', 'type', 'filter', 'item-key', 'item-filter', 'item-as']
            .forEach(attrName => this.elem.removeAttribute(attrName));
        this.elem.innerHTML = '';
    }

    tplBuilder(item) {
        if (!this.tplBuilderHandle) {
            throw new Error('cannot find tpl builder handle');
        }
        return this.tplBuilderHandle(item);
    }

    itemFilter(item) {
        if (this.itemFilterHandle) {
            return this.itemFilterHandle(item);
        }
        return true;
    }

    itemKey(item) {
        if (!this.itemKeyHandle) {
            throw new Error('cannot find item key  handle');
        }
        return this.itemKeyHandle(item);
    }

    buildItem(item) {
        if (!this.itemFilter(item)) {
            return;
        }

        const key = this.itemKey(item);
        const itemProxy = this.getItemProxy(key);
        if (!itemProxy.tpl) {
            const tpl = this.tplBuilder(item);
            this.elem.appendChild(tpl.frag);
            itemProxy.compile(tpl);
            itemProxy.tpl = tpl;
            //itemProxy.changed();
        }

        itemProxy.updateAll({
            [this.itemAs]: item
        });
    }

    removeElem(item) {
        const key = this.itemKey(item);
        const itemProxy = this.getItemProxy(key);
        itemProxy.tpl && itemProxy.tpl.remove();
    }

    clearElemChildren() {
        this.elem.innerHTML = '';
        this.itemProxies = {};
    }

    update(inVal) {
        const val = this.parseVal(inVal);
        if (val === undefined) {
            return;
        }

        this.inject(val);
        this.clearElemChildren();
        val.forEach(item => {
            this.buildItem(item);
        });
    }

    inject(arr) {
        arr.push = (...items) => {
            Array.prototype.push.call(arr, ...items);
            items.forEach(item => this.buildItem(item));
        };

        arr.add = arr.push;
        arr.removeElem = (item) => {
            this.removeElem(item);
        };

        arr.pop = () => {
            const item = Array.prototype.pop.call(arr);
            this.removeElem(item);
            return item;
        };

        arr.filter = (handle) => {
            return Array.prototype.filter.call(arr, (item, index, array) => {
                if (handle(item, index, array)) {
                    return true;
                }

                this.removeElem(item);
                return false;
            });
        };
    }

    getItemProxy(key) {
        this.itemProxies = this.itemProxies || {};
        if (this.itemProxies[key]) {
            return this.itemProxies[key];
        }
        this.itemProxies[key] = new GapProxy();
        return this.itemProxies[key];
    }
}
