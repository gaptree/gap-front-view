# View bindTpl

```javascript
class View {
    bindTpl() {
       if (this._isBinded) {
           return;
       }
       this.proxy.bindTpl(this.tpl);
       this._isBinded = true;
   }

    get tpl() {
        this._tpl = this._tpl || this._createTpl();
        return this._tpl;
    }

    _createTpl() {
        const _tpl = this.template();
        if (!(_tpl instanceof GapTpl)) {
            throw new Error('no template');
        }

        return _tpl;
    }
}

class GapProxy {
    bindTpl(tpl) {
        const compiler = new GapCompiler(tpl);
        this._bindHtml(compiler.htmlBinders);
        this._bindArr(compiler.arrOpts);
        this._bindWatcher(compiler.watchers);
        this._bindView(compiler.viewOpts);
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
            const preObj = this.queryObj(preQuery);
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
            const view = opt.view;
            const map = opt.bind ? {'': opt.bind} : opt.bindMulti;
            this.link(view.proxy, map);

            this.views.push(view);
            if (opt.ref) {
                opt.ref(view);
            }
            opt.ons.forEach(item => {
                view.on(item[0], item[1]);
            });
            opt.node.replace(view.getBindedCtn());
        });
    }
}
```