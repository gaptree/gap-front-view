import {createElem} from './elem/createElem.js';

let IdIndex = 1;

export class View {

    static get tag() { return this._tag || null; }
    static set tag(tagName) { this._tag = tagName; }

    constructor(data) {
        this.data = {};
        this.map = {};
        this._id = 'gv' + IdIndex++;

        this._assignData(data);

        this.init();
        this.render();

        this._regCtn();
        this._mapping();

        this.startup();
    }

    // private functions
    _assignData(data) { Object.assign(this.data, data); }
    _regCtn() { this.ctn.update = (data) => this.update(data); }
    _mapping() {
        this.ctn.allElem(`[view="${this.id}"]`).forEach(elem => {
            const key = elem.getAttribute('key');

            if (this.map[key]) {
                elem.replace(this.map[key]);
                return;
            }

            this.map[key] = elem;
        });
    }

    // getter
    get id() { return this._id; }

    get ctn() {
        this._ctn = this._ctn || createElem(this.constructor.tag);
        return this._ctn;
    }


    // protected functions
    d(key) { return `view="${this.id}" key="${key}"`; }

    view(key, viewClass, data) {
        if (this.map.hasOwnProperty(key)) {
            return this.map[key];
        }

        this.map[key] = (new viewClass(data)).ctn;
        return this.map[key];
    }

    get(key) {
        return this.map[key];
    }

    set(key, val) {
        const elem = this.get(key);
        if (!elem) {
            return;
        }
        elem.setVal(val);
    }

    // public functions
    update(data) {
        this._assignData(data);
        this.onUpdate();
    }

    appendTo(elem) {
        if (!(elem instanceof HTMLElement)) {
            throw new Error('Can only append to HTMLElement');
        }
        elem.appendChild(this.ctn);
    }

    // to implement
    init() {}
    render() {}
    startup() {}
    onUpdate() {}
}
