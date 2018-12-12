import {GapProxy} from './GapProxy';
import {GapObj} from './GapObj';
import {GapDpt} from './GapDpt';
import {GapCommitTxn} from './txn/GapCommitTxn';
import {GapTxn} from './txn/GapTxn';

const actionType = {
    push: 1,
    unshift: 2
};

export class GapArr extends GapObj {
    constructor() {
        super();

        this.defineSecureProp('_arrBinders', {});
        this.defineSecureProp('_subProxies', {});
        this.defineSecureProp('_subDptIds', {});
        this.defineSecureProp('_arr', {
            curr: [],
            prev: {},
        });

        //this._initLength();
    }

    addArrBinder(arrBinder) {
        this._arrBinders[arrBinder.id] = arrBinder;
    }

    update(src, txn) {
        if (!src) {
            return;
        }

        this._prepareArr();

        txn.start();
        
        for (let index = 0; index < src.length; index++) {
            const item = src[index];
            this._addItem(item, txn, actionType.push);
        }

        this._clearArrPrev();

        txn.end();
    }

    // array
    delete(item) {
        this._forEachArrBinder(arrBinder => {
            const itemKey = arrBinder.itemToKey(item);
            arrBinder.removeItemByKey(itemKey);

            const subKey = this._genSubKey(arrBinder.id, itemKey);
            const subDptId = this._getSubDptId(subKey);
            delete(this._dpts[subDptId]);
            delete(this._subProxies[subKey]);
            delete(this._subDptIds[subKey]);
        });
    }

    get(itemKey) {
        let currentDpt;
        this._forEachArrBinder(arrBinder => {
            const subKey = this._genSubKey(arrBinder.id, itemKey);
            const dptId = this._getSubDptId(subKey);
            const dpt = this.getDpt(dptId);
            if (currentDpt) {
                if (dpt && currentDpt.id !== dpt.id) {
                    throw new Error('dpt.id not match');
                }
            } else {
                if (dpt) {
                    currentDpt = dpt;
                }
            }
        });
        if (currentDpt) {
            return currentDpt.getVal();
        }
    }

    push(item) {
        const txn = new GapCommitTxn();
        txn.start();
        this._addItem(item, txn, actionType.push);
        txn.end();
    }

    pop() {
        const dptId = this._arr.curr.pop();
        const dpt = this.getDpt(dptId);
        const item = dpt.getVal();
        this.delete(item);
        return item;
    }

    unshift(item) {
        const txn = new GapCommitTxn();
        txn.start();
        this._addItem(item, txn, actionType.unshift);
        txn.end();
    }

    shift() {
        const dptId = this._arr.curr.shift();
        const dpt = this.getDpt(dptId);
        const item = dpt.getVal();
        this.delete(item);
        return item;
    }

    get length() {
        return this._arr.curr.length;
    }

    filter(handler) {
        const txn = new GapTxn();
        const oriArr = [];
        this._arr.curr.forEach(item => oriArr.push(item));

        this._prepareArr();

        const filtered = oriArr
            .filter(dptId => {
                if (dptId) {
                    return true;
                }
                return false;
            })
            .map(dptId => this.getDpt(dptId).getVal()) // to check
            .filter(handler);
        
        filtered.forEach(item => {
            this._addItem(item, txn, actionType.push);
        });

        this._clearArrPrev();

        txn.end();

        return filtered;
    }



    // private fun

    _forEachArrBinder(handler) {
        Object.keys(this._arrBinders).forEach(arrBinderId => {
            handler(this._arrBinders[arrBinderId]);
        });
    }

    /*
     * action = pop | push
     */
    _addItem(item, txn, action) {
        let currentDpt;
        this._forEachArrBinder(arrBinder => {
            if (!arrBinder.filterItem(item)) {
                return;
            }

            const itemKey = arrBinder.itemToKey(item);
            const subKey = this._genSubKey(arrBinder.id, itemKey);
            const hasSubProxy = this._hasSubProxy(subKey);
            const subDptId = this._getSubDptId(subKey);
            const tpl = arrBinder.fetchTpl(itemKey);

            if (currentDpt) {
                if (subDptId === undefined) {
                    this._setSubDptId(subKey, currentDpt.id);
                } else if (currentDpt.id !== subDptId) {
                    throw new Error('dpt.id not match');
                }
            } else {
                if (subDptId === undefined) {
                    currentDpt = new GapDpt();
                    this.setDpt(currentDpt.id, currentDpt);
                    this._setSubDptId(subKey, currentDpt.id);
                } else {
                    currentDpt = this.getDpt(subDptId);
                }
            }

            if (!hasSubProxy) {
                const subProxy = new GapProxy();
                subProxy.data.defineDpt(arrBinder.itemAs, currentDpt);
                subProxy.bindTpl(tpl);
                this._setSubProxy(subKey, subProxy);
            }

            if (action === actionType.push) {
                arrBinder.appendTpl(tpl);
            } else if (action === actionType.unshift) {
                arrBinder.prependTpl(tpl);
            }
        });

        if (currentDpt) {
            this._arr.curr.push(currentDpt.id);
            this._defineIndex(this._arr.curr.length - 1);

            const currentGapObj = currentDpt.getVal();
            if (currentGapObj instanceof GapObj) {
                currentGapObj.update(item, txn);
            } else {
                currentDpt.setVal(item);
            }
            if (currentDpt.isChanged()) {
                txn.addChangedDpt(currentDpt);
            }
        }
    }

    _genSubKey(arrBinderId, itemKey) {
        return '' + arrBinderId + '-' + itemKey;
    }

    _prepareArr() {
        this._arr.prev = {};
        this._arr.curr.forEach(dptId => {
            this._arr.prev[dptId] = 1;
        });
        this._arr.curr = [];
    }

    _hasSubDptId(subKey) {
        return this._subDptIds.hasOwnProperty(subKey);
    }

    _setSubDptId(subKey, dptId) {
        if (this._hasSubDptId(subKey)) {
            throw new Error('duplicate subDpt: ' + subKey);
        }
        this._subDptIds[subKey] = dptId;
    }

    _getSubDptId(subKey) {
        return this._subDptIds[subKey];
    }

    _hasSubProxy(subKey) {
        return this._subProxies.hasOwnProperty(subKey);
    }

    _getSubProxy(subKey) {
        return this._subProxies[subKey];
    }

    _setSubProxy(subKey, subProxy) {
        this._subProxies[subKey] = subProxy;
    }

    _defineIndex(index) {
        const descriptor = Object.getOwnPropertyDescriptor(this, index);
        if (descriptor) {
            return;
        }

        Object.defineProperty(this, index, {
            enumerable: true,
            configurable: true,
            get: () => {
                const dptId = this._arr.curr[index];
                if (!dptId) {
                    return;
                }
                const dpt = this.getDpt(dptId);
                if (dpt) {
                    return dpt.getVal();
                }
            },
            set: (val) => {
                const dpt = this._arr[index];
                if (!dpt) {
                    throw new Error('todo');
                }
                dpt.setVal(val);
            }
        });
    }

    _clearArrPrev() {
        const currItems = [];

        this._arr.curr.forEach(dptId => {
            currItems.push(this.getDpt(dptId).getVal());
            if (this._arr.prev[dptId]) {
                delete(this._arr.prev[dptId]);
            }
        });

        Object.keys(this._arr.prev).forEach(dptId => {
            const dpt = this.getDpt(dptId);
            if (dpt) {
                this.delete(dpt.getVal());
            }
        });

        /*
        Object.keys(this._arrBinders).forEach(arrBinderId => {
            const arrBinder = this._arrBinders[arrBinderId];
            arrBinder.sort(currItems);
        });
        */
    }
}
