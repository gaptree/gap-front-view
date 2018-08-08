import {undefineObjProp} from './undefineObjProp';

const ignoreKey = '__opts';

export const fullUpdate = (res, inSrc) => {
    if (!(res instanceof Object)) {
        throw new Error('fullUpdate, 1st param require Object');
    }
    if (!(inSrc instanceof Object)) {
        throw new Error('fullUpdate, 2nd param require Object');
    }
    const src = Object.assign({}, inSrc);
    Object.keys(res).forEach(key => {
        if (key === ignoreKey) {
            return;
        }
        if (!src.hasOwnProperty(key)) {
            undefineObjProp(res, key);
            return;
        }
        res[key] = src[key];
        delete(src[key]);
    });

    Object.keys(src).forEach(key => {
        if (key === ignoreKey) {
            return;
        }
        res[key] = src[key];
    });
};
