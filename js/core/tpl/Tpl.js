import {createElem} from '../../lib/createElem';
import {
    createNodeHolder,
    createFunHolder,
    createTextHolder,
    getNode
} from '../holder';

export class Tpl {
    constructor(strs, ...items) {
        this.ctn = createElem('template');
        this.ctn.innerHTML = this.tpl(strs, ...items);

        this.ctn.allElem('gap-node').forEach(holder => {
            const nodeId = holder.getAttribute('node-id');
            const node = getNode(nodeId);
            holder.replace(node);
        });
    }

    get elem() {
        return this.ctn.content;
    }

    tpl(strs, ...items) {
        const raw = strs.raw;
        const arr = [];

        const toStr = (item) => {
            let str = '';

            if (Array.isArray(item)) {
                str = item.map(sub => toStr(sub)).join('');
            } else if (typeof item === 'function') {
                str = createFunHolder(item);
            } else if (item && item.elem instanceof Node) {
                str = createNodeHolder(item.elem);
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
