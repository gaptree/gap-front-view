import {GapEvent} from 'gap-front-event';
import {createElem} from './lib/createElem';
import {toFrag} from './lib/toFrag';
import {compile} from './lib/compile';
import {GapTpl} from './GapTpl';
import {GapProxy} from './GapProxy';

let viewIndex = 1;

export class View {
    static get tag() { return null; }

    constructor(data = {}) {
        this.data = new GapProxy();
        this.event = new GapEvent();

        this.vid = 'gv' + viewIndex++;
        if (this.constructor.tag) {
            this.ctn = createElem(this.constructor.tag);
        }
        this.tpl = this.template();

        if (this.tpl) {
            compile(this.data, this.tpl);
        }

        if (data) {
            this.update(data);
        }

        // deprecated
        this.init();
        this.render();
        this.startup();
    }

    on(evtName, handle) {
        this.event.on(evtName, handle);
    }

    trigger(evtName, ...args) {
        this.event.trigger(evtName, ...args);
    }

    update(data) {
        this.data.update(data);
    }

    get elems() {
        if (this._elems) {
            return this._elems;
        }

        if (this.ctn) {
            if (this.tpl) {
                this.ctn.appendChild(this.tpl.frag);
            }
            this._elems = [this.ctn];
            return this._elems;
        }

        if (this.tpl) {
            this._elems = this.tpl.elems;
            return this._elems;
        }

        return [];
    }

    get frag() {
        return toFrag(this.elems);
    }

    appendTo(node) {
        if (!(node instanceof Node)) {
            return;
        }

        node.appendChild(this.frag);
    }

    remove() {
        if (this.tpl) {
            this.tpl.remove();
            return;
        }

        if (this.ctn) {
            this.ctn.remove();
        }
    }

    template() {
        return null;
    }

    html(strs, ...items) {
        const tpl = new GapTpl(strs, ...items);
        //compile(this.data, tpl);
        return tpl;
    }

    // deprecated
    init() {}
    render() {}
    startup() {}
    handleUpdate() {}
}
