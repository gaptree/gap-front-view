import {deepAssign} from './fun/deepAssign';
import {Observer} from './Observer';
import {Vnode} from './Vnode';

export class Binder {
    constructor() {
        this.vnode = new Vnode();
        this.data = {};

        this.handlers = {};
        this.handlerIndex = 0;
    }

    setHandler(index, handler) {
        this.handlers[index] = handler;
    }

    bind(srcElem) {
        const bindElem = (elem) => {
            if (!elem.attributes) {
                return;
            }

            const toRemoves = [];
            for (const attr of elem.attributes) {
                const name = attr.name;
                const value = attr.value;
                const sepIndex = name.indexOf('-');

                if (sepIndex > 0) {
                    const pre = name.substr(0, sepIndex);
                    const type = name.substr(sepIndex + 1);

                    if (pre === 'on') {
                        elem.on(type, (e) => this.handlers[parseInt(value)](elem, e));
                        toRemoves.push(name);
                    } else if (pre === 'cb') {
                        elem.cb(type, (e) => this.handlers[parseInt(value)](elem, e));
                        toRemoves.push(name);
                    } else if (pre === 'bind') {
                        this.mapElemItem(value, elem, type);
                        toRemoves.push(name);
                    }
                }
            }

            toRemoves.forEach(name => elem.removeAttribute(name));
        };

        const bindCollection = (elems) => {
            for (const elem of elems) {
                bindElem(elem);
                bindCollection(elem.children);
            }
        };

        /*
        srcElem.innerHTML.replace(/\{\{([^{}]+)\}\}/g, (match, arg) => {
            return `<gap-text bind-textNode="${arg}">`;
        });
        */

        let dstElem;
        if (srcElem.tagName === 'TEMPLATE') {
            dstElem = srcElem.content;
        } else {
            dstElem = srcElem;
            bindElem(srcElem);
        }

        bindCollection(dstElem.children);
    }

    mapElemItem(keys, elem, item) {
        this.vnode.vnode(keys).addObserver(new Observer(elem, item));
    }

    update(data) {
        deepAssign(this.data, data);

        const deepIn = (rootVnode, vals) => {
            for (const key in vals) {
                if (!vals.hasOwnProperty(key)) {
                    continue;
                }
                const vnode = rootVnode.vnode(key);
                const val = vals[key];

                vnode.observers.forEach(observer => observer.update(val));
                if (vnode.hasChildren() && val instanceof Object) {
                    deepIn(vnode, val);
                }
            }
        };

        deepIn(this.vnode, data);
    }

    createTextHolder(key) {
        return `<gap-text bind-text-node="${key}"></gap-text>`;
    }

    createHandlerHolder(handler) {
        this.setHandler(this.handlerIndex, handler);
        const holder = '"' + this.handlerIndex + '"';
        this.handlerIndex++;
        return holder;
    }

}
