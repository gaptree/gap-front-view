import {funHolder} from './funHolder';

export const objHolder = {
    hold: (obj) => {
        return '"' + Object.keys(obj).map(key => {
            const val = obj[key];
            if (typeof val === 'function') {
                return key + '|' + funHolder.holdWithoutWrap(val);
            } else if (typeof val === 'string') {
                return key + '|' + val;
            }

            throw new Error('error obj format for funHolder');
        }).join(';') + '"';
    }
};
/*
 * {
 *  a: 'str',
 *  fun: () => expr
 * }
 * "a|str;fun|$$1$$"
 */
