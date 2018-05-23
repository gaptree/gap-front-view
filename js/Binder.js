import {deepAssign} from './fun/deepAssign';
import {Handler} from './Handler';

export class Binder {
    constructor() {
        this.maps = {};
        this.vals = {};
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
        this.getMap(keys).push(new Handler(elem, item));
    }

    getMap(keys) {
        const arr = keys.split('.');
        const key = arr[arr.length - 1];
        let map = this.maps;

        for (let i = 0; i < arr.length - 1; i++) {
            const sub = arr[i];
            if (!map[sub]) {
                map[sub] = {};
            }
            map = map[sub];
        }
        if (!map[key]) {
            map[key] = [];
        }
        return map[key];
    }

    update(data) {
        deepAssign(this.vals, data);

        const deepIn = (maps, vals) => {
            for (const key in maps) {
                if (!maps.hasOwnProperty(key)) {
                    continue;
                }

                const val = vals[key];
                const map = maps[key];

                if (val instanceof Object) {
                    if (map instanceof Object) {
                        deepIn(map, val);
                    }
                } else {
                    if (map instanceof Array) {
                        map.forEach(handler => {
                            handler.update(val);
                        });
                    }
                }
            }
        };

        deepIn(this.maps, this.vals);
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
