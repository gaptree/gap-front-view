import {isDef} from '../lib/isDef';
import {View} from '../View';

const components = {};

export const componentHolder = {
    type: 'component',
    holdComponents: (componentsObj = {}) => {
        if (!isDef(componentsObj) || (typeof componentsObj !== 'object')) {
            throw new TypeError('returned value of function component should be an object');
        }

        for (let key in componentsObj) {
            componentHolder.hold(key.toLocaleLowerCase(), componentsObj[key]);
        }
    },

    hold: (id ,c) => {
        if (!(c.prototype instanceof View)) {
            throw new TypeError(`component ${id} must be instance of View`);
        }
        // replace the previous component with a new one when their ids is the same
        components[id.toLowerCase()] = c;
    },

    get: (id) => {
        if (!id) {
            throw new Error('component id cannot be empty');
        }

        return components[id];
    }
};
