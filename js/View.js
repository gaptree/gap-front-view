import {GapEvent} from './GapEvent';
import {GapProxy} from './GapProxy';
import {GapTpl} from './GapTpl';

import {createElem} from './lib/createElem';

let viewIndex = 1;

export class View {
    static get tag() { return null; }

    constructor(props = {}) {
        this.vid = 'gv' + viewIndex++;

        this.props = props || {};
        this.data = {};
        this.event = new GapEvent();
        this.proxy = new GapProxy(this.data);

        this.proxy.compileTpl(this.tpl);
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

    get frag() {
        // todo
        return this.ctn;
    }

    remove() {
        this.tpl.remove();
        this.ctn.remove();
    }

    html(strs, ...items) {
        return new GapTpl(strs, ...items);
    }

    template() {
    }

    update(data) {
        this.proxy.update(data);
    }

    appendTo(node) {
        if (node instanceof Node) {
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
            ctn.appendChild(this.tpl.frag);
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
