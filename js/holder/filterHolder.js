import {funHolder} from './funHolder';

export const filterHolder = {
    hold: (filter) => {
        return '"' + Object.keys(filter).map(key => {
            const val = filter[key];
            if (typeof val === 'function') {
                return key + '|' + funHolder.holdWithoutWrap(val);
            } else if (typeof val === 'string') {
                return key + '|' + val;
            }

            throw new Error('error filter format for funHolder');
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
