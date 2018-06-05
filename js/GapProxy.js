import {getFun} from './lib/holder';
import {ElemPropBinder} from './binder/ElemPropBinder';
import {ViewBinder} from './binder/ViewBinder';
import {TextNodeBinder} from './binder/TextNodeBinder';
import {ArrBinder} from './binder/ArrBinder';
import {TriggerBinder} from './binder/TriggerBinder';
import {GapWrap} from './GapWrap';

const parseDataProp = (inProp) => {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
    const [name, filterStr] = inProp.split('|');
    const filter = filterStr
        && filterStr.indexOf('$$') === 0
        && getFun(filterStr);
    return {name, filter};
};

//const wraps = {};

export class GapProxy {
    constructor(data = {}) {
        this.data = data;
        this.wraps = {};
        this.scopeWraps = {};
    }

    updateAll(inData) {
        this.deepUpdate(this.data, inData);
    }

    deepUpdate(res, inSrc) {
        if (!(res instanceof Object)) {
            return;
        }

        if (!(inSrc instanceof Object)) {
            return;
        }

        const src = Object.assign({}, inSrc);

        this.startChange();

        Object.keys(res).forEach(key => {
            if (!src[key]) {
                res[key] = undefined;
                return;
            }

            const srcItem = src[key];
            delete(src[key]);

            if (res[key] instanceof Array
                && srcItem instanceof Array
            ) {
                res[key] = srcItem;
                return;
            }

            if (res[key] instanceof Object
                && srcItem instanceof Object
            ) {
                this.deepUpdate(res[key], srcItem);
                return;
            }

            res[key] = srcItem;
        });

        Object.keys(src).forEach(key => {
            res[key] = src[key];
        });

        this.commitChange();
    }

    changed() {
        Object.keys(this.wraps).forEach(key => this.wraps[key].changed());
    }

    changedByScope(scope) {
        if (scope) {
            Object.keys(this.scopeWraps[scope]).forEach(key => {
                this.scopeWraps[scope][key].changedByScope(scope);
            });
            return;
        }
    }

    getWrap(prop) {
        this.scopeWraps[this.scope] = this.scopeWraps[this.scope] || {};
        if (this.scopeWraps[this.scope][prop]) {
            return this.scopeWraps[this.scope][prop];
        }

        this.wraps[prop] = this.wraps[prop] || new GapWrap();
        this.wraps[prop].clearScope(this.scope);
        this.scopeWraps[this.scope][prop] = this.wraps[prop];
        return this.scopeWraps[this.scope][prop];
    }

    hasWrap(prop) {
        return this.wraps[prop] ? true : false;
    }

    defineQuery(inObj, oriQuery, inQuery = null) {
        const query = inQuery || oriQuery;
        const pos = query.indexOf('.');

        const prop = pos < 0 ? query : query.substr(0, pos);
        const nextQuery = pos < 0 ? '' : query.substr(pos + 1);

        if (nextQuery) {
            inObj[prop] = inObj[prop] || {};
            this.defineProp(inObj, oriQuery.substr(0, oriQuery.indexOf(nextQuery) - 1), prop);
            this.defineQuery(inObj[prop], oriQuery, nextQuery);
            return;
        }

        this.defineProp(inObj, oriQuery, prop);
    }

    defineProp(inObj, oriQuery, prop) {
        const descriptor = Object.getOwnPropertyDescriptor(inObj, prop);
        if (descriptor && descriptor.configurable === false) {
            return;
        }

        const val = inObj[prop];
        const wrap = this.getWrap(oriQuery);
        wrap.setVal(val);

        Object.defineProperty(inObj, prop, {
            enumerable: true,
            configurable: true,
            get: () => wrap.getVal(),
            set: (defVal) => {
                if (wrap.isEqual(defVal)) {
                    return;
                }

                this.startChange();

                // todo
                if (defVal instanceof Array) {
                    wrap.setVal(defVal);
                } else if (defVal instanceof Object) {
                    const wrapVal = wrap.getVal();
                    if (wrapVal instanceof Object) {
                        this.deepUpdate(wrap.getVal(), defVal);
                    } else {
                        wrap.setVal(defVal);
                    }
                } else {
                    wrap.setVal(defVal);
                }

                this.changedRecursive(oriQuery);
                this.commitChange();
            }
        });
    }

    compile(tpl, scope = '') {
        this.scope = scope;
        this.isCompiling = true;
        tpl.elems.forEach(tplElem => this.compileNode(tplElem));
        this.isCompiling = false;
    }

    compileNode(node) {
        if (!node.attributes) {
            return;
        }

        if (node._compiled) {
            return;
        }

        node._compiled = true;

        if (node.tagName === 'GAP-VIEW') {
            this.compileGapView(node);
        } else if (node.tagName === 'GAP-TEXT') {
            this.compileGapText(node);
        } else {
            this.compileElem(node);
        }

        this.compileNodeCollection(node.children);
    }

    compileNodeCollection(nodeCollection) {
        for (const node of nodeCollection) {
            this.compileNode(node);
        }
    }

    compileGapView(node) {
        this.addBinder(node.getAttribute('bind'), new ViewBinder(node));
    }

    compileGapText(node) {
        this.addBinder(node.getAttribute('bind'), new TextNodeBinder(node));
    }

    compileElem(elem) {
        const toRemoves = [];

        for (const attr of elem.attributes) {
            const attrName = attr.name;
            const attrVal = attr.value;

            if (attrName === 'arr' || attrName === 'array') {
                this.addBinder(attrVal, new ArrBinder(elem));
                continue;
            }

            if (attrName === 'ref') {
                getFun(attrVal)(elem);
                toRemoves.push(attrName);
                continue;
            }

            if (attrName === 'trigger') {
                this.addBinder(attrVal, new TriggerBinder(elem, this));
                continue;
            }

            const sepIndex = attrName.indexOf('-');

            if (sepIndex <= 0) {
                continue;
            }

            const pre = attrName.substr(0, sepIndex);
            const type = attrName.substr(sepIndex + 1);

            if (pre === 'on') {
                elem.on(type, getFun(attrVal));
                toRemoves.push(attrName);
            } else if (pre === 'cb') {
                elem.cb(type, getFun(attrVal));
                toRemoves.push(attrName);
            } else if (pre === 'bind') {
                this.addBinder(attrVal, new ElemPropBinder(elem, type));
                toRemoves.push(attrName);
            //} else if (pre === 'trigger') {
            //    this.addTrigger(type.replace(/-/g, '.'), getFun(attrVal));
            //    toRemoves.push(attrName);
            }
        }

        toRemoves.forEach(attrName => elem.removeAttribute(attrName));
    }


    addBinder(attrQuery, binder) {
        const dataProp = parseDataProp(attrQuery);
        this.defineQuery(this.data, dataProp.name);

        const wrap = this.getWrap(dataProp.name);
        binder.onFilter(dataProp.filter);
        wrap.addBinder(this.scope, binder);
    }

    get changeQueries() {
        this._changeQueries = this._changeQueries || {};
        return this._changeQueries;
    }

    changedRecursive(oriQuery) {
        let query = oriQuery;
        while(query) {
            if (this.hasWrap(query)) {
                this.changeQueries[query] = 1;
                //this.getWrap(query).changed();
            }

            const pos = query.lastIndexOf('.');
            if (pos < 0) {
                break;
            }
            query = query.substr(0, pos);
        }
    }

    startChange() {
        if (this.isCompiling) {
            return;
        }

        this._changeLevel = this._changeLevel || 0;
        this._changeLevel++;
        if (this._changeLevel > 1) {
            return;
        }

        this._changeQueries = {};
    }

    commitChange() {
        if (this.isCompiling) {
            return;
        }

        if (this._changeLevel <= 0) {
            this._changeLevel = 0;
            throw new Error('commit change failed');
        }

        this._changeLevel--;
        if (this._changeLevel > 0) {
            return;
        }

        Object.keys(this.changeQueries).forEach(query => this.getWrap(query).changed());

        if (this.handleOnceCommitChange) {
            this.handleOnceCommitChange();
            this.handleOnceCommitChange = null;
        }
    }

    onceCommitChange(handle) {
        this.handleOnceCommitChange = handle;
    }
}
