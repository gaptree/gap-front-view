const nodes = [];
const funs = [];
const views = [];

let nodeIndex = 0;
let funIndex = 0;
let viewIndex = 0;

export const createNodeHolder = (node) => {
    nodes[nodeIndex] = node;
    return `<gap-node node-id="${nodeIndex++}"></gap-node>`;
};

export const getNode = (inputId) => {
    const id = parseInt(inputId);
    if (isNaN(id)) {
        throw new Error('Error tpl index format: ' + inputId);
    }
    return nodes[id];
};

export const createFunHolder = (fun, wrapper = '"') => {
    funs[funIndex] = fun;
    return wrapper + '$$' + funIndex++ + '$$' + wrapper;
};

export const getFun = (index) => {
    if (!index) {
        return null;
    }

    const arrIndex = parseInt(index.replace(/^"?\$\$|\$\$"?$/g, ''));
    if (isNaN(arrIndex)) {
        throw new Error('Error index format: ' + index);
    }
    return funs[arrIndex];
};

export const createObjHolder = (obj) => {
    return '"' + Object.keys(obj).map(key => {
        const val = obj[key];
        if (typeof val === 'function') {
            return key + '|' + createFunHolder(val, '');
        } else if (typeof val === 'string') {
            return key + '|' + val;
        }

        throw new Error('error obj format');
    }).join(';') + '"';
};

export const createViewHolder = (view) => {
    views[viewIndex] = view;
    return '"##' + viewIndex++ + '##"';
};

export const getView = (index) => {
    if (!index) {
        return null;
    }

    const arrIndex = parseInt(index.replace(/^"?##|##"?$/g, ''));
    if (isNaN(arrIndex)) {
        throw new Error('Error index format: ' + index);
    }
    return views[arrIndex];
};


export const createTextHolder = (inKey) => {
    const key = inKey.replace(/^"?|"?$/g, '');
    return `<gap-text bind="${key}"></gap-text>`;
};
