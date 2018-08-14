export class GapTxnBase {
    constructor() {
        this.level = 0;
    }

    start() {
        this.level++;
    }

    end() {
        this.level--;

        if (this.level === 0) {
            this.commit();
        }
    }

    commit() {
    }
}
