import {funHolder} from '../holder/funHolder';
import {BinderBase} from './BinderBase';

let arrBinderIndex = 0;

export class ArrBinder extends BinderBase {
    constructor(elem) {
        super(elem);
        this.elem = elem;
        this.tplDict = {};
        this.id = 'arr-binder-' + arrBinderIndex++;

        this.itemAs = this.elem.getAttribute('item-as');
        this.itemKeyHandler = funHolder.get(this.elem.getAttribute('item-key'));

        let tplHolder = this.elem.getAttribute('item-tpl').trim();
        if (!tplHolder) {
            tplHolder = this.elem.innerHTML.trim();
        }
        if (!tplHolder) {
            throw new Error('Cannot find Arr tpl holder');
        }
        this.itemTplhandler = funHolder.get(tplHolder);

        const itemFilterAttr = this.elem.getAttribute('item-filter');
        if (itemFilterAttr) {
            this.itemFilterHandler = funHolder.get(this.elem.getAttribute('item-filter'));
        }

        this.elem.innerHTML = '';
    }

    update() {
        throw new Error('ArrBinder.update disabled');
        //console.log(val);
    }

    getKeyHandler() {
        return this.itemKeyHandler;
    }

    hasItem(item) {
        const key = this.itemKeyHandler(item);
        return this.hasKey(key);
    }

    addItem(item) {
        const key = this.itemToKey(item);
        if (this.hasKey(key)) {
            throw new Error('duplicated item', JSON.stringify(item));
        }
        //this.itemDict[key] = item;
    }

    hasKey(key) {
        return this.itemDict.hasOwnProperty(key);
    }


    filterItem(item) {
        if (this.itemFilterHandler) {
            return this.itemFilterHandler(item);
        }
        return true;
    }

    itemToKey(item) {
        return this.itemKeyHandler(item);
    }

    fetchTpl(key) {
        if (this.tplDict[key]) {
            return this.tplDict[key];
        }

        if (!this.itemTplhandler) {
            throw new Error('cannot find tpl builder handle');
        }
        const tpl = this.itemTplhandler(key);
        if (tpl.nodes[1]) {
            throw new Error('array item tpl must be encapsulated: ' + tpl.ctn.innerHTML);
        }

        //this.elem.innerHTML = '';
        //this.elem.appendChild(tpl.nodes[0]);
        this.tplDict[key] = tpl;
        return this.tplDict[key];
    }

    appendTpl(tpl) {
        this.elem.appendChild(tpl.nodes[0]);
    }

    prependTpl(tpl) {
        if (this.elem.firstChild) {
            this.elem.insertBefore(tpl.nodes[0], this.elem.firstChild);
        } else {
            this.appendTpl(tpl);
        }
    }

    removeItemByKey(key) {
        const tpl = this.tplDict[key];
        if (tpl) {
            tpl.remove();
        }
    }

    sort(items) {
        items.forEach(item => {
            if (!item) {
                return;
            }
            if (!this.filterItem(item)) {
                return;
            }

            const key = this.itemToKey(item);
            const tpl = this.fetchTpl(key);
            this.elem.appendChild(tpl.nodes[0]);
        });
    }
}
