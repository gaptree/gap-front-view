import {GapTxn} from './GapTxn';

let gapDptIndex = 0;

export class GapDpt {
    constructor() {
        this.id = 'gapDpt' + gapDptIndex++;
        this.parentObjs = [];
        this.props = [];
        this.currentVal;
        this._isChanged = false;

        //this.addParentObj(parentObj, prop);

        this.binders = [];
        this.watchers = [];
    }

    addParentObj(parentObj, prop) {
        if (parentObj) {
            this.parentObjs.push(parentObj);
        }
        if (prop) {
            this.props.push(prop);
        }
    }

    getVal() {
        return this.currentVal;
    }

    setVal(val) {
        console.log('GapDpt.set', val);
        //console.log(this.props, this.parentObjs);

        if (this.currentVal === undefined || this.currentVal !== val) {
            this.currentVal = val;
            this.changed();
        }
    }

    changed() {
        this._isChanged = true;
        this.parentObjs.forEach(parentObj => {
            const parentDpt = parentObj.getParentDpt();
            if (parentDpt) {
                parentDpt.changed();
            }
        });
    }

    isChanged() {
        return this._isChanged;
    }

    getter() {
        return () => {
            return this.currentVal;
        };
    }

    setter() {
        return (val) => {
            const txn = new GapTxn();
            txn.start();

            if (this.currentVal && this.currentVal.update) {
                this.currentVal.update(val, txn);
            } else {
                this.setVal(val);
            }
            if (this.isChanged()) {
                txn.addChangedDpt(this);
            }
            txn.end();
        };
    }

    addBinder(binder, filter) {
        binder.onFilter(filter);
        this.binders.push(binder);
    }

    addWatcher(watcher) {
        this.watchers.push(watcher);
    }

    commitChanging() {

        if (this.binders.length > 0) {
            this.binders.forEach(binder => binder.update(this.currentVal));
        }
        if (this.watchers.length > 0) {
            this.watchers.forEach(watcher => watcher.update(this.currentVal));
        }

        this.logCommitChanging();

        this._isChanged = false;
    }

    logCommitChanging() {
        const flags = [];
        if (this.binders.length > 0) {
            flags.push('binder');
        }
        if (this.watchers.length > 0) {
            flags.push('watcher');
        }
        if (flags.length > 0) {
            const propStr = '[' + this.props.join(',') + ']';
            const prePropStr = this.parentObjs.map(parentObj => {
                const ancestorDpt = parentObj.getParentDpt();
                if (ancestorDpt) {
                    return '[' + ancestorDpt.props.join(',') + ']';
                }
            }).join('/');

            let query = '';
            if (prePropStr) {
                query += '{' + prePropStr + '}.';
            }
            query += propStr;

            console.log(` - ${query}`, this.currentVal, `(${flags.join(',')})`);
        }
    }
}
