export class GapDptManager {
    constructor() {
        this.changingLevel = 0;
        this.changedDpts = {};
        this.isCompiling = false;
    }

    startChanging() {
        //console.log('start changing', this.changingLevel);
        if (this.isCompiling) {
            return;
        }
        this.changingLevel++;
    }

    endChanging() {
        //console.log('end changing', this.changingLevel);
        if (this.isCompiling) {
            return;
        }
        this.changingLevel--;

        if (this.changingLevel === 0) {
            this.commitChanging();
        }
    }

    startCompiling() {
        this.isCompiling = true;
    }

    endCompiling() {
        this.isCompiling = false;
    }

    commitChanging() {
        console.log('>>> commit changing <<<');
        Object.keys(this.changedDpts).forEach(key => {
            const dpt = this.changedDpts[key];
            dpt.commitChanging();
        });
        this.changedDpts = {};
    }

    addChangedDpt(dpt) {
        this.changedDpts[dpt.id] = dpt;
    }
}
