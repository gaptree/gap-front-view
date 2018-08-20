import {textHolder} from './holder/textHolder';
import {funHolder} from './holder/funHolder';
import {objHolder} from './holder/objHolder';
import {viewHolder} from './holder/viewHolder';
import {componentHolder} from './holder/componentHolder';

import {ElemPropBinder} from './binder/ElemPropBinder';
import {TextNodeBinder} from './binder/TextNodeBinder';
import {ArrBinder} from './binder/ArrBinder';
import {Watcher} from './Watcher';

export class GapCompiler {
    constructor(tpl) {
        this.htmlBinders = {};
        this.arrOpts = {};
        this.watchers = {};

        this.viewOpts = [];
        if (tpl) {
            this.compileTpl(tpl);
        }
    }

    compileTpl(tpl) {
        for (let index in tpl.nodes) {
            const compiled = this._compileNode(tpl.nodes[index]);
            if (compiled) {
                tpl.nodes[index] = compiled;
            }
        }
    }

    _compileNode(node) {
        if (!node.attributes) {
            return;
        }

        if (node._compiled) {
            return;
        }
        node._compiled = true;

        let compiled;
        let tagName = node.tagName.toLowerCase();

        if (textHolder.tagName == tagName) {
            return this._compileGapText(node);
        }

        // compatiable
        if (viewHolder.tagName == tagName) {
            return this._compileGapView(node);
        }

        if ((node instanceof HTMLUnknownElement) && componentHolder.get(tagName)) {
            return this._compileComponent(node);
        }

        if (node instanceof HTMLElement) {
            compiled = this._compileElem(node);
            this._compileNodeCollection(node.childNodes);
            return compiled;
        }

        throw new Error(`cannot find element ${tagName}, please check your code`);
    }

    _compileNodeCollection(nodeCollection) {
        for (const node of nodeCollection) {
            this._compileNode(node);
        }
    }

    _compileComponent(node) {
        let props =  node.attributes.props ? objHolder.get(node.attributes.props.value) : {};
        const view = new (componentHolder.get(node.tagName.toLowerCase()))(props);
        const viewOpt = {
            view: view,
            bindMulti: {},
            bind: null,
            ons: [],
            node: node
        };

        for (const attr of node.attributes) {
            const attrName = attr.name;
            const attrVal = attr.value;

            if (attrName === 'ref') {
                viewOpt.ref = funHolder.get(attrVal);
                continue;
            }

            if (attrName === 'bind') {
                viewOpt.bind = attrVal;
                continue;
            }

            if (attrName === 'bind-multi') {
                viewOpt.bindMulti = objHolder.get(attrVal);
                continue;
            }

            const [pre, type] = this._toPreAndType(attrName);
            if (!pre) {
                continue;
            }

            if (pre === 'on') {
                viewOpt.ons.push([type, funHolder.get(attrVal)]);
                continue;
            }

            if (pre === 'bind') {
                viewOpt.bindMulti[this._attrNameToVarName(type)] = attrVal;
                continue;
            }
        }

        if (viewOpt.bind && Object.keys(viewOpt.bindMulti).length > 0) {
            throw new Error('view.bind view.bindMulti cannot exist at same time');
        }

        this.viewOpts.push(viewOpt);

        return view.ctn;
    }

    /**
     * <gap-view
     *  view=${new View()}
     *  bind="prop" or bind=${prop: (val) => console.log(...) }
     *  bind-var1_part1-sub_var_part2='currentDataVar'
     * ></gap-view>
     **/
    _compileGapView(node) {
        const view = viewHolder.get(node.getAttribute('view'));
        const viewOpt = {
            view: view,
            bindMulti: {},
            bind: null,
            ons: [],
            node: node
        };

        for (const attr of node.attributes) {
            const attrName = attr.name;
            const attrVal = attr.value;

            if (attrName === 'ref') {
                viewOpt.ref = funHolder.get(attrVal);
                continue;
            }

            if (attrName === 'bind') {
                viewOpt.bind = attrVal;
                continue;
            }

            if (attrName === 'bind-multi') {
                viewOpt.bindMulti = objHolder.get(attrVal);
                continue;
            }

            const [pre, type] = this._toPreAndType(attrName);
            if (!pre) {
                continue;
            }

            if (pre === 'on') {
                viewOpt.ons.push([type, funHolder.get(attrVal)]);
                continue;
            }

            if (pre === 'bind') {
                viewOpt.bindMulti[this._attrNameToVarName(type)] = attrVal;
                continue;
            }
        }

        if (viewOpt.bind && Object.keys(viewOpt.bindMulti).length > 0) {
            throw new Error('view.bind view.bindMulti cannot exist at same time');
        }

        this.viewOpts.push(viewOpt);
        //node.replace(view.ctn);

        return view.ctn;
    }

    _compileGapText(node) {
        this._addHtmlBinder(node.getAttribute('bind'), new TextNodeBinder(node));
    }

    _compileElem(elem) {
        const toRemoves = [];

        for (const attr of elem.attributes) {
            const attrName = attr.name;
            const attrVal = attr.value;

            if (attrName === 'arr' || attrName === 'array') {
                this._addArrOpt(attrVal, new ArrBinder(elem));
                toRemoves.push('arr', 'array', 'type', 'filter', 'item-key', 'item-filter', 'item-as');
                continue;
            }

            if (attrName === 'ref') {
                funHolder.get(attrVal)(elem);
                toRemoves.push(attrName);
                continue;
            }

            if (attrName === 'watch') {
                this._addWatcher(attrVal, new Watcher(elem));
                toRemoves.push(attrName);
                continue;
            }

            const [pre, type] = this._toPreAndType(attrName);
            if (!pre) {
                continue;
            }

            if (pre === 'on') {
                elem.on(type, funHolder.get(attrVal));
                toRemoves.push(attrName);
            } else if (pre === 'cb') {
                elem.cb(type, funHolder.get(attrVal));
                toRemoves.push(attrName);
            } else if (pre === 'bind') {
                this._addHtmlBinder(attrVal, new ElemPropBinder(elem, type));
                toRemoves.push(attrName);
            }
        }

        toRemoves.forEach(attrName => elem.removeAttribute(attrName));
    }

    _addArrOpt(query, binder) {
        if (!this.arrOpts[query]) {
            this.arrOpts[query] = [];
        }
        this.arrOpts[query].push(binder);
    }

    _addWatcher(query, watcher) {
        if (!this.watchers[query]) {
            this.watchers[query] = [];
        }
        this.watchers[query].push(watcher);
    }

    /**
     * var1_part11_part12---var2_part21__---__part22
     * var1Part11Part12.var2Part21.Part22
     */
    _attrNameToVarName(input) {
        return (input + '')
            .toLowerCase()
            .replace(/_+(.)/g, (matched, p1) => p1.toUpperCase())
            .replace(/-+/g, '.')
            .trim();
    }

    _toPreAndType(attrName) {
        const sepIndex = attrName.indexOf('-');
        if (sepIndex <= 0) {
            return [null, null];
        }
        const pre = attrName.substr(0, sepIndex);
        const type = attrName.substr(sepIndex + 1);
        return [pre, type];
    }

    _addHtmlBinder(query, htmlBinder) {
        const varObj = this._toVarObj(query);

        if (!this.htmlBinders[varObj.name]) {
            this.htmlBinders[varObj.name] = [];
        }
        this.htmlBinders[varObj.name].push({
            filter: varObj.filter,
            htmlBinder: htmlBinder
        });
    }

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
}
