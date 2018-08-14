import {GapTxnBase} from './GapTxnBase';

export class GapTxn extends GapTxnBase {
    constructor() {
        super();
        this.changedDpts = {};
    }

    commit() {
        const ids = Object.keys(this.changedDpts);
        if (ids.length === 0) {
            return;
        }

        console.log('>>> commit changing <<<');
        ids.forEach(id => {
            const dpt = this.changedDpts[id];
            dpt.commitChanging();
        });
        this.changedDpts = {};
    }

    addChangedDpt(dpt) {
        this.changedDpts[dpt.id] = dpt;
    }
}
