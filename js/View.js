import {GapEvent} from './GapEvent';
//import {GapObj} from './GapObj';
import {GapProxy} from './GapProxy';
import {GapTpl} from './GapTpl';
import {filterHolder} from './holder/filterHolder';

import {createElem} from './lib/createElem';

let viewIndex = 1;

export class View {
    static get tag() { return null; }

    constructor(props = {}) {
        this.vid = 'gv' + viewIndex++;
        this.isCompiled = false;
        this.props = props || {};

        this.event = new GapEvent();
        this.proxy = new GapProxy();
    }

    get data() {
        return this.proxy.data;
    }

    get tpl() {
        this._tpl = this._tpl || this._createTpl();
        return this._tpl;
    }

    get ctn() {
        this._ctn = this._ctn || this._createCtn();
        return this._ctn;
    }

    get nodes() {
        return [this.ctn];
    }

    /*
    get frag() {
        // todo
        return this.ctn;
    }
    */

    compileTpl() {
        if (this.isCompiled) {
            return;
        }
        this.proxy.compileTpl(this.tpl);
        this.isCompiled = true;
    }

    remove() {
        this.tpl.remove();
        this.ctn.remove();
    }

    html(strs, ...items) {
        return new GapTpl(strs, ...items);
    }

    filter(obj) {
        return filterHolder.hold(obj);
    }

    template() {
    }

    update(data) {
        this.compileTpl();
        this.proxy.update(data);
    }

    appendTo(node) {
        if (node instanceof Node) {
            this.compileTpl();
            node.appendChild(this.ctn);
        }
    }
    
    // event
    on(evtName, handle) {
        return this.event.on(evtName, handle);
    }

    trigger(evtName, ...args) {
        return this.event.trigger(evtName, ...args);
    }

    // --- private fun
    _createTpl() {
        const _tpl = this.template();
        if (!(_tpl instanceof GapTpl)) {
            throw new Error('no template');
        }

        return _tpl;
    }

    _createCtn() {
        if (this.constructor.tag) {
            const ctn = createElem(this.constructor.tag);
            this.tpl.nodes.forEach(node => ctn.appendChild(node));
            //ctn.appendChild(this.tpl.frag);
            return ctn;
        }

        const tplNodes = this.tpl.nodes;
        if (tplNodes[1]) {
            throw new Error(`tpl of view[${this.vid}] must be encapsulated in one html element: \n ${this.tpl.ctn.innerHTML}`);
        }
        const ctn = tplNodes[0];
        if (ctn instanceof HTMLElement) {
            return ctn;
        }

        throw new Error('Error html format');
    }
}
