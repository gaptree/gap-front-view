import {textHolder} from './holder/textHolder';
import {funHolder} from './holder/funHolder';
import {viewHolder} from './holder/viewHolder';

import {ElemPropBinder} from './binder/ElemPropBinder';
import {ViewBinder} from './binder/ViewBinder';
import {ViewPropBinder} from './binder/ViewPropBinder';
import {TextNodeBinder} from './binder/TextNodeBinder';
import {ArrBinder} from './binder/ArrBinder';
import {Watcher} from './Watcher';

export class GapCompiler {
    constructor() {
        this.binders = {};
        this.watchers = {};
        //this.proxy = proxy;
    }

    compileTpl(tpl) {
        tpl.nodes.forEach(node => this.compileNode(node));
    }

    compileNode(node) {
        if (!node.attributes) {
            return;
        }

        if (node._compiled) {
            return;
        }
        node._compiled = true;

        switch(node.tagName.toLowerCase()) {
        case viewHolder.tagName:
            this.compileGapView(node);
            break;
        case textHolder.tagName: 
            this.compileGapText(node);
            break;
        default:
            this.compileElem(node);
            this.compileNodeCollection(node.childNodes);
        }
    }

    compileNodeCollection(nodeCollection) {
        for (const node of nodeCollection) {
            this.compileNode(node);
        }
    }

    /**
     * <gap-view
     *  view=${new View()}
     *  bind="prop" or bind=${prop: (val) => console.log(...) }
     *  bind-var1_part1-sub_var_part2='currentDataVar'
     * ></gap-view>
     **/
    compileGapView(node) {
        const viewBinder = new ViewBinder(node);
        const bindAttr = node.getAttribute('bind');
        if (bindAttr) {
            this.addBinder(bindAttr, viewBinder);
        }

        for (const attr of node.attributes) {
            const attrName = attr.name;
            const attrVal = attr.value;

            if (attrName.indexOf('bind-') === 0) {
                const viewVarName = this._toViewVarName(attrName.substr(5));
                this.addBinder(
                    attrVal,
                    new ViewPropBinder(viewBinder, viewVarName)
                );
            }
        }
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
                toRemoves.push('arr', 'array', 'type', 'filter', 'item-key', 'item-filter', 'item-as');
                continue;
            }

            if (attrName === 'ref') {
                funHolder.get(attrVal)(elem);
                toRemoves.push(attrName);
                continue;
            }

            if (attrName === 'watch') {
                //this.addBinder(attrVal, new WatchBinder(elem, this));
                //this.addWatcher(attrVal, new Watcher(elem, this.proxy));
                this.addWatcher(attrVal, new Watcher(elem));
                toRemoves.push(attrName);
                continue;
            }

            const sepIndex = attrName.indexOf('-');

            if (sepIndex <= 0) {
                continue;
            }

            const pre = attrName.substr(0, sepIndex);
            const type = attrName.substr(sepIndex + 1);

            if (pre === 'on') {
                elem.on(type, funHolder.get(attrVal));
                toRemoves.push(attrName);
            } else if (pre === 'cb') {
                elem.cb(type, funHolder.get(attrVal));
                toRemoves.push(attrName);
            } else if (pre === 'bind') {
                this.addBinder(attrVal, new ElemPropBinder(elem, type));
                toRemoves.push(attrName);
            }
        }

        toRemoves.forEach(attrName => elem.removeAttribute(attrName));
    }

    addBinder(query, binder) {
        const varObj = this._toVarObj(query);

        if (!this.binders[varObj.name]) {
            this.binders[varObj.name] = [];
        }
        this.binders[varObj.name].push({
            filter: varObj.filter,
            binder: binder
        });
        //this.proxy.addBinder(query, binder);
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

    addWatcher(query, watcher) {
        if (!this.watchers[query]) {
            this.watchers[query] = [];
        }
        this.watchers[query].push(watcher);
        //this.proxy.addWatcher(query, watcher);
    }

    /**
     * var1_part11_part12---var2_part21__---__part22
     * var1Part11Part12.var2Part21.Part22
     */
    _toViewVarName(input) {
        return (input + '')
            .toLowerCase()
            .replace(/_+(.)/g, (matched, p1) => p1.toUpperCase())
            .replace(/-+/g, '.')
            .trim();
    }
}
