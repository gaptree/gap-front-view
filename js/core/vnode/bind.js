import {getFun} from '../holder';
import {View} from '../../View';

export const bind = (vnode, tpl) => {
    if (tpl instanceof View) {
        vnode.addObserver('view', tpl);
        return;
    }

    const bindElem = (elem) => {
        if (!elem.attributes) {
            return;
        }

        const toRemoves = [];

        for (const attr of elem.attributes) {
            const attrName = attr.name;
            const attrVal = attr.value;
            const sepIndex = attrName.indexOf('-');

            if (sepIndex <= 0) {
                continue;
            }

            const pre = attrName.substr(0, sepIndex);
            const type = attrName.substr(sepIndex + 1);

            if (pre === 'on') {
                elem.on(type, (e) => getFun(attrVal)(elem, e));
                toRemoves.push(attrName);
            } else if (pre === 'cb') {
                elem.cb(type, (e) => getFun(attrVal)(elem, e));
                toRemoves.push(attrName);
            } else if (pre === 'bind') {
                vnode.vnode(attrVal).addObserver(type, elem);
                toRemoves.push(attrName);
            }
        }

        toRemoves.forEach(attr => elem.removeAttribute(attr));

        bindElemCollection(elem.children);
    };

    const bindElemCollection = (elemCollection) => {
        for (const elem of elemCollection) {
            bindElem(elem);
        }
    };

    for (const elem of tpl.elems) {
        bindElem(elem);
    }
};
