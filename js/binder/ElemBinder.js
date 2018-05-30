import {getFun} from '../lib/holder';
import {parseVal} from '../lib/parseVal';
import {compile} from '../lib/compile';
import {GapProxy} from '../GapProxy';

export class ElemBinder {
    constructor(elem) {
        this.isCompiled = false;
        this.elem = elem;
        this.bind = this.elem.getAttribute('bind');
        this.type = this.elem.getAttribute('type');
        this.itemAs = this.elem.getAttribute('item-as');
        this.tplBilder = getFun(this.elem.innerHTML.trim());
        this.itemFilter = getFun(this.elem.getAttribute('item-filter'));
        this.itemKey = getFun(this.elem.getAttribute('item-key'));

        ['bind', 'type', 'filter', 'item-key', 'item-filter', 'item-as']
            .forEach(attrName => this.elem.removeAttribute(attrName));
        this.elem.innerHTML = '';

        /*
         * todo
        const tpl = this.getTpl();
        const proxy = this.getProxy();
        if (!this.isCompiled) {
            compile(proxy, tpl);
            this.isCompiled = true;
            this.elem.appendChild(tpl.frag);
        }
        proxy.update({
            [this.bind]: val
        });
        */
    }

    buildItem(item) {
        if (!this.itemFilter(item)) {
            return;
        }

        const key = this.itemKey(item);
        const itemProxy = this.getProxy().getProxy(key);
        if (!itemProxy.tpl) {
            const tpl = this.tplBilder();
            compile(itemProxy, tpl);
            this.elem.appendChild(tpl.frag);
            itemProxy.tpl = tpl;
        }
        itemProxy.update({
            [this.itemAs]: item
        });
    }

    removeItem(item) {
        const key = this.itemKey(item);
        const itemProxy = this.getProxy().getProxy(key);
        itemProxy.tpl && itemProxy.tpl.remove();
    }

    update(inVal) {
        const val = parseVal(inVal);
        val.forEach(item => this.buildItem(item));

        /*
        if (!this.filter(val)) {
            this.elem.hide();
            return;
        }
        this.elem.show();
        */

        /*
         * todo
        const tpl = this.getTpl();
        const proxy = this.getProxy();
        if (!this.isCompiled) {
            compile(proxy, tpl);
            this.isCompiled = true;
            this.elem.appendChild(tpl.frag);
        }
        proxy.update({
            [this.bind]: val
        });
        */
    }

    getProxy() {
        if (this._proxy) {
            return this._proxy;
        }
        this._proxy = new GapProxy();
        this._proxy.add = (item) => this.buildItem(item);
        this._proxy.remove = (item) => this.removeItem(item);
        this._proxy.forEach = (handle) => {
            Object.keys(this._proxy.descriptorWraps)
                .forEach(key => handle(this._proxy[key][this.itemAs]));
        };
        this._proxy.filter = (handle) => {
            this._proxy.forEach(item => {
                if (!handle(item)) {
                    this.removeItem(item);
                }
            });
        };
        return this._proxy;
    }
}
