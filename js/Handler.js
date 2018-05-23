const ElemProps = [
    'id',
    'name',
    //'value',
    'checked'
];

export class Handler {
    constructor(elem, key) {
        this.elem = elem;
        this.key = key;
    }

    update(valHandler) {
        let val;
        if (typeof valHandler === 'function') {
            val = valHandler();
        } else {
            val = valHandler;
        }

        if (ElemProps.includes(this.key)) {
            this.elem[this.key] = val;
        } else if (this.key === 'val' || this.key === 'value') {
            this.elem.setVal(val);
        } else if (this.key === 'class' || this.key === 'className') {
            // todo
            this.elem.className = val;
        } else if (this.key === 'text-node') {
            const text = document.createTextNode(val);
            this.elem.replace(text);
            this.elem = text;
        } else {
            this.elem.setAttribute(this.key, val);
        }
    }
}
