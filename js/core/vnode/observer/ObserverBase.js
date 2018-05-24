export class ObserverBase {
    constructor(elem) {
        this.elem = elem;
    }

    parseVal(valHandler) {
        if (typeof valHandler === 'function') {
            return valHandler();
        }

        return valHandler;
    }

    update() {
        throw new Error('udpate must be implemented');
    }
}
