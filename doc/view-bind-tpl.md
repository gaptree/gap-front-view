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
}
```