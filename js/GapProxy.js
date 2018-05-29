import {DescriptorWrap} from './DescriptorWrap';

export class GapProxy {
    constructor() {
        this.descriptorWraps = {};
    }

    getDescriptorWrap(prop) {
        if (this.descriptorWraps[prop]) {
            return this.descriptorWraps[prop];
        }

        const descriptorWrap = new DescriptorWrap();
        this.descriptorWraps[prop] = descriptorWrap;
        Object.defineProperty(this, prop, descriptorWrap.getDescriptor());

        return this.descriptorWraps[prop];
    }

    getProxy(prop) {
        if (this[prop]) {
            return this[prop];
        }

        this.getDescriptorWrap(prop)
            .setVal(new GapProxy());
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
}
