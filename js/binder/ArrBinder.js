import {getFun} from '../lib/holder';
import {GapProxy} from '../GapProxy';
import {BinderBase} from './BinderBase';

let arrBinderIndex = 0;

export class ArrBinder extends BinderBase {
    constructor(elem) {
        super();

        this.arrBinderId = 'arr-binder-' + arrBinderIndex++;
        this.elem = elem;
        this.bind = this.elem.getAttribute('arr') || this.elem.getAttribute('array');
        this.type = this.elem.getAttribute('type');
        this.itemAs = this.elem.getAttribute('item-as');

        this.tplBuilderHandle = getFun(this.elem.innerHTML.trim());
        this.itemFilterHandle = getFun(this.elem.getAttribute('item-filter'));
        this.itemKeyHandle = getFun(this.elem.getAttribute('item-key'));

        ['arr', 'array', 'type', 'filter', 'item-key', 'item-filter', 'item-as']
            .forEach(attrName => this.elem.removeAttribute(attrName));

        this.refresh();
    }

    update(inVal) {
        this.items = this.parseVal(inVal);
        if (this.items === undefined) {
            return;
        }


        this.refresh();
        this.items.forEach(item => this.pushItem(item));

        this.injectItems();
    }

    refresh() {
        this.elem.innerHTML = '';
        this.tpls = {};
        this.proxies = {};
        this.keyMap = {};

        this.currentIndex = 0;
        this.offset = 0;
    }

    injectItems() {
        const defineProp = (obj, prop, handle) => {
            Object.defineProperty(obj, prop, {
                enumerable: false,
                configurable: false,
                value: handle
            });
        };

        defineProp(this.items, 'push', (...argItems) => {
            argItems.forEach(argItem => {
                Array.prototype.push.call(this.items, argItem);
                this.pushItem(argItem);
            });
        });

        defineProp(this.items, 'unshift', (...argItems) => {
            argItems.forEach(argItem => {
                Array.prototype.unshift.call(this.items, argItem);
                this.unshiftItem(argItem);
            });
        });

        defineProp(this.items, 'pop', () => {
            const item = Array.prototype.pop.call(this.items);
            this.popItem(item);
        });

        defineProp(this.items, 'shift', () => {
            const item = Array.prototype.shift.call(this.items);
            this.shiftItem(item);
        });

        defineProp(this.items, 'delete', item => {
            const key = this.deleteItem(item);
            const index = this.getIndex(key);
            this.items[index] = undefined;
            this.deleteKey(key);
        });

        defineProp(this.items, 'update', item => {
            this.updateItem(item);
        });

        // ----

        defineProp(this.items, 'filter', (handle) => {
            return Array.prototype.filter.call(this.items, (item, index, array) => {
                if (!item) {
                    return false;
                }

                if (handle(item, index, array)) {
                    return true;
                }

                const key = this.deleteItem(item);
                this.deleteKey(key);
                return false;
            });
        });

        defineProp(this.items, 'clear', () => {
            this.items.splice(0, this.items.length);
            this.refresh();
        });
    }

    // item
    createItem(item, keyHandle, elemHandle) {
        const key = this.itemKey(item);
        const existed = this.hasKey(key);
        keyHandle(key);

        if (this.itemFilter(item)) {
            if (existed) {
                this.updateElem(key, item);
                return;
            }
            elemHandle(key, item);
        }
    }

    pushItem(item) {
        this.createItem(
            item,
            key => this.pushKey(key),
            (key, item) => this.pushElem(key, item)
        );
    }

    unshiftItem(item) {
        this.createItem(
            item,
            key => this.unshiftKey(key),
            (key, item) => this.unshiftElem(key, item)
        );
    }

    updateItem(item) {
        const key = this.itemKey(item);
        const index = this.getIndex(key);
        this.updateElem(key, item);
        Object.assign(this.items[index], item);
    }

    deleteItem(item) {
        const key = this.itemKey(item);
        if (!this.hasKey(key)) {
            return false;
        }

        this.deleteElem(key);

        delete(this.proxies[key]);
        delete(this.tpls[key]);

        return key;
    }

    popItem(item) {
        const key = this.deleteItem(item);
        this.popKey(key);
    }

    shiftItem(item) {
        const key = this.deleteItem(item);
        this.shiftKey(key);
    }

    // elem
    createElem(key, item, handle) {
        const proxy = new GapProxy({[this.itemAs]: item});
        //const tplItem = proxy.data[this.itemAs];
        const tpl = this.tplBuilder();

        handle(tpl);

        proxy.compile(tpl, this.arrBinderId + '-' + key);
        proxy.changed();
        this.setProxy(key, proxy);
        this.setTpl(key, tpl);
    }

    updateElem(key, item) {
        const proxy = this.getProxy(key);
        proxy.updateAll({[this.itemAs]: item});
    }

    deleteElem(key) {
        const tpl = this.getTpl(key);
        if (tpl) {
            tpl.remove();
        }
    }

    pushElem(key, item) {
        this.createElem(key, item, tpl => this.elem.appendChild(tpl.nodes[0]));
    }

    unshiftElem(key, item) {
        this.createElem(key, item, tpl => {
            if (this.elem.firstChild) {
                this.elem.insertBefore(tpl.nodes[0], this.elem.firstChild);
            } else {
                this.elem.appendChild(tpl.nodes[0]);
            }
        });
    }
    
    // get & set by key
    setProxy(key, proxy) {
        this.proxies[key] = proxy;
    }

    getProxy(key) {
        return this.proxies[key];
    }

    setTpl(key, tpl) {
        this.tpls[key] = tpl;
    }

    getTpl(key) {
        return this.tpls[key];
    }

    getIndex(key) {
        return (this.keyMap[key] - this.offset);
    }

    // key ---------
    pushKey(key) {
        this.keyMap[key] = this.currentIndex;
        this.currentIndex++;
    }

    unshiftKey(key) {
        this.offset--;
        this.keyMap[key] = this.offset;
    }

    popKey(key) {
        this.deleteKey(key);
        this.currentIndex--;
    }

    shiftKey(key) {
        this.deleteKey(key);
        this.offset++;
    }

    deleteKey(key) {
        delete(this.keyMap[key]);
    }

    hasKey(key) {
        return this.keyMap.hasOwnProperty(key);
    }

    // ----
    itemKey(item) {
        if (!this.itemKeyHandle) {
            throw new Error('cannot find item key  handle');
        }
        return this.itemKeyHandle(item);
    }

    itemFilter(item) {
        if (this.itemFilterHandle) {
            return this.itemFilterHandle(item);
        }
        return true;
    }

    tplBuilder() {
        if (!this.tplBuilderHandle) {
            throw new Error('cannot find tpl builder handle');
        }
        const tpl = this.tplBuilderHandle();
        if (tpl.nodes[1]) {
            throw new Error('array item tpl must be encapsulated: ' + tpl.ctn.innerHTML);
        }
        return tpl;
    }
}
