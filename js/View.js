import {CtnAdapter} from './CtnAdapter.js';

let IdIndex = 1;

export class View extends CtnAdapter {
    constructor(data) {
        super();

        this.data = {};
        this.map = {};
        this._id = 'gv' + IdIndex++;

        this._load(data);
        this.init();
        this.render();
        this._regCtn();
        this._mapping();
        this.startup();
    }

    // private functions
    _load(data) { Object.assign(this.data, data); }
    _regCtn() { this.ctn.update = (data) => this.update(data); }
    _mapping() {
        this.ctn.allElem(`[vn="${this.vnId}"]`).forEach(elem => {
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

    // protected functions
    d(key) { return `view="${this.id}" key="${key}"`; }

    view(key, viewClass, data) {
        const html = `<input type="hidden" ${this.d(key)}>`;
        if (this.map.hasOwnProperty(key)) {
            return html;
        }

        this.map[key] = (new viewClass(data)).ctn;
        return html;
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
        this._load(data);
        this.onUpdate();
    }

    // to implement
    init() {}
    render() {}
    startup() {}
    onUpdate() {}
}
