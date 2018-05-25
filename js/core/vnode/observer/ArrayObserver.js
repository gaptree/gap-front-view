import {getFun} from '../../holder';
import {ObserverBase} from './ObserverBase';
import {createElem} from '../../../lib/createElem';

export class ArrayObserver extends ObserverBase {
    constructor(elem, vnode) {
        super(elem);
        this.vnode = vnode;

        this._tplFunId = this.elem.innerHTML.trim();
        this.elem.innerHTML = '';
    }

    update(inVal) {
        const arr = this.parseVal(inVal);
        const stack = createElem('div');

        while (this.elem.firstChild) {
            stack.appendChild(this.elem.firstChild);
        }

        arr.forEach(item => {
            const vnode = this.getVnodeByItem(item);
            this.elem.appendChild(vnode.tpl.frag);
        });

        // todo
        // remove item in frag
    }

    getVnodeByItem(item) {
        const key = this.getKey(item);
        const tpl = this.getTpl(item);
        const vnode = this.vnode.vnode(key);

        if (!vnode.isBinded()) {
            vnode.bind(tpl);
        }
        vnode.update(item);
        return vnode;
    }

    push(item) {
        const vnode = this.getVnodeByItem(item);
        this.elem.appendChild(vnode.tpl.frag);
    }

    remove(item) {
        const key = this.getKey(item);
        const vnode = this.vnode.vnode(key);
        vnode.tpl && vnode.tpl.remove();
    }

    clear() {
        this.elem.innerHTML = '';
    }

    getTpl(item) {
        return this.getTplFun()(item);
    }

    getKey(item) {
        return this.getKeyFun()(item);
    }

    getTplFun() {
        this._tplFun = this._tplFun || getFun(this.getTplFunId());
        return this._tplFun;
    }

    getKeyFun() {
        this._keyFun = this._keyFun || getFun(this.getKeyFunId());
        return this._keyFun;
    }

    getTplFunId() {
        if (this._tplFunId) {
            return this._tplFunId;
        }
        throw new Error('Cannot find tpl fun');
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
