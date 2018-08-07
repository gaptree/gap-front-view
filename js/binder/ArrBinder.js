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
        this.itemTplhandler = funHolder.get(this.elem.innerHTML.trim());

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
        this.elem.appendChild(tpl.nodes[0]);
        this.tplDict[key] = tpl;
        return this.tplDict[key];
    }

    removeItem(key) {
        const tpl = this.tplDict[key];
        if (tpl) {
            tpl.remove();
        }
    }
}
