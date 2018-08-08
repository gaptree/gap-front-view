const funs = [];
let funIndex = 0;

const assertFun = (fun, msg = '') => {
    if (typeof fun !== 'function') {
        throw new Error(msg);
    }
};

const _hold = (fun, wrap = '"') => {
    assertFun(fun, 'funHolder.hold require function');
    funs[funIndex] = fun;
    return wrap + '$$' + funIndex++ + '$$' + wrap;
};

export const funHolder = {
    hold: (fun) => {
        return _hold(fun);
    },

    holdWithoutWrap: (fun) => {
        return _hold(fun, '');
    },

    get: (input) => {
        if (!input) {
            throw new Error('cannot be empty');
        }

        const index = parseInt(input.replace(/^"?\$\$|\$\$"?$/g, ''));
        if (isNaN(index)) {
            throw new Error('funHodler.get require "$$<num>$$", but received ' + input);
        }

        if (!funs[index]) {
            throw new Error('Cannot find fun with index of ' + index);
        }
        return funs[index];
    }
};

