//import {fullUpdate} from './lib/fullUpdate';
import {GapCompiler} from './GapCompiler';
import {GapObj} from './GapObj';
import {GapArr} from './GapArr';
import {GapTxn} from './GapTxn';
//import {GapDpt} from './GapDpt';

export class GapProxy {
    constructor() {
        //this.data = (data instanceof GapObj) ? data : new GapObj();
        this.dpts = {};
        this.dptQueries = {};

        this.views = [];
    }

    get data() {
        this._data = this._data  || new GapObj();
        return this._data;
    }

    set data(data) {
        if (data instanceof GapObj) {
            this._data = data;
        } else {
            throw new Error('proxy.data should be GapObj');
        }
    }

    update(data) {
        const txn = new GapTxn();

        txn.start();
        this.data.update(data, txn);
        txn.end();
    }

    updateWithoutTxn(data) {
        this.data.update(data);
    }

    compileTpl(tpl) {
        const compiler = new GapCompiler(tpl);
        Object.keys(compiler.binders).forEach(query => {
            const dpt = this.queryDpt(query);
            compiler.binders[query].forEach(item => {
                dpt.addBinder(item.binder, item.filter);
            });
        });

        Object.keys(compiler.arrs).forEach(query => {
            const [preQuery, prop] = this.parseQuery(query);
            const preObj = this.queryGapObj(preQuery);
            const gapArr = new GapArr();
            preObj.addChild(prop, gapArr);
            //const dpt = preObj.getDpt(prop);
            compiler.arrs[query].forEach(arrBinder => {
                gapArr.addArrBinder(arrBinder);
                //gapArr.addKeyHandler(arrBinder.getKeyHandler());
                //dpt.addBinder(arrBinder);
            });
        });

        Object.keys(compiler.watchers).forEach(query => {
            const dpt = this.queryDpt(query);
            compiler.watchers[query].forEach(watcher => {
                dpt.addWatcher(watcher);
            });
            /*
            this.defineWatcherQuery(query);
            compiler.watchers[query].forEach(watcher => {
                this.addWatcher(query, watcher);
            });
            */
        });

        compiler.viewOpts.forEach(opt => {
            //const viewData = opt.bind ? this.getDataObj(opt.bind) : null;
            const view = opt.view;
            if (opt.bind) {
                view.proxy.data = this.queryGapObj(opt.bind);
            } else if (opt.bindMulti) {
                Object.keys(opt.bindMulti).forEach(dstQuery => {
                    const srcQuery = opt.bindMulti[dstQuery];
                    const [dstPreQuery, dstProp] = this.parseQuery(dstQuery);
                    const srcDpt = this.queryDpt(srcQuery);
                    view.proxy.queryGapObj(dstPreQuery).appendDpt(dstProp, srcDpt);
                });
            }

            view.compileTpl();

            this.views.push(view);
            opt.ctn.replace(view.ctn);
            if (opt.ref) {
                opt.ref(view);
            }
            opt.ons.forEach(item => {
                view.on(item[0], item[1]);
            });

            /*
            let viewData;
            if (opt.bind) {
                viewData = this.getDataObj(opt.bind);
                //this.defineObjQuery(opt.bind);
            }

            //console.log(opt);
            //console.log(this.data.book);

            const viewClass = opt.viewClass;
            const viewProp = opt.prop;
            const view = new viewClass(viewProp, viewData, this.txn);
            this.views.push(view);
            opt.ctn.replace(view.ctn);

            const ref = opt.ref;
            if (ref) {
                ref(view);
            }

            //console.log(view);
            //console.log(this.data.book.author);
            //*/
        });

        console.log('compileTpl', Object.keys(this.dptQueries));
    }

    /*
    extractViewData(bind) {
        if (typeof bind === 'string') {
            return this.getDataObj(bind);
        }

        const dpts = {};
        if (bind instanceof Object) {
            Object.keys(bind).forEach(key => {
                dpts[key] = this.getDpt(bind[key]);
            });
        }
    }
    */

    /*
    addWatcher(query, watcher) {
        const dpt = this.getDpt(query);
        dpt.addWatcher(watcher);
    }

    addBinder(query, binder, filter) {
        const dpt = this.getDpt(query);
        binder.onFilter(filter);
        dpt.addBinder(binder);
    }
    */

    queryGapObj(query) {
        if (query === '') {
            return this.data;
        }
        const [preQuery, prop] = this.parseQuery(query);
        const gapObj = this.queryGapObj(preQuery);
        if (!(gapObj[prop] instanceof GapObj)) {
            gapObj.addChild(prop, new GapObj());
            //gapObj.createChildObj(prop);
        }
        return gapObj[prop];
    }

    /*
    getDataObj(objQuery) {
        //console.log('getDataObj', objQuery);

        if (objQuery === '') {
            return this.data;
        }
        const pos = objQuery.lastIndexOf('.');
        const preQuery = pos < 0 ? '' : objQuery.substr(0, pos);
        const prop = pos < 0 ? objQuery : objQuery.substr(pos + 1);
        const obj = this.getDataObj(preQuery);
        //obj[prop] = obj[prop] || {};
        if (!obj[prop]) {
            obj[prop] = {};
        }
        return obj[prop];
    }
    */

    queryDpt(query) {
        if (this.dptQueries[query]) {
            return this.dptQueries[query];
        }

        const [preQuery, prop] = this.parseQuery(query);
        const gapObj = this.queryGapObj(preQuery);
        const dpt = gapObj.fetchDpt(prop);
        this.dptQueries[query] = dpt;

        return dpt;
    }

    /*
    defineBinderQuery(query) {
        this.defineQuery(query, 'binder');
    }

    defineWatcherQuery(query) {
        this.defineQuery(query, 'watcher');
    }

    defineObjQuery(query) {
        this.defineQuery(query, 'obj');
    }
    */

    /*
    defineQuery(query, type) {
        if (this.definedQueries[type][query]) {
            return;
        }
        this.definedQueries[type][query] = 1;
        //console.log('defineQuery', '[' + query + ']', type);

        const [preQuery, prop] = this.parseQuery(query);
        const gapObj = this.queryGapObj(preQuery);
        gapObj.defineProp(prop);
        return;

        const currentVal = obj[prop];
        if (preQuery) {
            this.defineObjQuery(preQuery);
        }
        const currentDpt = this.getCurrentDpt(query, preQuery, prop, currentVal);
        if (type === 'watcher') {
            currentDpt.activeWatcherHandler();
        }

        //console.log(currentDpt);
        Object.defineProperty(obj, prop, {
            enumerable: true,
            configurable: true,
            get: currentDpt.getter(),
            set: currentDpt.setter()
        });
    }
    */

    /*
    getDpt(query) {
        if (this.dpts[query]) {
            return this.dpts[query];
        }
        this.dpts[query] = new GapDpt(this.txn);
        return this.dpts[query];
    }
    */

    // fun
    /*
    getCurrentDpt(query, preQuery, prop, currentVal) {
        const parentDpt = preQuery ? this.getDpt(preQuery) : null;
        const currentDpt = this.getDpt(query);
        if (parentDpt && !currentDpt.parent) {
            currentDpt.parent = parentDpt;
        }
        if (!currentDpt.prop) {
            currentDpt.prop = prop;
        }
        currentDpt.currentVal = currentVal;
        return currentDpt;
    }
    */

    parseQuery(query) {
        const pos = query.lastIndexOf('.');
        const preQuery = pos < 0 ? '' : query.substr(0, pos);
        const prop = pos < 0 ? query : query.substr(pos + 1);
        return [preQuery, prop];
    }
}
