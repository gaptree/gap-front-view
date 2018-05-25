import {createElem} from './lib/createElem';
import {toFrag} from './lib/toFrag';
import {Vnode} from './core/vnode/Vnode';
import {gapTpl} from './core/gapTpl';

let ViewIndex = 1;

export class View {
    static get tag() { return null; }

    constructor(data = {}) {
        this.vnode = new Vnode();

        this.vid = 'gv' + ViewIndex++;
        this.ctn = createElem(this.constructor.tag || 'template');

        this.tpl = this.template();

        if (this.tpl) {
            this.vnode.bind(this.tpl);
        }
        if (data) {
            this.vnode.update(data);
        }

        // deprecated
        this.init();
        this.render();
        this.startup();
    }

    get elems() {
        if (this._elems) {
            return this._elems;
        }

        if (this.ctn.tagName === 'TEMPLATE' && this.tpl) {
            this._elems = this.tpl.elems;
            return this._elems;
        }

        if (this.tpl) {
            this.ctn.appendChild(this.tpl.frag);
        }

        this._elems = [this.ctn];
        return this._elems;
    }

    get frag() {
        return toFrag(this.elems);
    }

    update(data) {
        this.vnode.update(data);

        this.handleUpdate(); // todo deprecated
        return this;
    }

    setData(key, val) {
        this.vnode.setData(key, val);
    }

    getData(key) {
        return this.vnode.getData(key);
    }

    arrPush(key, item) {
        this.vnode.arrPush(key, item);
    }

    arrPop(key) {
        this.vnode.arrPop(key);
    }

    arrFilter(key, handle) {
        this.vnode.arrFilter(key, handle);
    }

    // deprecated
    get data() {
        console.warn('please use {View.getData(key)} instead of {View.data.key}'); // eslint-disable-line
        return this.vnode.data;
    }

    template() {
        return '';
    }

    html(strs, ...items) {
        return gapTpl(strs, ...items);
    }

    appendTo(elem) {
        if (!(elem instanceof Node)) {
            return;
        }

        elem.appendChild(this.frag);
    }

    remove() {
        if (this.tpl) {
            this.tpl.remove();
        }
    }

    // deprecated
    init() {}
    render() {}
    startup() {}
    handleUpdate() {}
}
