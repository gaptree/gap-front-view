export class Vnode {
    constructor() {
        this.children = {};
        this.observers = [];
    }

    vnode(keys) {
        let node = this;
        keys.split('.').forEach(key => {
            if (!node.children.hasOwnProperty(key)) {
                node.children[key] = new Vnode();
            }
            node = node.children[key];
        });
        return node;
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    hasChildren() {
        return Object.keys(this.children).length > 0;
    }
}
