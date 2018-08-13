import {GapCompiler} from './GapCompiler';
import {GapObj} from './GapObj';
import {GapArr} from './GapArr';
import {GapTxn} from './GapTxn';

export class GapProxy {
    constructor() {
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

        Object.keys(compiler.arrOpts).forEach(query => {
            const [preQuery, prop] = this.parseQuery(query);
            const preObj = this.queryGapObj(preQuery);
            const gapArr = new GapArr();
            preObj.addChild(prop, gapArr);
            compiler.arrOpts[query].forEach(arrBinder => {
                gapArr.addArrBinder(arrBinder);
            });
        });

        Object.keys(compiler.watchers).forEach(query => {
            const dpt = this.queryDpt(query);
            compiler.watchers[query].forEach(watcher => {
                dpt.addWatcher(watcher);
            });
        });

        compiler.viewOpts.forEach(opt => {
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
            //opt.ctn.replace(view.ctn);
            if (opt.ref) {
                opt.ref(view);
            }
            opt.ons.forEach(item => {
                view.on(item[0], item[1]);
            });
        });

        console.log('compileTpl', Object.keys(this.dptQueries));
    }

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

    parseQuery(query) {
        const pos = query.lastIndexOf('.');
        const preQuery = pos < 0 ? '' : query.substr(0, pos);
        const prop = pos < 0 ? query : query.substr(pos + 1);
        return [preQuery, prop];
    }
}
