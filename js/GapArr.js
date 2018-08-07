import {GapProxy} from './GapProxy';
import {GapObj} from './GapObj';
import {GapDpt} from './GapDpt';
import {GapTxn} from './GapTxn';

export class GapArr extends GapObj {
    constructor(parentDpt) {
        super(parentDpt);

        this.defineSecureProp('_arr', []);
        this.defineSecureProp('_arrBinders', []);
        this.defineSecureProp('_itemProxies', {});
        this.defineSecureProp('_itemDpts', {});

        this.defineSecureProp('_reged', {
            curr: {},
            prev: {},
            indexes: {}
        });
    }

    _genKey(binderId, itemKey) {
        return '' + binderId + '-' + itemKey;
    }

    regItemKey(binderId, itemKey) {
        const key = '' + binderId + '-' + itemKey;
        if (!this._reged.curr[binderId]) {
            this._reged.curr[binderId] = {};
        }
        if (this._reged.curr[binderId][itemKey]) {
            return key;
        }

        this._reged.curr[binderId][itemKey] = 1;
        if (!this._reged.prev[binderId]) {
            this._reged.prev[binderId] = {};
        }
        if (this._reged.prev[binderId][itemKey]) {
            delete(this._reged.prev[binderId][itemKey]);
        }
        return key;
    }

    mapIndex(binderId, itemKey, index) {
        const key = this.regItemKey(binderId, itemKey);
        this._reged.indexes[key] = index;
    }

    setItemDpt(binderId, itemKey, dpt) {
        const key = this.regItemKey(binderId, itemKey);
        this._itemDpts[key] = dpt;
    }

    hasItemDpt(binderId, itemKey) {
        const key = this.regItemKey(binderId, itemKey);
        return this._itemDpts.hasOwnProperty(key);
    }

    getItemDpt(binderId, itemKey) {
        const key = this.regItemKey(binderId, itemKey);
        return this._itemDpts[key];
    }

    fetchItemDpt(binderId, itemKey) {
        if (this.hasItemDpt(binderId, itemKey)) {
            return this.getItemDpt(binderId, itemKey);
        }

        const dpt = new GapDpt();
        this.setDpt(dpt.id, dpt);
        this.setItemDpt(binderId, itemKey, dpt);
        return dpt;
    }

    hasItemProxy(binderId, itemKey) {
        const key = this.regItemKey(binderId, itemKey);
        return this._itemProxies.hasOwnProperty(key);
    }

    getItemProxy(binderId, itemKey) {
        const key = this.regItemKey(binderId, itemKey);
        if (this._itemProxies.hasOwnProperty(key)) {
            return this._itemProxies[key];
        }

        this._itemProxies[key] = new GapProxy();
        return this._itemProxies[key];
    }

    addArrBinder(arrBinder) {
        this._arrBinders.push(arrBinder);
    }

    filter(handler) {
        this._reged.prev = this._reged.curr;
        this._reged.curr = {};
        this._reged.indexes = {};
        const oriArr = this._arr.splice(0, this._arr.length);

        oriArr
            .filter(item => {
                if (item) {
                    return true;
                }
                return false;
            })
            .filter(handler).forEach(item => {
                this._push(item);
            });

        this.clearPrev();
    }

    clearPrev() {
        this._arrBinders.forEach(arrBinder => {
            const binderId = arrBinder.id;
            if (!this._reged.prev[binderId]) {
                return;
            }
            Object.keys(this._reged.prev[binderId]).forEach(key => {
                arrBinder.removeItem(key);
            });
        });

        Object.keys(this._reged.prev).forEach(binderId => {
            Object.keys(this._reged.prev[binderId]).forEach(itemKey => {
                const key = this._genKey(binderId, itemKey);
                const dpt = this._itemDpts[key];

                dpt && delete(this._dpts[dpt.id]);
                delete(this._itemDpts[key]);
                delete(this._itemProxies[key]);
            });
        });
    }

    update(src, txn) {
        this._reged.prev = this._reged.curr;
        this._reged.curr = {};
        this._reged.indexes = {};
        this._arr.splice(0, this._arr.length);

        txn && txn.start();

        src.forEach(item => {
            this._push(item, txn);
        });

        this.clearPrev();

        txn && txn.end();
    }

    push(item) {
        const txn = new GapTxn();
        txn.start();
        this._push(item, txn);
        txn.end();
    }

    get(itemKey) {
        let currentDpt;
        this._arrBinders.forEach(arrBinder => {
            const key = this._genKey(arrBinder.id, itemKey);
            const dpt = this._itemDpts[key];
            if (dpt) {
                currentDpt = dpt;
            }
        });
        if (currentDpt) {
            return currentDpt.getVal();
        }
    }

    /*
    shift() {
        const item = this._arr.shift();
        this.delete(item);
    }
    */

    pop() {
        const item = this._arr.pop();
        this.delete(item);
    }

    delete(item) {
        this._arrBinders.forEach(arrBinder => {
            const binderId = arrBinder.id;
            const itemKey = arrBinder.itemToKey(item);
            arrBinder.removeItem(itemKey);

            // todo
            const key = this._genKey(binderId, itemKey);
            const dpt = this._itemDpts[key];
            const index = this._reged.indexes[key];

            delete(this._dpts[dpt.id]);
            delete(this._itemDpts[key]);
            delete(this._itemProxies[key]);
            if (this._arr[index]) {
                this._arr[index] = undefined;
            }
        });
    }

    _push(item, txn) {
        let currentDpt;

        this._arrBinders.forEach(arrBinder => {
            if (!arrBinder.filterItem(item)) {
                return;
            }

            const arrBinderId = arrBinder.id;
            const itemKey = arrBinder.itemToKey(item);
            const hasItemProxy = this.hasItemProxy(arrBinderId, itemKey);
            const itemProxy = this.getItemProxy(arrBinderId, itemKey);

            if (currentDpt) {
                const existed = this.getItemProxy(arrBinderId, itemKey);
                if (!existed) {
                    this.setItemDpt(arrBinderId, itemKey);
                } else {
                    if (existed.id !== currentDpt.id) {
                        throw new Error('dpt.id not match');
                    }
                }
            } else {
                currentDpt = this.fetchItemDpt(arrBinderId, itemKey);
            }

            if (!hasItemProxy) {
                const tpl = arrBinder.fetchTpl(itemKey);
                const itemAs = arrBinder.itemAs;

                // todo
                itemProxy.data.appendDpt(itemAs, currentDpt);
                itemProxy.compileTpl(tpl);

                //console.log(itemProxy);
                this.mapIndex(arrBinderId, itemKey, this._arr.length);
                this._arr.push(item);
            }

        
            this.set(currentDpt.id, item, txn);
        });
    }
}
