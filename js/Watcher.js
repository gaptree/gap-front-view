import {funHolder} from './holder/funHolder';
import {GapTpl} from './GapTpl';

export class Watcher {
    constructor(elem) {
        this.elem = elem;
        this.tplHandler = funHolder.get(this.elem.innerHTML.trim());
        this.elem.innerHTML = '';
    }

    getTpl(item) {
        if (!this.tplHandler) {
            throw new Error('cannot find tpl handler');
        }
        return this.tplHandler(item);
    }

    update(val) {
        if (val === undefined) {
            return;
        }

        const tpl = this.getTpl(val);
        this.elem.innerHTML = '';

        if (typeof tpl === 'string') {
            this.currentTpl = null;
            this.elem.innerHTML = tpl;
            return;
        }

        if (tpl instanceof GapTpl) {
            if (tpl.nodes[1]) {
                throw new Error(`tpl of watcher must be encapsulated in one html element: \n ${tpl.ctn.innerHTML}`);
            }
            this.currentTpl = tpl;
            this.elem.appendChild(tpl.nodes[0]);
        }
    }
}
