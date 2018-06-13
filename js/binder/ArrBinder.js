import {getFun} from '../lib/holder';
//import {compile} from '../lib/compile';
import {GapProxy} from '../GapProxy';
import {BinderBase} from './BinderBase';

let arrBinderIndex = 0;

export class ArrBinder extends BinderBase {
    constructor(elem) {
        super();

        /*
        this.tpls = {};
        this.keyMap = {};
        this.proxies = {};
        this.items = [];
        this.currentIndex = 0;
        this.offset = 0;
        */

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
        this.elem.innerHTML = '';

        /*
        this.items = this.buildItems();
        this.items.clear();
        */
    }

    getProxy(key) {
        if (this.proxies[key]) {
            return this.proxies[key];
        }
        this.proxies[key] = new GapProxy();
        return this.proxies[key];
    }

    getIndex(key) {
        const temIndex = this.keyMap[key];
        return (temIndex - this.offset);
    }

    getItem(key) {
        const index = this.getIndex(key);
        return this.items[index];
    }

    getTpl(key, item) {
        if (this.tpls[key]) {
            return this.tpls[key];
        }

        const tpl = this.tplBuilder(item);
        //const proxy = this.getProxy(key);
        //proxy.compile(tpl, this.arrBinderId + '-' + key);
        this.tpls[key] = tpl;
        return this.tpls[key];
    }

    hasKey(key) {
        return this.keyMap.hasOwnProperty(key);
    }

    getLength() {
        return this.currentIndex - this.offset;
    }

    // -----
    _updateItem(key, item) {
        const proxy = this.getProxy(key);
        if (this.hasKey(key)) {
            Object.assign(this.getItem(key), item);
            proxy.updateAll({[this.itemAs]: item});
            return true;
        }

        return false;
    }

    pushItem(item) {
        if (!this.itemFilter(item)) {
            return false;
        }

        const key = this.itemKey(item);
        if (this._updateItem(key, item)) {
            return false;
        }

        const tpl = this.getTpl(key, item);
        const proxy = this.getProxy(key);
        this.elem.appendChild(tpl.nodes[0]);

        proxy.compile(tpl, this.arrBinderId + '-' + key);
        proxy.updateAll({[this.itemAs]: item});

        this.keyMap[key] = this.currentIndex;
        this.currentIndex++;
        return true;
    }

    unshiftItem(item) {
        if (!this.itemFilter(item)) {
            return false;
        }

        const key = this.itemKey(item);
        if (this._updateItem(key, item)) {
            return false;
        }

        const tpl = this.getTpl(key, item);
        const proxy = this.getProxy(key);
        if (this.elem.firstChild) {
            this.elem.insertBefore(tpl.nodes[0], this.elem.firstChild);
        } else {
            this.elem.appendChild(tpl.nodes[0]);
        }
        // proxy compile must before updateAll
        proxy.compile(tpl, this.arrBinderId + '-' + key);
        proxy.updateAll({[this.itemAs]: item});
        this.offset--;
        this.keyMap[key] = this.offset;

        return true;
    }

    shiftItem(item) {
        this.deleteItem(item, true);
        this.offset++;
    }

    popItem(item) {
        this.deleteItem(item, true);
        this.currentIndex--;
    }

    deleteItem(item, isIgnore = false) {
        const key = this.itemKey(item);
        if (!this.hasKey(key)) {
            return false;
        }

        const tpl = this.getTpl(key, item);
        tpl.remove();

        delete(this.proxies[key]);
        delete(this.keyMap[key]);
        delete(this.tpls[key]);
        
        const index = this.getIndex(key);
        if (isIgnore) {
            this.items[index] = undefined;
        }
        return true;
    }

    // ----------

    defineProp(obj, prop, handle) {
        Object.defineProperty(obj, prop, {
            enumerable: false,
            configurable: false,
            value: handle
        });
    }

    buildItems(itemArr) {
        //const itemArr = [];

        this.defineProp(itemArr, 'push', (...items) => {
            items.forEach(item => {
                if (this.pushItem(item)) {
                    Array.prototype.push.call(itemArr, item);
                }
            });
            return this.getLength();
        });

        this.defineProp(itemArr, 'unshift', (...items) => {
            items.forEach(item => {
                if (this.unshiftItem(item)) {
                    Array.prototype.unshift.call(itemArr, item);
                }
            });
            return this.getLength();
        });

        this.defineProp(itemArr, 'delete', (item) => {
            this.deleteItem(item);
        });

        this.defineProp(itemArr, 'pop', () => {
            const item = Array.prototype.pop.call(itemArr);
            this.popItem(item);
            return item;
        });

        this.defineProp(itemArr, 'shift', () => {
            const item = Array.prototype.shift.call(itemArr);
            this.shiftItem(item);
            return item;
        });

        this.defineProp(itemArr, 'filter', (handle) => {
            return Array.prototype.filter.call(itemArr, (item, index, array) => {
                if (handle(item, index, array)) {
                    return true;
                }

                this.deleteItem(item);
                return false;
            });
        });

        this.defineProp(itemArr, 'clear', () => {

            itemArr.splice(0, itemArr.length);
            this.refresh();
        });

        // deprecated

        this.defineProp(itemArr, 'add', (...items) => {
            console.warn('please use push'); // eslint-disable-line
            itemArr.push(...items);
        });

        this.defineProp(itemArr, 'updateElem', (item) => {
            console.warn('please use push or unshift'); // eslint-disable-line
            itemArr.push(item);
        });

        this.defineProp(itemArr, 'removeElem', (item) => {
            console.warn('please use delete'); // eslint-disable-line
            itemArr.delete(item);
        });

        return itemArr;
    }

    // ---------

    tplBuilder(item) {
        if (!this.tplBuilderHandle) {
            throw new Error('cannot find tpl builder handle');
        }
        const tpl = this.tplBuilderHandle(item);
        if (tpl.nodes[1]) {
            throw new Error('array item tpl must be encapsulated: ' + tpl.ctn.innerHTML);
        }
        return tpl;
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

    hasItem(item) {
        const key = this.itemKey(item);
        return this.keyMap.hasOwnProperty(key);
    }

    refresh() {
        this.elem.innerHTML = '';
        this.tpls = {};
        this.proxies = {};
        this.keyMap = {};
        //this.itemArr.clear();

        this.currentIndex = 0;
        this.offset = 0;
    }
    update(inVal) {
        const arr = this.parseVal(inVal);
        if (arr === undefined) {
            return;
        }

        this.items = this.buildItems(arr);
        this.refresh();

        const outItems = this.items.splice(0, this.items.length);
        this.items.push(...outItems);
    }
}
