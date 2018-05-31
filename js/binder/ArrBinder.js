import {getFun} from '../lib/holder';
import {compile} from '../lib/compile';
import {GapProxy} from '../GapProxy';
import {BinderBase} from './BinderBase';

export class ArrBinder extends BinderBase {
    constructor(elem, handleFilter) {
        super();
        //this.isCompiled = false;
        this.elem = elem;
        this.handleFilter = handleFilter;
        this.bind = this.elem.getAttribute('arr') || this.elem.getAttribute('array');
        this.type = this.elem.getAttribute('type');
        this.itemAs = this.elem.getAttribute('item-as');

        this.tplBuilderHandle = getFun(this.elem.innerHTML.trim());
        this.itemFilterHandle = getFun(this.elem.getAttribute('item-filter'));
        this.itemKeyHandle = getFun(this.elem.getAttribute('item-key'));

        ['arr', 'array', 'type', 'filter', 'item-key', 'item-filter', 'item-as']
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
        return item;
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
        const itemProxy = this.getProxy().getProxy(key);
        if (!itemProxy.tpl) {
            const tpl = this.tplBuilder();
            this.elem.appendChild(tpl.frag);
            compile(itemProxy, tpl);
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
        const val = this.parseVal(inVal);
        val.forEach(item => {
            if (item.descriptorWraps) {
                return;
            }
            this.buildItem(item);
        });

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
