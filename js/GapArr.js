import {GapProxy} from './GapProxy';
import {GapObj} from './GapObj';
import {GapDpt} from './GapDpt';
import {GapTxn} from './GapTxn';

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
        this._prepareArr();

        txn && txn.start();
        
        for (let index = 0; index < src.length; index++) {
            const item = src[index];
            this._push(item, txn);
        }

        this._clearPrevAndSort();

        txn && txn.end();
    }

    // array
    delete(item) {
        this._forEachArrBinder(arrBinder => {
            const itemKey = arrBinder.itemToKey(item);
            arrBinder.removeItemByKey(itemKey);

            const subKey = this._genSubKey(arrBinder.Id, itemKey);
            const subDptId = this._getSubDptId(subKey);
            //const dpt = this._getDpt(subDptId);
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
            const dpt = this._getDpt(dptId);
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
        const txn = new GapTxn();
        txn.start();
        this._push(item, txn);
        txn.end();
    }

    pop() {
        const dptId = this._arr.curr.pop();
        const dpt = this._getDpt(dptId);
        const item = dpt.getVal();
        this.delete(item);
    }

    shift() {
        const dptId = this._arr.curr.shift();
        const dpt = this._getDpt(dptId);
        const item = dpt.getVal();
        this.delete(item);
    }

    unshift(item) {
        throw new Error('todo');

        const txn = new GapTxn();
        txn.start();
        this._push(item, txn);
        txn.end();
    }

    // extends from array
    get length() {
        return this._arr.curr.length;
    }

    filter(handler) {
        const oriArr = [];
        this._arr.curr.forEach(item => oriArr.push(item));

        this._prepareArr();

        oriArr
            .filter(dptId => {
                if (dptId) {
                    return true;
                }
                return false;
            })
            .map(dptId => this._getDpt(dptId).getVal()) // to check
            .filter(handler).forEach(item => {
                this._push(item);
            });

        this._clearPrevAndSort();
    }



    // private fun

    _forEachArrBinder(handler) {
        Object.keys(this._arrBinders).forEach(arrBinderId => {
            handler(this._arrBinders[arrBinderId]);
        });
    }

    _push(item, txn) {
        let currentDpt;
        Object.keys(this._arrBinders).forEach(arrBinderId => {
            const arrBinder = this._arrBinders[arrBinderId];
            if (!arrBinder.filterItem(item)) {
                return;
            }

            const itemKey = arrBinder.itemToKey(item);
            const subKey = this._genSubKey(arrBinder.id, itemKey);
            const hasSubProxy = this._hasSubProxy(subKey);
            const subProxy = this._fetchSubProxy(subKey);
            const subDptId = this._getSubDptId(subKey);

            if (currentDpt) {
                if (subDptId === undefined) {
                    this._setSubDptId(subKey, currentDpt.id);
                } else if (currentDpt.id !== subDptId) {
                    throw new Error('dpt.id not match');
                }
            } else {
                if (subDptId === undefined) {
                    currentDpt = new GapDpt();
                    this._setDpt(currentDpt.id, currentDpt);
                    this._setSubDptId(subKey, currentDpt.id);
                } else {
                    currentDpt = this._getDpt(subDptId);
                }
            }

            if (!hasSubProxy) {
                const tpl = arrBinder.fetchTpl(itemKey);
                const itemAs = arrBinder.itemAs;

                subProxy.data.appendDpt(itemAs, currentDpt);
                subProxy.compileTpl(tpl);

            }
        });

        if (currentDpt) {
            this._arr.curr.push(currentDpt.id);
            this._defineIndex(this._arr.curr.length - 1);

            const currentGapObj = currentDpt.getVal();
            if (!(currentGapObj instanceof GapObj)) {
                throw new Error('to check must be GapObj');
            }
            currentGapObj.update(item, txn);
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

    _fetchSubProxy(subKey) {
        if (this._hasSubProxy(subKey)) {
            return this._subProxies[subKey];
        }

        this._subProxies[subKey] = new GapProxy();
        return this._subProxies[subKey];
    }

    _defineIndex(index) {
        Object.defineProperty(this, index, {
            enumerable: true,
            configurable: true,
            get: () => {
                const dptId = this._arr.curr[index];
                if (!dptId) {
                    return;
                }
                const dpt = this._getDpt(dptId);
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

    /*
    _initLength() {
        let length = 0;
        Object.defineProperty(this, 'length', {
            enumerable: false,
            get: () => length,
            set: (val) => length = val
        });
    }
    */

    _setDpt(dptId, dpt) {
        this._dpts[dptId] = dpt;
    }

    _getDpt(dptId) {
        return this._dpts[dptId];
    }

    _clearPrevAndSort() {
        const currItems = [];

        this._arr.curr.forEach(dptId => {
            currItems.push(this._getDpt(dptId).getVal());
            if (this._arr.prev[dptId]) {
                delete(this._arr.prev[dptId]);
            }
        });

        Object.keys(this._arr.prev).forEach(dptId => {
            const dpt = this._getDpt(dptId);
            if (dpt) {
                this.delete(dpt.getVal());
            }
        });

        /*
         * todo
        Object.keys(this._arrBinders).forEach(arrBinderId => {
            const arrBinder = this._arrBinders[arrBinderId];
            arrBinder.sort(currItems);
        });
        */
    }
}
