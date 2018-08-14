import {GapCompiler} from './GapCompiler';
import {GapObj} from './GapObj';
import {GapArr} from './GapArr';
import {GapCommitTxn} from './txn/GapCommitTxn';

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
        const txn = new GapCommitTxn();

        txn.start();
        this.data.update(data, txn);
        txn.end();
    }

    /*
    updateWithoutTxn(data) {
        this.data.update(data);
    }
    */

    bindTpl(tpl) {
        const compiler = new GapCompiler(tpl);
        this._bindHtml(compiler.htmlBinders);
        this._bindArr(compiler.arrOpts);
        this._bindWatcher(compiler.watchers);
        this._bindView(compiler.viewOpts);
    }

    queryGapObj(query) {
        if (query === '') {
            return this.data;
        }
        const [preQuery, prop] = this._parseQuery(query);
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

        const [preQuery, prop] = this._parseQuery(query);
        const gapObj = this.queryGapObj(preQuery);
        const dpt = gapObj.fetchDpt(prop);
        this.dptQueries[query] = dpt;

        return dpt;
    }

    _parseQuery(query) {
        const pos = query.lastIndexOf('.');
        const preQuery = pos < 0 ? '' : query.substr(0, pos);
        const prop = pos < 0 ? query : query.substr(pos + 1);
        return [preQuery, prop];
    }

    _bindHtml(htmlBinders) {
        Object.keys(htmlBinders).forEach(query => {
            const dpt = this.queryDpt(query);
            htmlBinders[query].forEach(item => {
                dpt.addHtmlBinder(item.htmlBinder, item.filter);
            });
        });
    }

    _bindArr(arrOpts) {
        Object.keys(arrOpts).forEach(query => {
            const [preQuery, prop] = this._parseQuery(query);
            const preObj = this.queryGapObj(preQuery);
            const gapArr = new GapArr();
            preObj.addChild(prop, gapArr);
            arrOpts[query].forEach(arrBinder => {
                gapArr.addArrBinder(arrBinder);
            });
        });
    }

    _bindWatcher(watchers) {
        Object.keys(watchers).forEach(query => {
            const dpt = this.queryDpt(query);
            watchers[query].forEach(watcher => {
                dpt.addWatcher(watcher);
            });
        });
    }

    _bindView(viewOpts) {
        viewOpts.forEach(opt => {
            // todo
            const view = opt.view;
            if (opt.bind) {
                view.proxy.data = this.queryGapObj(opt.bind);
            } else if (opt.bindMulti) {
                Object.keys(opt.bindMulti).forEach(dstQuery => {
                    const srcQuery = opt.bindMulti[dstQuery];
                    const [dstPreQuery, dstProp] = this._parseQuery(dstQuery);
                    const srcDpt = this.queryDpt(srcQuery);
                    view.proxy.queryGapObj(dstPreQuery).appendDpt(dstProp, srcDpt);
                });
            }

            view.bindTpl();

            this.views.push(view);
            if (opt.ref) {
                opt.ref(view);
            }
            opt.ons.forEach(item => {
                view.on(item[0], item[1]);
            });
        });
    }
}
