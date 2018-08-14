import {GapTxn} from './GapTxn';

export class GapCommitTxn extends GapTxn {
    onCompleted() {
        const ids = Object.keys(this.changedDpts);
        if (ids.length === 0) {
            return;
        }

        //console.log('>>> commit changing <<<');
        ids.forEach(id => {
            const dpt = this.changedDpts[id];
            dpt.commitChanging();
        });
    }
}
