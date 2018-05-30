import {createElem} from './lib/createElem';
import {View} from './View';
import {toFrag} from './lib/toFrag';
import {
    createNodeHolder,
    createFunHolder,
    createViewHolder,
    createTextHolder,
    getNode
} from './lib/holder';

export class GapTpl {
    constructor(strs, ...items) {
        this.views = [];
        this.ctn = createElem('div');
        this.ctn.innerHTML = this.html(strs, ...items);

        this.ctn.allElem('gap-node').forEach(holder => {
            const nodeId = holder.getAttribute('node-id');
            const node = getNode(nodeId);
            holder.replace(node);
        });
    }

    createViewHolder(view) {
        this.views.push(view);
        return createViewHolder(view);
    }

    get elems() {
        if (this._elems) {
            return this._elems;
        }

        this._elems = [];
        for (const elem of this.ctn.children) {
            this._elems.push(elem);
        }
        return this._elems;
    }

    get frag() {
        return toFrag(this.elems);
    }

    remove() {
        this.elems.forEach(elem => elem.remove());
        this.views.forEach(view => view.remove());
    }

    html(strs, ...items) {
        const raw = strs.raw;
        const arr = [];

        const toStr = (item) => {
            if (!item) {
                return '';
            }

            let str = '';

            if (Array.isArray(item)) {
                str = item.map(sub => toStr(sub)).join('');
            } else if (typeof item === 'function') {
                str = createFunHolder(item);
            } else if (item instanceof Node) {
                str = createNodeHolder(item);
            } else if (item instanceof View) {
                str = this.createViewHolder(item);
            } else if (item instanceof GapTpl) {
                str = item.elems.map(sub => toStr(sub)).join('');
            } else {
                str = item;
            }

            return str.trim();
        };

        items.forEach((item, index) => {
            let lit = raw[index];
            let val = toStr(item);

            if (lit.endsWith('$')) {
                arr.push(lit.slice(0, -1));
                arr.push(createTextHolder(val));
                return;
            }
            arr.push(lit);
            arr.push(val);
        });

        arr.push(raw[raw.length - 1]);
        return arr.join('').replace(/\s+/g, ' ').trim();
    }
}
