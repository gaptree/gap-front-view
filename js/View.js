import {GapEvent} from './GapEvent';
//import {GapObj} from './GapObj';
import {GapProxy} from './GapProxy';
import {GapTxn} from './txn/GapTxn';
import {GapTpl} from './GapTpl';
import {filterHolder} from './holder/filterHolder';
import {componentHolder} from './holder/componentHolder';
import {createElem} from './lib/createElem';

let viewIndex = 1;

export class View {
    constructor(props = {}) {
        this.vid = 'gv' + viewIndex++;
        this.props = props || {};

        this._isBinded = false;

        this.event = new GapEvent();
        this.proxy = new GapProxy();

        componentHolder.holdComponents(this.component());
    }

    static get tag() { return null; }

    static regComponent(id, component) {
        componentHolder.hold(id, component);
    }

    static enableDebug() {
        GapTxn.enableDebug();
    }

    component() { return {}; }

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

    bindTpl() {
        if (this._isBinded) {
            return;
        }
        this._isBinded = true;
        this.proxy.bindTpl(this.tpl);
        this.startup();
    }

    getBindedQueries() {
        this.bindTpl();
        return Object.keys(this.proxy.dptQueries);
    }

    getLastLogs() {
        return GapTxn.last().getLastLogs();
    }

    remove() {
        this.tpl.remove();
        this.ctn.remove();
    }

    html(strs, ...items) {
        return new GapTpl(strs, ...items);
    }

    // todo => holdFilter
    filter(obj) {
        return filterHolder.hold(obj);
    }

    template() {
    }

    startup() {
    }

    update(data) {
        this.bindTpl();
        this.proxy.update(data);
    }

    appendTo(node) {
        if (node instanceof Node) {
            this.bindTpl();
            node.appendChild(this.ctn);
        }
    }

    getBindedCtn() {
        this.bindTpl();
        return this.ctn;
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
