export class GapTxn {
    constructor() {
        this.level = 0;
        this.changedDpts = {};
    }

    start() {
        this.level++;
        //console.log('start changing', this.level);
    }

    end() {
        this.level--;

        //console.log('end changing', this.level);
        if (this.level === 0) {
            this.commit();
        }
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
