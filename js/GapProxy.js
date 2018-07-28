import {funHolder} from './holder/funHolder';

import {GapWrap} from './GapWrap';
import {GapCompiler} from './GapCompiler';

export class GapProxy {
    constructor(data = {}) {
        this.data = data;
        this.wraps = {};

        this.changedQueries = {};
        this.definedQueries = {};
    }

    update(data) {
        //console.log('GapProxy.update', data);
        this.startChanging();
        this.fullUpdate(this.data, data);
        this.endChanging();
    }

    /*
    updateRecur(res, inSrc, pre = '') {
        if (!(res instanceof Object)) {
            throw new Error('GapProxy.deepAssign, 1st param require Object');
        }
        if (!(inSrc instanceof Object)) {
            throw new Error('GapProxy.deepAssign, 2nd param require Object');
        }
        //console.log('GapProxy.updateRecur', res, inSrc);
        const src = Object.assign({}, inSrc);
        Object.keys(res).forEach(key => {
            if (!src.hasOwnProperty(key)) {
                //delete(res[key]);
                //res[key] = undefined;
                this.undefineObjProp(res, key);
                return;
            }
            //const srcItem = src[key];
            res[key] = src[key]; //srcItem;
            delete(src[key]);
        });

        Object.keys(src).forEach(key => {
            //this.defineDataProp(res, key, pre);
            res[key] = src[key];
        });
    }
    */

    undefineObjProp(obj, prop) {
        if (obj[prop] instanceof Object) {
            Object.keys(obj[prop]).forEach(key => this.undefineObjProp(obj[prop], key));
            return;
        }
        obj[prop] = undefined;
    }

    /*
    defineDataProp(src, prop, pre = '') {
        const query = pre ? `${pre}.${prop}` : prop;
        if (this.definedQueries[query]) {
            return;
        }

        this.definedQueries[query] = 1;
        console.log('GapProxy.defineDataProp', query);

        let currentVal;
        Object.defineProperty(src, prop, {
            enumerable: true,
            configurable: true,
            get: () => currentVal,
            set: (defVal) => {
                this.startChanging();
                if (defVal instanceof Object) {
                    currentVal = currentVal || {};
                    if (!(currentVal instanceof Object)) {
                        throw new Error('not match');
                    }
                    this.updateRecur(currentVal, defVal, query);
                } else {
                    if (currentVal !== defVal) {
                        console.log(`[${query}] ${currentVal} => ${defVal}`);
                        currentVal = defVal;
                        this.recordChangedQuery(query);
                    }
                }
                this.endChanging();
            }
        });
    }
    */

    /*
    deepUpdate(res, inSrc) {
        if (!(res instanceof Object)) {
            throw new Error('GapProxy.deepAssign, 1st param require Object');
        }
        if (!(inSrc instanceof Object)) {
            throw new Error('GapProxy.deepAssign, 2nd param require Object');
        }

        const src = Object.assign({}, inSrc);
        Object.keys(res).forEach(key => {
            if (!src.hasOwnProperty(key)) {
                //delete(res[key]);  May not trigger Object.defineProperty
                res[key] = undefined;
                return;
            }

            const srcItem = src[key];
            delete(src[key]);

            if (res[key] instanceof Object) {
                if (srcItem instanceof Array) {
                    res[key] = srcItem;
                    return;
                }
                if (srcItem instanceof Object) {
                    this.deepUpdate(res[key], srcItem);
                    return;
                }

                throw new Error('GapProxy.deepUpdate: res does not match with src');
            }

            res[key] = srcItem;
        });
    }
    */

    compileTpl(tpl) {
        this.isCompiling = true;
        const compiler = new GapCompiler();
        compiler.compileTpl(tpl);
        Object.keys(compiler.binders).forEach(query => {
            this.defineQuery(query);
            compiler.binders[query].forEach(item => {
                this.addBinder(query, item.binder, item.filter);
            });
        });

        this.watchers = compiler.watchers;
        Object.keys(compiler.watchers).forEach(query => {
            this.defineQuery(query);
            //compiler.watchers[query].forEach(watcher => this.addWatcher(query, watcher));
        });

        //console.log('GapProxy.compileTpl', Object.keys(this.wraps));

        //Object.keys(this.wraps).forEach(query => this.defineQuery(query));
        this.isCompiling = false;
    }

    addBinder(query, binder, filter) {
        const wrap = this.getWrap(query);
        binder.onFilter(filter);
        wrap.addBinder(binder);
    }


    /*
    addWrapSetter(query) {
        if (this.setters[query] && this.setters[query]['wrap']) {
            return;
        }
        this.setters[query]['wrap'] = () => {
            this.startChanging();
            this.recordChangedQuery(query);
            this.endChanging();
        };
    }

    addObjSetter(query) {
        if (this.setters[query] && this.setters[query]['obj']) {
            return;
        }
        this.setters[query]['obj'] = (defVal) => {
        };
    }
    */

    fullUpdate(res, inSrc) {
        //console.log('GapProxy.fullupdate', res, inSrc);
        if (!(res instanceof Object)) {
            throw new Error('GapProxy.deepAssign, 1st param require Object');
        }
        if (!(inSrc instanceof Object)) {
            throw new Error('GapProxy.deepAssign, 2nd param require Object');
        }
        const src = Object.assign({}, inSrc);
        Object.keys(res).forEach(key => {
            if (!src.hasOwnProperty(key)) {
                this.undefineObjProp(res, key);
                return;
            }
            res[key] = src[key];
            delete(src[key]);
        });

        Object.keys(src).forEach(key => {
            res[key] = src[key];
        });
    }

    /*
    getSetter(query) {
        let currentVal;

        return (defVal) => {
            this.startChanging();
            if (defVal instanceof Object) {
                currentVal = currentVal || {};
                if (!(currentVal instanceof Object)) {
                    throw new Error('not match');
                }
                this.fullUpdate(currentVal, defVal);
            } else {
                if (currentVal !== defVal) {
                    console.log(`[${query}] ${currentVal} => ${defVal}`);
                    currentVal = defVal;
                    this.recordChangedQuery(query);
                }
            }
            this.endChanging();
        };
    }
    */

    getDataVal(inQuery) {
        const query = inQuery + '';
        if (query === '') {
            return this.data;
        }
        const lastDotPos = query.lastIndexOf('.');
        const preQuery = lastDotPos < 0 ? '' : query.substr(0, lastDotPos);
        const propName = lastDotPos < 0 ? query : query.substr(lastDotPos + 1);
        const preVal = this.getDataVal(preQuery);
        if (preVal instanceof Object) {
            return preVal[propName];
        }
        throw new Error('cannot get val from query: ' + inQuery);
    }

    startChanging() {
        if (this.isCompiling) {
            return;
        }
        this._changingLevel = this._changingLevel || 0;
        this._changingLevel++;
        //console.log('start changing', this._changingLevel);
        if (this._changingLevel > 1) {
            return;
        }

        //console.log('<<< GapProxy.startChanging >>>');
        this.changedQueries = {};
    }

    endChanging() {
        if (this.isCompiling) {
            return;
        }
        if (this._changingLevel <= 0) {
            this._changingLevel = 0;
            throw new Error('commit changing failed');
        }
        this._changingLevel--;
        //console.log('end changing', this._changingLevel);
        if (this._changingLevel > 0) {
            return;
        }
        this.commitChanging();
    }

    commitChanging() {
        const changedArr = Object.keys(this.changedQueries);
        if (changedArr.length <= 0) {
            return;
        }

        console.log('>>> GapProxy.commitChanging', changedArr, '<<<');

        changedArr.forEach(query => {
            const wrap = this.getWrap(query);

            if (!wrap) {
                return;
            }
            const val = this.getDataVal(query);
            if (wrap.isEqual(val)) {
                return;
            }

            console.log(`[${query}]`, wrap.getVal(),' =>', val);
            wrap.commitChanging(val);
        });

        const watchedArr = [];
        changedArr.forEach(query => {
            const watchers = this.watchers[query];
            if (!watchers) {
                return;
            }
            watchedArr.push({query, watchers});
        });
        if (watchedArr.length >= 1) {
            this.startChanging();
            watchedArr.forEach(item => {
                const {query, watchers} = item;
                watchers.forEach(watcher => watcher.update(this.getDataVal(query)));
            });
            this.endChanging();
        }

        this.changedQueries = {};
    }

    /*
    defineRecur(obj, prop, base) {
        console.log('GapProxy.defineRecur', obj, prop, base);

        const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
        const setter = descriptor && descriptor.set;

        Object.defineProperty(obj, prop, {
            enumerable: true,
            configurable: true,
            get: () => base,
            set: (defVal) => {
                //console.log('-------', defVal);
                if (setter) {
                    setter(defVal);
                }
                this.deepUpdate(base, defVal);
            }
        });
    }
    */

    /*
    defineProp(obj, prop, wrap) {
        const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
        if (descriptor && descriptor.configurable === false) {
            return;
        }

        //console.log('GapProxy.defineProp', wrap, obj, prop);

        let currentVal = obj[prop];
        //wrap.setVal(val);

        const setter = descriptor && descriptor.set;

        Object.defineProperty(obj, prop, {
            enumerable: true,
            configurable: true,
            get: () => currentVal,
            set: (defVal) => {
                //if (wrap.query === 'user') {
                //console.log('000000000000', wrap);
                //}
                //console.log('data.set', defVal, wrap);
                currentVal = defVal;
                if (wrap.isEqual(defVal)) {
                    return;
                }

                this.startChanging();
                if (setter) {
                    setter(defVal);
                }
                //wrap.setVal(defVal);
                this.recordChangedQuery(wrap.getQuery());
                this.endChanging();
            }
        });
    }
    */

    recordChangedQuery(oriQuery) {
        let query = oriQuery;
        while(query) {
            /*
            if (this.hasWrap(query)) {
                this.changedQueries[query] = 1;
            }
            */
            this.changedQueries[query] = 1;

            const pos = query.lastIndexOf('.');
            if (pos < 0) {
                break;
            }
            query = query.substr(0, pos);
        }
    }

    defineQuery(query) {
        if (this.definedQueries[query]) {
            return;
        }
        this.definedQueries[query] = 1;
        //console.log('GapProxy.defineQuery', query);

        const pos = query.lastIndexOf('.');
        const preQuery = pos < 0 ? '' : query.substr(0, pos);
        const prop = pos < 0 ? query : query.substr(pos + 1);


        const obj = this.getDataObj(preQuery);
        let currentVal = obj[prop];

        if (preQuery) {
            this.defineQuery(preQuery);
        }

        Object.defineProperty(obj, prop, {
            enumerable: true,
            configurable: true,
            get: () => currentVal,
            set: (defVal) => {
                this.startChanging();
                if (defVal instanceof Object) {
                    currentVal = currentVal || {};
                    if (!(currentVal instanceof Object)) {
                        throw new Error('not match');
                    }
                    this.fullUpdate(currentVal, defVal);
                } else {
                    //this.recordChangedQuery(query);
                    currentVal = defVal;
                }

                this.recordChangedQuery(query);
                this.endChanging();
            }
        });
    }

    getDataObj(objQuery) {
        if (objQuery === '') {
            return this.data;
        }
        const pos = objQuery.lastIndexOf('.');
        const preQuery = pos < 0 ? '' : objQuery.substr(0, pos);
        const prop = pos < 0 ? objQuery : objQuery.substr(pos + 1);
        const obj = this.getDataObj(preQuery);
        obj[prop] = obj[prop] || {};
        //console.log('objQuery', preQuery, prop);
        /*
        if (!obj[prop]) {
            obj[prop] = {};
        }
        if (!(obj[prop] instanceof Object)) {
            obj[prop] = {};
        }
        */
        return obj[prop];
    }

    getWrap(query) {
        if (this.wraps[query]) {
            return this.wraps[query];
        }
        const wrap = new GapWrap(query);
        this.wraps[query] = wrap;
        //this.defineQuery(query);

        return this.wraps[query];
    }

    hasWrap(query) {
        return this.wraps[query] ? true : false;
    }

    /*
    addWatcher(query, watcher) {
    }
    */

    /*
    _toVarObj(input) {
        if (!input) {
            return null;
        }

        const [name, filterStr] = input.split('|');
        const filter = filterStr
            && filterStr.indexOf('$$') === 0
            && funHolder.get(filterStr);
        return {name, filter};
    }
    */
}
