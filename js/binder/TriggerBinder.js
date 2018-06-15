import {getFun} from '../lib/holder';
import {BinderBase} from './BinderBase';
import {GapTpl} from '../GapTpl';
//import {GapProxy} from '../GapProxy';

let triggerIndex = 0;

export class TriggerBinder extends BinderBase {
    constructor(elem, proxy) {
        super();

        this.elem = elem;
        this.triggerId = 'trigger-' + triggerIndex++;
        //this.proxy = new GapProxy();
        this.proxy = proxy;
        this.bind = this.elem.getAttribute('trigger');

        this.tplBuilderHandle = getFun(this.elem.innerHTML.trim());

        ['trigger'].forEach(attrName => this.elem.removeAttribute(attrName));

        this.elem.innerHTML = '';
    }

    tplBuilder(item, data) {
        if (!this.tplBuilderHandle) {
            throw new Error('cannot find tpl builder handle');
        }
        return this.tplBuilderHandle(item, data);
    }

    update(inVal) {
        const val = this.parseVal(inVal);
        if (val === undefined) {
            return;
        }
        const tpl = this.tplBuilder(val, this.proxy.data);
        this.elem.innerHTML = '';

        if (tpl instanceof GapTpl) {
            this.elem.appendChild(tpl.frag);
            this.proxy.onceCommitChange(() => {
                this.proxy.compile(tpl, this.triggerId);
                this.proxy.changedByScope(this.triggerId);
            });
            return;
        }

        if (typeof tpl === 'string') {
            this.elem.innerHTML = tpl;
        }
    }
}
