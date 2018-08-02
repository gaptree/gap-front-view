export class GapTxn {
    constructor() {
        this.level = 0;
        this.changed = {};
        this.changedDpts = {};
        this.changedProps = [];
        this.isDisabled = false;
    }

    start() {
        if (this.isDisabled) {
            return;
        }
        this.level++;
        //console.log('start changing', this.level);
    }

    end() {
        if (this.isDisabled) {
            return;
        }
        this.level--;

        //console.log('end changing', this.level);
        if (this.level === 0) {
            this.commit();
        }
    }

    disable() {
        this.isDisabled = true;
    }

    enable() {
        this.isDisabled = false;
    }

    commit() {
        const ids = Object.keys(this.changedDpts);
        if (ids.length === 0) {
            return;
        }

        console.log('>>> commit changing <<<');
        //console.log(this.changedProps);

        ids.forEach(id => {
            const dpt = this.changedDpts[id];
            dpt.commitChanging();
        });
        this.changedDpts = {};
    }

    addChangedDpt(dpt) {
        this.changedDpts[dpt.id] = dpt;
    }

    addChangedProp(prop) {
        this.changedProps.push([this.level, prop]);
        //console.log('addChangedProp', this.changedProps);
    }
}
