import {textHolder} from './holder/textHolder';
import {funHolder} from './holder/funHolder';
import {objHolder} from './holder/objHolder';
import {viewHolder} from './holder/viewHolder';

import {ElemPropBinder} from './binder/ElemPropBinder';
//import {ViewBinder} from './binder/ViewBinder';
//import {ViewPropBinder} from './binder/ViewPropBinder';
import {TextNodeBinder} from './binder/TextNodeBinder';
import {ArrBinder} from './binder/ArrBinder';
import {Watcher} from './Watcher';

export class GapCompiler {
    constructor(tpl) {
        this.binders = {};
        this.arrs = {};
        this.watchers = {};

        this.viewOpts = [];
        if (tpl) {
            this.compileTpl(tpl);
        }
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
        const viewOpt = {
            view: viewHolder.get(node.getAttribute('view')),
            ctn: node,
            ons: []
        };

        const bindMulti = {};

        // todo
        // too much actions in loop
        for (const attr of node.attributes) {
            const attrName = attr.name;
            const attrVal = attr.value;

            if (attrName === 'ref') {
                viewOpt.ref = funHolder.get(attrVal);
                //funHolder.get(attrVal)(this.view);
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

            /*
             * todo
            if (attrName === 'prop') {
                viewOpt.prop = objHolder.get(attrVal);
            }
            */


            const sepIndex = attrName.indexOf('-');
            if (sepIndex <= 0) {
                continue;
            }
            const pre = attrName.substr(0, sepIndex);
            const type = attrName.substr(sepIndex + 1);

            if (pre === 'on') {
                viewOpt.ons.push([type, funHolder.get(attrVal)]);
                //this.view.on(type, funHolder.get(attrVal));
                continue;
            }

            if (pre === 'bind') {
                bindMulti[this.attrNameToVarName(type)] = attrVal;
                continue;
                //console.log('bind', type, attrVal);
            }
        }

        if (viewOpt.bind && viewOpt.bindMulti) {
            throw new Error('view.bind view.bindMulti cannot exist at same time');
        }
        Object.assign(bindMulti, viewOpt.bindMulti);
        viewOpt.bindMulti = bindMulti;

        this.viewOpts.push(viewOpt);
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
                this.addArr(attrVal, new ArrBinder(elem));
                toRemoves.push('arr', 'array', 'type', 'filter', 'item-key', 'item-filter', 'item-as');
                continue;
            }

            if (attrName === 'ref') {
                funHolder.get(attrVal)(elem);
                toRemoves.push(attrName);
                continue;
            }

            if (attrName === 'watch') {
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

    addArr(query, binder) {
        if (!this.arrs[query]) {
            this.arrs[query] = [];
        }
        this.arrs[query].push(binder);
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
    attrNameToVarName(input) {
        return (input + '')
            .toLowerCase()
            .replace(/_+(.)/g, (matched, p1) => p1.toUpperCase())
            .replace(/-+/g, '.')
            .trim();
    }
}
