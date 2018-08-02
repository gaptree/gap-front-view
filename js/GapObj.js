import {GapDpt} from './GapDpt';
//import {GapTxn} from './GapTxn';

export class GapObj {
    constructor(parentDpt) {
        this.defineSecureProp('_dpts', {});
        this.defineSecureProp('_parentDpt', parentDpt);
    }

    defineSecureProp(prop, defaultVal) {
        Object.defineProperty(this, prop, {
            configurable: false,
            enumerable: false,
            get: () => defaultVal
        });
    }

    getDpts() {
        return this._dpts;
    }

    getParentDpt() {
        return this._parentDpt;
    }

    hasDpt(prop) {
        return this._dpts.hasOwnProperty(prop);
    }

    appendDpt(prop, dpt) {
        if (dpt instanceof GapDpt) {
            this.setDpt(prop, dpt);
        }
        /*
        if (this.hasDpt(prop)) {
            throw new Error('dpt duplicated: ' + prop);
        }

        if (this.hasOwnProperty(prop)) {
            dpt.setVal(this[prop]);
        }

        Object.defineProperty(this, prop, {
            enumerable: true,
            configurable: true,
            get: dpt.getter(),
            set: dpt.setter()
        });
        this._dpts[prop] = dpt;
        */
    }

    setDpt(prop, inDpt) {
        if (this.hasDpt(prop)) {
            throw new Error('dpt duplicated: ' + prop);
        }

        const dpt = inDpt ? inDpt : new GapDpt();
        dpt.addParentObj(this, prop);
        if (this.hasOwnProperty(prop)) {
            dpt.setVal(this[prop]);
        }

        Object.defineProperty(this, prop, {
            enumerable: true,
            configurable: true,
            get: dpt.getter(),
            set: dpt.setter()
        });
        this._dpts[prop] = dpt;
    }

    getDpt(prop) {
        return this._dpts[prop];
    }

    fetchDpt(prop) {
        if (this.hasDpt(prop)) {
            return this.getDpt(prop);
        }

        this.setDpt(prop);
        return this.getDpt(prop);
    }

    createChildGapObj(prop) {
        const dpt = this.fetchDpt(prop);
        const gapObj = new GapObj(dpt);
        dpt.setVal(gapObj);
        return gapObj;
    }

    update(inSrc, txn) {
        /*
        if (!(inSrc instanceof Object)) {
            throw new Error('fullUpdate, 2nd param require Object');
        }
        */
        const src = Object.assign({}, inSrc);

        txn && txn.start();

        Object.keys(this).forEach(key => {
            this.set(key, src[key], txn);
            delete(src[key]);
        });

        Object.keys(src).forEach(key => {
            this.set(key, src[key], txn);
        });
        txn && txn.end();
    }

    set(prop, val, txn) {
        if (this.hasDpt(prop)) {
            const dpt = this.getDpt(prop);
            const obj = dpt.getVal();
            if (obj instanceof GapObj) {
                obj.update(val, txn);
            } else {
                dpt.setVal(val);
            }
            if (dpt.isChanged() && txn) {
                txn.addChangedDpt(dpt);
            }
        } else {
            this[prop] = val;
        }
    }
}
