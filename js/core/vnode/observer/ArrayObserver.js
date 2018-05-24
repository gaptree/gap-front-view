import {getFun} from '../../holder';
import {ObserverBase} from './ObserverBase';

export class ArrayObserver extends ObserverBase {
    constructor(elem, vnode) {
        super(elem);
        this.vnode = vnode;
    }

    update(inVal) {
        const arr = this.parseVal(inVal);
        const tplFun = getFun(this.getTplFunId());
        const keyFun = getFun(this.getKeyFunId());

        arr.forEach(item => {
            const key = keyFun(item);
            const tpl = tplFun();

            const vnode = this.vnode.vnode(key);
            if (!vnode.isBinded()) {
                vnode.bind(tpl);
                this.elem.appendChild(tpl.elem);
            }
            vnode.update(item);
        });
    }

    getTplFunId() {
        if (this._tplFunId) {
            return this._tplFunId;
        }

        this._tplFunId = this.elem.innerHTML.trim();
        this.elem.innerHTML = '';
        return this._tplFunId;
    }

    getKeyFunId() {
        if (this._keyFunId) {
            return this._keyFunId;
        }

        const attrName = 'arr-key'; // todo arr-key may changed
        this._keyFunId = this.elem.getAttribute(attrName);
        this.elem.removeAttribute(attrName);
        return this._keyFunId;
    }
}
