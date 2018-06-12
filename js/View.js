import {GapEvent} from 'gap-front-event';
import {createElem} from './lib/createElem';
import {toFrag} from './lib/toFrag';
//import {deepUpdate} from './lib/deepUpdate';
import {GapTpl} from './GapTpl';
import {GapProxy} from './GapProxy';

let viewIndex = 1;

export class View {
    static get tag() { return null; }

    constructor(props = {}) {
        this.props = props || {};
        this.data = {};
        this.event = new GapEvent();
        this.vid = 'gv' + viewIndex++;
        this.proxy = new GapProxy(this.data);

        this.tpl = this.template();
        if (this.tpl) {
            this.proxy.compile(this.tpl, this.vid);
        }

        this.ctn = this.getCtn();
        //this.proxy.changed();

        // deprecated
        this.init();
        this.render();
        this.startup();
    }

    update(inData) {
        this.proxy.updateAll(inData);
        //deepUpdate(this.data, inData);
    }

    getCtn() {
        if (this.constructor.tag) {
            const ctn = createElem(this.constructor.tag);
            if (this.tpl) {
                ctn.appendChild(this.tpl.frag);
            }
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

    get nodes() {
        if (this._nodes) {
            return this._nodes;
        }

        if (this.ctn) {
            this._nodes = [this.ctn];
            return this._nodes;
        }

        /*
        if (this.tpl) {
            this._nodes = this.tpl.nodes;
            return this._nodes;
        }

        return [];
        */
    }


    get frag() {
        return toFrag(this.nodes);
    }

    remove() {
        if (this.tpl) {
            this.tpl.remove();
        }

        if (this.ctn) {
            this.ctn.remove();
        }
    }

    template() {
        return null;
    }

    on(evtName, handle) {
        this.event.on(evtName, handle);
    }

    trigger(evtName, ...args) {
        this.event.trigger(evtName, ...args);
    }

    html(strs, ...items) {
        return new GapTpl(strs, ...items);
    }

    appendTo(node) {
        if (!(node instanceof Node)) {
            return;
        }

        node.appendChild(this.frag);
    }


    // dprecated
    init() {}
    render() {}
    startup() {}
    handleUpdate() {}
}
