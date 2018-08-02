const objs = [];
let objIndex = 0;

const _hold = (obj, wrap = '"') => {
    objs[objIndex] = obj;
    return wrap + '%%' + objIndex++ + '%%' + wrap;
};

export const objHolder = {
    hold: (obj) => {
        return _hold(obj);
    },

    holdWithoutWrap: (obj) => {
        return _hold(obj, '');
    },
    get: (input) => {
        if (!input) {
            throw new Error('cannot be empty');
        }

        const index = parseInt(input.replace(/^"?%%|%%"?$/g, ''));
        if (isNaN(index)) {
            throw new Error('objHodler.get require "%%<num>%%", but received ' + input);
        }

        if (!objs[index]) {
            throw new Error('Cannot find fun with index of ' + index);
        }
        return objs[index];
    }
};
