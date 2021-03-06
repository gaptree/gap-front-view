import {BinderBase} from './BinderBase';

const elemProps = [
    'id',
    'name',
    'checked'
];

export class ElemPropBinder extends BinderBase {
    constructor(elem, prop) {
        super();

        this.elem = elem;
        this.prop = prop;

        if (prop === 'val' || prop === 'value') {
            this.handler = this.getValueHandler();
        } else if (prop === 'html') {
            this.handler = this.getHtmlHandler();
        } else if (prop === 'class' || prop === 'className') {
            this.handler = this.getClassHandler();
        } else if (elemProps.includes(prop)) {
            this.handler = this.getPropHandler();
        } else {
            this.handler = this.getAttrHandler();
        }
    }

    update(val) {
        this.handler(val);
    }

    parseVal(inVal) {
        const val = super.parseVal(inVal);
        return (val === undefined) ? '' : val;
    }

    getValueHandler() {
        return (val) => {
            this.elem.setVal(this.parseVal(val));
        };
    }

    getHtmlHandler() {
        return (val) => {
            this.elem.innerHTML = this.parseVal(val);
        };
    }

    getClassHandler() {
        return (val) => {
            this.elem.className = this.parseVal(val);
        };
    }

    getPropHandler() {
        return (val) => {
            this.elem[this.prop] = this.parseVal(val);
        };
    }

    getAttrHandler() {
        return (val) => {
            if (val === undefined) {
                this.elem.removeAttribute(this.prop);
                return;
            }

            this.elem.setAttribute(
                this.prop,
                this.parseVal(val)
            );
        };
    }
}
