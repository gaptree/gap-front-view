import {createElem} from './lib/createElem';
import {Vnode} from './core/vnode/Vnode';
import {tpl} from './core/tpl';

let ViewIndex = 1;

export class View {
    static get tag() { return null; }

    constructor(data = {}) {
        this.vnode = new Vnode();

        this.vid = 'gv' + ViewIndex++;
        this.ctn = createElem(this.constructor.tag || 'template');

        const template = this.template();

        this.vnode.bind(template);
        this.vnode.update(data);

        this.elem.appendChild(template.elem);

        // deprecated
        this.init();
        this.render();
        this.startup();
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

    // deprecated
    get data() {
        console.warn('please use {View.getData(key)} instead of {View.data.key}'); // eslint-disable-line
        return this.vnode.data;
    }

    get elem() {
        if (this.ctn.tagName === 'TEMPLATE') {
            return this.ctn.content;
        }
        return this.ctn;
    }

    template() {
        return '';
    }

    tpl(strs, ...items) {
        return tpl(strs, ...items);
    }

    appendTo(elem) {
        if (elem instanceof Node) {
            elem.appendChild(this.elem);
        }
    }

    // deprecated
    init() {}
    render() {}
    startup() {}
    handleUpdate() {}
}
