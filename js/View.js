import {createElem} from './fun/createElem';
import {Binder} from './Binder';
//import {deepAssign} from './fun/deepAssign';

let ViewIndex = 1;

export class View {
    static get tag() { return null; }

    constructor(data = {}) {
        this.children = {};
        this.binder = new Binder();

        this.vid = 'gv' + ViewIndex++;
        this.ctn = createElem(this.constructor.tag || 'template');
        this.ctn.innerHTML = this.template();

        this.binder.bind(this.ctn);
        this.binder.update(data);

        this.ctn.allElem('gap-view')
            .forEach(holder => holder.replace(this.children[holder.getAttribute('vid')].elem));

        // deprecated
        this.init();
        this.render();
        this.startup();
    }

    update(data) {
        this.binder.update(data);

        this.handleUpdate(); // todo deprecated
        return this;
    }

    get data() {
        return this.binder.data;
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

    html(strs, ...items) {
        const raw = strs.raw;
        const arr = [];

        const createViewHolder = (item) => {
            return `<gap-view vid="${item.vid}"></gap-view>`;
        };

        const toStr = (item) => {
            let str = '';
            if (typeof item === 'string') {
                str = item;
            } else if (Array.isArray(item)) {
                str = item.map(sub => toStr(sub)).join('');
            } else if (item instanceof View) {
                str = createViewHolder(item);
            } else if (typeof item === 'function') {
                str = this.binder.createHandlerHolder(item);
            }

            return str.trim();
        };

        items.forEach((item, index) => {
            let lit = raw[index];
            let val = toStr(item);

            if (lit.endsWith('$')) {
                arr.push(lit.slice(0, -1));
                arr.push(this.binder.createTextHolder(val));
                return;
            }
            arr.push(lit);
            arr.push(val);
        });

        arr.push(raw[raw.length - 1]);
        return arr.join('').replace(/\s+/g, ' ').trim();
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
