import {DescriptorWrap} from './DescriptorWrap';

export class GapProxy {
    constructor() {
        Object.defineProperty(this, 'descriptorWraps', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: {}
        });
        //this.descriptorWraps = {};
    }

    getDescriptorWrap(prop) {
        if (this.descriptorWraps[prop]) {
            return this.descriptorWraps[prop];
        }

        const descriptorWrap = new DescriptorWrap(this);
        this.descriptorWraps[prop] = descriptorWrap;
        Object.defineProperty(this, prop, descriptorWrap.getDescriptor());

        return this.descriptorWraps[prop];
    }

    getProxy(prop) {
        if (this[prop]) {
            return this[prop];
        }

        const proxy = new GapProxy();
        const descriptor = this.getDescriptorWrap(prop);
        descriptor.linkProxy(proxy);
        return this[prop];
    }

    getProxyByArr(props) {
        let proxy = this;
        props.forEach(prop => {
            proxy = proxy.getProxy(prop);
        });
        return proxy;
    }

    descriptor(query) {
        const props = query.split('.');
        const lastProp = props.pop();

        const proxy = this.getProxyByArr(props);
        return proxy.getDescriptorWrap(lastProp);
    }

    update(data) {
        if (data instanceof Object) {
            for (const key in data) {
                if (!this.hasOwnProperty(key)) {
                    continue;
                }

                const item = data[key];
                this.getDescriptorWrap(key);
                this[key] = item;
            }
            return;
        }
    }

    changed() {
        if (this.handleChanged) {
            this.handleChanged();
        }
    }

    onChanged(handle) {
        this.handleChanged = handle;
    }
}
