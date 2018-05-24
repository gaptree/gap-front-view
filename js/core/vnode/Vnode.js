const elemProps = [
    'id',
    'name',
    'checked'
];

import {ArrayObserver} from './observer/ArrayObserver';
import {AttrObserver} from './observer/AttrObserver';
import {ClassObserver} from './observer/ClassObserver';
import {PropObserver} from './observer/PropObserver';
import {TextObserver} from './observer/TextObserver';
import {ValObserver} from './observer/ValObserver';
import {bind} from './bind';

export class Vnode {
    constructor() {
        this.children = {};
        this.observers = [];
        this.tpl = null;
        this.val = null;
    }

    // deprecated
    get data() {
        const data = {};
        for (const key in this.children) {
            if (this.children.hasOwnProperty(key)) {
                data[key] = this.children[key].val;
            }
        }
        return data;
    }

    vnode(keys) {
        let node = this;
        keys.split('.').forEach(key => {
            if (!node.children.hasOwnProperty(key)) {
                node.children[key] = new Vnode();
            }
            node = node.children[key];
        });
        return node;
    }

    setData(key, val) {
        this.updateVnodeVal(
            this.vnode(key),
            val
        );
    }

    getData(key) {
        return this.vnode(key).val;
    }

    updateVnodeVal(vnode, inVal) {
        const val = (typeof inVal === 'function') ?
            inVal() : inVal;
        vnode.observers.forEach(observer => observer.update(val));
        vnode.val = val;
    }

    update(data) {
        const deepIn = (rootVnode, vals) => {
            for (const key in vals) {
                if (!vals.hasOwnProperty(key)) {
                    continue;
                }
                const vnode = rootVnode.vnode(key);
                const val = vals[key];

                this.updateVnodeVal(vnode, val);
                //vnode.observers.forEach(observer => observer.update(val));
                if (vnode.hasChildren() && val instanceof Object) {
                    deepIn(vnode, val);
                }
            }
        };

        deepIn(this, data);
    }

    hasChildren() {
        return Object.keys(this.children).length > 0;
    }

    bind(tpl) {
        bind(this, tpl);
        this.tpl = tpl;
    }

    isBinded() {
        return this.tpl ? true : false;
    }

    addObserver(type, elem) {
        let observer;
        if (type === 'val' || type === 'value') {
            observer = new ValObserver(elem);
        } else if (type === 'class' || type === 'className') {
            observer = new ClassObserver(elem);
        } else if (elemProps.includes(type)) {
            observer = new PropObserver(elem, type);
        } else if (type === 'text' || type === 'text-node') {
            observer = new TextObserver(elem);
        } else if (type === 'arr' || type === 'array') {
            observer = new ArrayObserver(elem, this);
        } else {
            observer = new AttrObserver(elem, type);
        }

        this.observers.push(observer);
    }
}
