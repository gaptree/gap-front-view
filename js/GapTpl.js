import {View} from './View';
import {createElem} from './lib/createElem';

import {nodeHolder} from './holder/nodeHolder';
import {funHolder} from './holder/funHolder';
import {objHolder} from './holder/objHolder';
import {viewHolder} from './holder/viewHolder';
import {textHolder} from './holder/textHolder';

export class GapTpl {
    constructor(strs, ...items) {
        this.views = [];
        this.ctn = createElem('div');
        this.ctn.innerHTML = this.html(strs, ...items);

        this.ctn.allElem('gap-node').forEach(holder => {
            const node = nodeHolder.get(holder.getAttribute('node-id'));
            holder.replace(node);
        });
    }

    get nodes() {
        return this.ctn.childNodes;
    }

    holdFun(fun) {
        return funHolder.hold(fun);
    }

    holdObj(obj) {
        return objHolder.hold(obj);
    }

    holdNode(node) {
        return nodeHolder.hold(node);
    }

    holdView(view) {
        this.views.push(view);
        return viewHolder.hold(view);
    }

    holdText(text) {
        return textHolder.hold(text);
    }

    remove() {
        this.nodes.forEach(node => node.remove());
        this.views.forEach(view => view.remove());
    }

    parseHolderStr(item) {
        if (!item) {
            return '';
        }
        let str = '';
        if (typeof item === 'string') {
            str = item;
        } else if (Array.isArray(item)) {
            str = item.map(sub => this.parseHolderStr(sub)).join('');
        } else if (typeof item === 'function') {
            str = this.holdFun(item);
        } else if (item instanceof Node) {
            str = this.holdNode(item);
        } else if (item instanceof View) {
            str = this.holdView(item);
        } else if (item instanceof GapTpl) {
            str = item.nodes.map(sub => this.holdNode(sub)).join('');
        } else if (item instanceof Object) {
            str = this.holdObj(item);
        } else {
            throw new Error('unknown format');
        }
        return str.trim();
    }

    html(strs, ...items) {
        const raw = strs.raw;
        const arr = [];

        items.forEach((item, index) => {
            const lit = raw[index];
            const holderStr = this.parseHolderStr(item);

            if (lit.endsWith('$')) {
                arr.push(lit.slice(0, -1));
                arr.push(this.holdText(holderStr));
                return;
            }

            arr.push(lit);
            arr.push(holderStr);
        });

        arr.push(raw[raw.length - 1]);
        return arr.join('').replace(/\s+/g, ' ').trim();
    }
}
