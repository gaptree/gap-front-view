export class GapTxn {
    constructor() {
        this.level = 0;
        this.changedDpts = {};
        this.lastDpts = {};
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
    }

    addChangedDpt(dpt) {
        this.changedDpts[dpt.id] = dpt;
    }
}
