# view update

## View.update(data)

```javascript
class View {
    update(data) {
        this.bindTpl();
        this.proxy.update(data);
    }
}

class GapProxy {
    update(data) {
       const txn = new GapCommitTxn();
       txn.start();
       this.data.update(data, txn); // root obj in proxy
       txn.end();
    }
}

class GapObj {
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

class GapDpt {
    getVal() {
        return this.currentVal;
    }

    setVal(val) {
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
}
```