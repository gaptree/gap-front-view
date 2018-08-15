import {GapDpt} from './GapDpt';

export class GapObj {
    constructor() {
        this.defineSecureProp('_dpts', {});
    }

    defineSecureProp(prop, defaultVal) {
        Object.defineProperty(this, prop, {
            configurable: false,
            enumerable: false,
            get: () => defaultVal
        });
    }

    setParentDpt(parentDpt) {
        if (this._parentDpt) {
            throw new Error('parent dpt already defined');
        }
        this.defineSecureProp('_parentDpt', parentDpt);
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

    setDpt(prop, dpt) {
        if (this.hasDpt(prop)) {
            throw new Error('dpt duplicated: ' + prop);
        }
        if (!(dpt instanceof GapDpt)) {
            throw new Error('require GapDpt');
        }

        dpt.addParentObj(prop, this);
        this._dpts[prop] = dpt;
    }

    defineDpt(prop, dpt) {
        this.setDpt(prop, dpt);

        if (this.hasOwnProperty(prop)) {
            dpt.setVal(this[prop]);
        }

        Object.defineProperty(this, prop, {
            enumerable: true,
            configurable: true,
            get: dpt.getter(),
            set: dpt.setter()
        });
    }

    getDpt(prop) {
        return this._dpts[prop];
    }

    fetchDpt(prop) {
        if (this.hasDpt(prop)) {
            return this.getDpt(prop);
        }

        const dpt = new GapDpt();
        this.defineDpt(prop, dpt);
        return dpt;
    }

    addChild(prop, gapObj) {
        if (gapObj instanceof GapObj) {
            const dpt = this.fetchDpt(prop);
            gapObj.setParentDpt(dpt);
            dpt.setVal(gapObj);
            return gapObj;
        }

        throw new Error('child must be instance of GapObj');
    }

    update(inSrc, txn) {
        const src = Object.assign({}, inSrc);

        Object.keys(this).forEach(key => {
            this.set(key, src[key], txn);
            delete(src[key]);
        });

        Object.keys(src).forEach(key => {
            this.set(key, src[key], txn);
        });
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
            if (dpt.isChanged()) {
                txn.addChangedDpt(dpt);
            }
        } else {
            this[prop] = val;
        }
    }
}
