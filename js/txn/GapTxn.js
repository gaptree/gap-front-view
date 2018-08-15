let isDebug = false;
const txnPool = [];
const max = 3;

const pushTxn = (txn) => {
    if (!isDebug) {
        return;
    }
    txnPool.push(txn);
};

const shiftTxn = () => {
    if (!isDebug) {
        return;
    }
    if (txnPool.length > max) {
        txnPool.shift();
    }
};


export class GapTxn {
    constructor() {
        this.level = 0;
        this.changedDpts = {};
        this.lastDpts = {};

        pushTxn(this);
    }

    static getPool() {
        return txnPool;
    }

    static enableDebug() {
        isDebug = true;
    }

    static last() {
        if (txnPool.length <= 0) {
            return undefined;
        }
        return txnPool[txnPool.length - 1];
    }

    start() {
        this.level++;
    }

    end() {
        this.level--;

        if (this.level === 0) {
            this.complete();
        }
    }

    complete() {
        this.onCompleted && this.onCompleted();

        this.lastDpts = this.changedDpts;
        this.changedDpts = {};
        shiftTxn();
    }

    addChangedDpt(dpt) {
        this.changedDpts[dpt.id] = dpt;
    }

    getLastLogs() {
        return Object.values(this.lastDpts).map(dpt => dpt.getLog());
    }
}
